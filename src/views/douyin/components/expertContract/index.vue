<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Edit,
  Delete,
  Plus,
  Search,
  RefreshLeft,
  Money
} from "@element-plus/icons-vue";
import {
  getDyExpertContractPage,
  postDyExpertContractBatch,
  postDyExpertContractUpdate,
  postDyExpertContractDelete,
  getDyExpertContractSettlePreview,
  postDyExpertContractSettle,
  type DyContractRuleType,
  type DyExpertContractSaveReq,
  type DyExpertContractSettlePreviewItem,
  type DyExpertContractSettleResult
} from "@/api/douyin";
import dayjs from "dayjs";

interface RateRuleInput {
  min?: number;
  rate?: number;
}

// 搜索表单数据
const searchForm = reactive({
  expertNickname: "",
  douyinId: "",
  signingUnit: "",
  contractStartTimeStart: "",
  contractStartTimeEnd: "",
  contractEndTimeStart: "",
  contractEndTimeEnd: ""
});

// 日期范围的单独引用
const contractStartDateRange = ref<string[]>([]);
const contractEndDateRange = ref<string[]>([]);

// 监听合同起始时间范围变化
watch(contractStartDateRange, newVal => {
  if (newVal && newVal.length === 2) {
    searchForm.contractStartTimeStart = newVal[0];
    searchForm.contractStartTimeEnd = newVal[1];
  } else {
    searchForm.contractStartTimeStart = "";
    searchForm.contractStartTimeEnd = "";
  }
});

// 监听合同结束时间范围变化
watch(contractEndDateRange, newVal => {
  if (newVal && newVal.length === 2) {
    searchForm.contractEndTimeStart = newVal[0];
    searchForm.contractEndTimeEnd = newVal[1];
  } else {
    searchForm.contractEndTimeStart = "";
    searchForm.contractEndTimeEnd = "";
  }
});

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增达人合同");
const isEdit = ref(false);
const saveLoading = ref(false);

// 达人基础信息
const expertForm = reactive({
  settlementDarrenId: "",
  expertNickname: "",
  douyinId: "",
  signingUnit: "",
  contractStartTime: "",
  contractEndTime: ""
});

// 合同月份明细（编辑时回显）
const contractHistoryList = ref<any[]>([]);
const applyToAllMonths = ref(false);

// 月份规则编辑弹窗
const monthRuleDialogVisible = ref(false);
const monthRuleSaving = ref(false);
const monthRuleRow = ref<any>(null);

// 结算规则表单
const ruleForm = reactive<{
  taxRate?: number;
  ruleType: DyContractRuleType;
  fixedRate?: number;
  tieredRules: RateRuleInput[];
  ratio?: number;
}>({
  taxRate: 6,
  ruleType: "FIXED",
  fixedRate: undefined,
  tieredRules: [{ min: 0, rate: undefined }],
  ratio: undefined
});

// 结算相关
const settleMonth = ref(dayjs().subtract(1, "month").format("YYYY-MM"));
const settlePreviewVisible = ref(false);
const settlePreviewLoading = ref(false);
const settleSubmitting = ref(false);
const settlePreviewList = ref<DyExpertContractSettlePreviewItem[]>([]);
const settleForce = ref(false);
const settleResultVisible = ref(false);
const settleResult = ref<DyExpertContractSettleResult | null>(null);

const RULE_TYPE_LABELS: Record<DyContractRuleType, string> = {
  FIXED: "固定费率",
  TIERED: "阶梯档位",
  MANUAL: "人工比值"
};

const RULE_STATUS_MAP: Record<
  string,
  { label: string; type: "success" | "info" | "warning" | "primary" }
> = {
  COMPLETED: { label: "已结算", type: "success" },
  INHERITED: { label: "继承上月", type: "info" },
  PROVISIONAL: { label: "首月测算", type: "warning" },
  MANUAL: { label: "人工", type: "primary" }
};

const getRuleTypeLabel = (type?: string | null) =>
  type && type in RULE_TYPE_LABELS
    ? RULE_TYPE_LABELS[type as DyContractRuleType]
    : "-";

const getRuleStatus = (status?: string | null) =>
  status && RULE_STATUS_MAP[status]
    ? RULE_STATUS_MAP[status]
    : ({ label: "未生效", type: "info" } as const);

const formatRatio = (val: any) => {
  if (val === undefined || val === null || val === "") return "-";
  const num = Number(val);
  return Number.isNaN(num) ? "-" : num.toFixed(4);
};

const formatPercent = (val: any) => {
  if (val === undefined || val === null || val === "") return "-";
  const num = Number(val);
  return Number.isNaN(num) ? "-" : `${(num * 100).toFixed(2)}%`;
};

const formatTaxRate = (val: any) => {
  if (val === undefined || val === null || val === "") return "-";
  const num = Number(val);
  return Number.isNaN(num) ? "-" : `${num}%`;
};

const formatAmount = (val: any) => {
  if (val === undefined || val === null || val === "") return "-";
  const num = Number(val);
  return Number.isNaN(num)
    ? "-"
    : num.toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
};

const sortContracts = (list: any[]) =>
  [...list].sort((a, b) =>
    String(a?.executionDate || "").localeCompare(String(b?.executionDate || ""))
  );

// 分组顶部 latest* 字段优先，否则从 contractList 中取执行日期最新的一行
const latestField = (row: any, key: string) => {
  const list = Array.isArray(row?.contractList)
    ? sortContracts(row.contractList)
    : [];
  const latest = list.length ? list[list.length - 1] : null;
  const latestKey = `latest${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  const value = row?.[latestKey];
  return value === undefined || value === null || value === ""
    ? latest?.[key]
    : value;
};

// 当前编辑的月份行
const settleRowClassName = ({ row }: any) =>
  row?.dataReady === false ? "settle-row-unready" : "";

const hasUnreadyData = computed(() =>
  settlePreviewList.value.some(item => item?.dataReady === false)
);

const isSuccessResponse = (res: any) =>
  res === true ||
  res?.success === true ||
  Number(res?.code) === 200 ||
  res?.data === true;

const getResponseMessage = (res: any) => res?.msg || res?.message || "操作失败";

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.msg ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const extractResponseData = (res: any) => {
  if (
    res &&
    typeof res === "object" &&
    !Array.isArray(res) &&
    "data" in res &&
    res.data !== undefined
  ) {
    return res.data;
  }
  return res;
};

const extractResponseList = (res: any): any[] => {
  const data = extractResponseData(res);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.list)) return data.list;
  return [];
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 构建参数，过滤空值
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    };

    // 只添加有值的字段
    if (searchForm.expertNickname)
      params.expertNickname = searchForm.expertNickname;
    if (searchForm.douyinId) params.douyinId = searchForm.douyinId;
    if (searchForm.signingUnit) params.signingUnit = searchForm.signingUnit;
    if (searchForm.contractStartTimeStart)
      params.contractStartTimeStart = searchForm.contractStartTimeStart;
    if (searchForm.contractStartTimeEnd)
      params.contractStartTimeEnd = searchForm.contractStartTimeEnd;
    if (searchForm.contractEndTimeStart)
      params.contractEndTimeStart = searchForm.contractEndTimeStart;
    if (searchForm.contractEndTimeEnd)
      params.contractEndTimeEnd = searchForm.contractEndTimeEnd;

    const res: any = await getDyExpertContractPage(params);
    if (res.success) {
      tableData.value = res.data?.records || [];
      pagination.total = res.data?.total || 0;
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1;
  loadData();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    expertNickname: "",
    douyinId: "",
    signingUnit: "",
    contractStartTimeStart: "",
    contractStartTimeEnd: "",
    contractEndTimeStart: "",
    contractEndTimeEnd: ""
  });
  contractStartDateRange.value = [];
  contractEndDateRange.value = [];
  handleSearch();
};

// 分页变化
const handleCurrentChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  loadData();
};

const resetRuleForm = () => {
  ruleForm.taxRate = 6;
  ruleForm.ruleType = "FIXED";
  ruleForm.fixedRate = undefined;
  ruleForm.tieredRules = [{ min: 0, rate: undefined }];
  ruleForm.ratio = undefined;
};

const loadRuleFormFromContract = (contract: any) => {
  ruleForm.taxRate = contract?.taxRate ?? 6;

  const type = contract?.ruleType;
  if (type === "FIXED" || type === "TIERED" || type === "MANUAL") {
    ruleForm.ruleType = type;
  } else {
    // 兼容旧数据：没有 ruleType 但有 ratio 时按人工比值处理
    ruleForm.ruleType =
      contract?.ratio !== undefined && contract?.ratio !== null
        ? "MANUAL"
        : "FIXED";
  }

  const rules = Array.isArray(contract?.rateRule) ? contract.rateRule : [];
  if (ruleForm.ruleType === "FIXED") {
    const taxFactor = 1 + (Number(ruleForm.taxRate) || 0) / 100;
    ruleForm.fixedRate =
      rules[0]?.rate ??
      (contract?.ratio !== undefined && contract?.ratio !== null
        ? Number((Number(contract.ratio) * taxFactor).toFixed(4))
        : undefined);
  } else if (ruleForm.ruleType === "TIERED") {
    ruleForm.tieredRules = rules.length
      ? rules.map(rule => ({
          min: Number(rule.min),
          rate: Number(rule.rate)
        }))
      : [{ min: 0, rate: undefined }];
  } else {
    ruleForm.ratio = contract?.ratio;
  }
};

const addTieredRule = () => {
  if (ruleForm.tieredRules.length >= 5) {
    ElMessage.warning("结算规则最多 5 档");
    return;
  }
  const last = ruleForm.tieredRules[ruleForm.tieredRules.length - 1];
  ruleForm.tieredRules.push({
    min: (last?.min ?? 0) + 10000,
    rate: last?.rate
  });
};

const removeTieredRule = (index: number) => {
  if (ruleForm.tieredRules.length <= 1) {
    ElMessage.warning("至少保留一档");
    return;
  }
  ruleForm.tieredRules.splice(index, 1);
};

const isValidRate = (val?: number) =>
  typeof val === "number" && !Number.isNaN(val) && val >= 0 && val <= 1;

const isValidTaxRate = (val?: number) =>
  typeof val === "number" && !Number.isNaN(val) && val >= 0 && val <= 100;

const validateRuleForm = (): boolean => {
  if (!isValidTaxRate(ruleForm.taxRate)) {
    ElMessage.warning("税率应在 0~100 之间（百分数）：6 表示 6%");
    return false;
  }

  if (ruleForm.ruleType === "FIXED") {
    if (!isValidRate(ruleForm.fixedRate)) {
      ElMessage.warning("比例应在 0~1 之间（0.05 表示 5%）");
      return false;
    }
    return true;
  }

  if (ruleForm.ruleType === "TIERED") {
    const rules = ruleForm.tieredRules;
    if (!rules.length) {
      ElMessage.warning("结算规则至少需要一组：销售额阈值 + 比例");
      return false;
    }
    if (rules.length > 5) {
      ElMessage.warning("结算规则最多 5 档");
      return false;
    }
    let prevMin = -Infinity;
    for (const rule of rules) {
      if (
        rule.min === undefined ||
        rule.min === null ||
        rule.min < 0 ||
        !isValidRate(rule.rate)
      ) {
        ElMessage.warning("请填写完整的销售额阈值和比例（比例 0~1）");
        return false;
      }
      if (rule.min <= prevMin) {
        ElMessage.warning("销售额阈值必须严格递增");
        return false;
      }
      prevMin = rule.min;
    }
    return true;
  }

  if (!isValidRate(ruleForm.ratio)) {
    ElMessage.warning("人工比值应在 0~1 之间（0.2096 表示 20.96%）");
    return false;
  }
  return true;
};

const buildRulePayload = () => {
  if (ruleForm.ruleType === "FIXED") {
    return {
      ruleType: "FIXED" as const,
      rateRule: [{ min: 0, rate: Number(ruleForm.fixedRate) }]
    };
  }
  if (ruleForm.ruleType === "TIERED") {
    return {
      ruleType: "TIERED" as const,
      rateRule: ruleForm.tieredRules.map(rule => ({
        min: Number(rule.min),
        rate: Number(rule.rate)
      }))
    };
  }
  return {
    ruleType: "MANUAL" as const,
    ratio: Number(ruleForm.ratio)
  };
};

const formatRulePreview = (rule: {
  ruleType: DyContractRuleType;
  rateRule?: { min: number; rate: number }[];
  ratio?: number;
}) => {
  if (rule.ruleType === "FIXED") {
    return `实际销售额 × ${formatPercent(rule.rateRule?.[0]?.rate)}`;
  }
  if (rule.ruleType === "TIERED") {
    return (rule.rateRule || [])
      .map(item => `≥${formatAmount(item.min)} → ${formatPercent(item.rate)}`)
      .join("；");
  }
  return `人工比值 ${formatRatio(rule.ratio)}`;
};

// 打开新增对话框
const handleAdd = () => {
  dialogTitle.value = "新增达人合同";
  isEdit.value = false;
  Object.assign(expertForm, {
    settlementDarrenId: "",
    expertNickname: "",
    douyinId: "",
    signingUnit: "",
    contractStartTime: "",
    contractEndTime: ""
  });
  contractHistoryList.value = [];
  applyToAllMonths.value = false;
  resetRuleForm();
  dialogVisible.value = true;
};

// 打开编辑对话框
const handleEdit = (row: any) => {
  dialogTitle.value = "编辑达人合同";
  isEdit.value = true;
  const contracts = sortContracts(row.contractList || []);
  const latest = contracts.length ? contracts[contracts.length - 1] : null;
  Object.assign(expertForm, {
    settlementDarrenId: row.settlementDarrenId,
    expertNickname: row.expertNickname,
    douyinId: row.douyinId,
    signingUnit: row.signingUnit || "",
    contractStartTime:
      row.latestContractStartTime || latest?.contractStartTime || "",
    contractEndTime: row.latestContractEndTime || latest?.contractEndTime || ""
  });
  contractHistoryList.value = contracts;
  applyToAllMonths.value = false;
  dialogVisible.value = true;
};

const handleViewHistory = (row: any) => {
  handleEdit(row);
};

// 打开月份规则编辑弹窗
const openMonthRuleDialog = (row: any) => {
  if (!row?.id) {
    ElMessage.warning("该月份暂无可编辑的合同记录");
    return;
  }
  monthRuleRow.value = row;
  applyToAllMonths.value = false;
  loadRuleFormFromContract(row);
  monthRuleDialogVisible.value = true;
};

// 新增合同保存
const handleSave = async () => {
  if (!expertForm.settlementDarrenId?.trim()) {
    ElMessage.warning("请输入结算达人UID");
    return;
  }
  if (!expertForm.contractStartTime || !expertForm.contractEndTime) {
    ElMessage.warning("请填写合同起止时间");
    return;
  }
  if (expertForm.contractStartTime > expertForm.contractEndTime) {
    ElMessage.warning("合同结束时间不能早于开始时间");
    return;
  }
  if (!validateRuleForm()) return;

  const payloadItem: DyExpertContractSaveReq = {
    settlementDarrenId: expertForm.settlementDarrenId.trim(),
    expertNickname: expertForm.expertNickname,
    douyinId: expertForm.douyinId,
    signingUnit: expertForm.signingUnit,
    contractStartTime: expertForm.contractStartTime,
    contractEndTime: expertForm.contractEndTime,
    taxRate: Number(ruleForm.taxRate),
    ...buildRulePayload()
  };

  saveLoading.value = true;
  try {
    const res: any = await postDyExpertContractBatch([payloadItem]);
    if (!isSuccessResponse(res)) {
      ElMessage.error(getResponseMessage(res));
      return;
    }
    ElMessage.success("新增成功，已按合同周期生成每月记录");
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    console.error("保存失败:", error);
    ElMessage.error(getErrorMessage(error, "保存失败"));
  } finally {
    saveLoading.value = false;
  }
};

// 保存单月结算规则
const handleSaveMonthRule = async () => {
  const row = monthRuleRow.value;
  if (!row?.id) {
    ElMessage.warning("该月份暂无可编辑的合同记录");
    return;
  }
  if (!validateRuleForm()) return;

  const payloadItem: DyExpertContractSaveReq = {
    id: row.id,
    settlementDarrenId: expertForm.settlementDarrenId.trim(),
    expertNickname: expertForm.expertNickname,
    douyinId: expertForm.douyinId,
    signingUnit: expertForm.signingUnit,
    contractStartTime: expertForm.contractStartTime,
    contractEndTime: expertForm.contractEndTime,
    executionDate: row.executionDate,
    sortOrder: row.sortOrder ?? 0,
    taxRate: Number(ruleForm.taxRate),
    ...buildRulePayload()
  };
  if (applyToAllMonths.value) {
    payloadItem.applyToAllMonths = true;
  }

  monthRuleSaving.value = true;
  try {
    const res: any = await postDyExpertContractUpdate([payloadItem]);
    if (!isSuccessResponse(res)) {
      ElMessage.error(getResponseMessage(res));
      return;
    }

    const ruleSnapshot = {
      taxRate: payloadItem.taxRate,
      ruleType: payloadItem.ruleType,
      rateRule: payloadItem.rateRule,
      ratio: payloadItem.ratio,
      settlementRule: formatRulePreview(payloadItem)
    };
    if (applyToAllMonths.value) {
      contractHistoryList.value.forEach(item =>
        Object.assign(item, ruleSnapshot)
      );
    } else {
      Object.assign(row, ruleSnapshot);
    }

    monthRuleDialogVisible.value = false;
    ElMessage.success(
      applyToAllMonths.value ? "已更新整份合同" : "已更新当前月份规则"
    );
    loadData();
  } catch (error: any) {
    console.error("保存月份规则失败:", error);
    ElMessage.error(getErrorMessage(error, "保存失败"));
  } finally {
    monthRuleSaving.value = false;
  }
};

// 删除合同（后端接口为单行逻辑删除）
const handleDelete = async (row: any) => {
  const latest = sortContracts(row?.contractList || []).pop();
  const deleteId = row?.latestContractId ?? latest?.id;
  if (!deleteId) {
    ElMessage.warning("未找到可删除的合同记录");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要删除该达人最新一条合同记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const res: any = await postDyExpertContractDelete(deleteId);
    if (isSuccessResponse(res)) {
      ElMessage.success("删除成功");
      loadData();
    } else {
      ElMessage.error(getResponseMessage(res));
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(getErrorMessage(error, "删除失败"));
    }
  }
};

// 结算预览
const handleSettlePreview = async () => {
  if (!settleMonth.value) {
    ElMessage.warning("请选择结算月份");
    return;
  }

  settlePreviewLoading.value = true;
  try {
    const res: any = await getDyExpertContractSettlePreview({
      month: settleMonth.value
    });
    const list = extractResponseList(
      res
    ) as DyExpertContractSettlePreviewItem[];
    if (!list.length) {
      ElMessage.warning(`该月没有达人合同行：${settleMonth.value}`);
      return;
    }
    settlePreviewList.value = list;
    settleForce.value = false;
    settlePreviewVisible.value = true;
  } catch (error: any) {
    console.error("获取结算预览失败:", error);
    ElMessage.error(getErrorMessage(error, "获取结算预览失败"));
  } finally {
    settlePreviewLoading.value = false;
  }
};

// 执行结算
const handleSettleSubmit = async () => {
  if (hasUnreadyData.value && !settleForce.value) {
    ElMessage.warning("该月数据未齐备，可勾选强制结算");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认结算 ${settleMonth.value} 吗？`,
      "确认结算（1/2）",
      {
        confirmButtonText: "下一步",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    await ElMessageBox.confirm(
      "再次确认：结算会按整月销售额重算并覆盖当前比值，同时自动继承到下个月，是否继续？",
      "确认结算（2/2）",
      {
        confirmButtonText: "仍要结算",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
  } catch {
    return;
  }

  settleSubmitting.value = true;
  try {
    const res: any = await postDyExpertContractSettle({
      month: settleMonth.value,
      force: settleForce.value
    });
    const data = extractResponseData(res);
    const success =
      res === true ||
      res?.success === true ||
      Number(res?.code) === 200 ||
      (data && typeof data === "object" && "settledCount" in data);

    if (!success) {
      ElMessage.error(getResponseMessage(res));
      return;
    }

    settleResult.value =
      data && typeof data === "object"
        ? data
        : {
            month: settleMonth.value,
            dataReady: !hasUnreadyData.value,
            settledCount: 0,
            skippedCount: 0
          };
    settlePreviewVisible.value = false;
    settleResultVisible.value = true;
    ElMessage.success("结算完成");
    loadData();
  } catch (error: any) {
    console.error("结算失败:", error);
    ElMessage.error(getErrorMessage(error, "结算失败"));
  } finally {
    settleSubmitting.value = false;
  }
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="expert-contract">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form
        :model="searchForm"
        :inline="true"
        class="peidi-expert-contract-search"
      >
        <el-form-item label="达人昵称">
          <el-input
            v-model="searchForm.expertNickname"
            placeholder="请输入达人昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="抖音号">
          <el-input
            v-model="searchForm.douyinId"
            placeholder="请输入抖音号"
            clearable
          />
        </el-form-item>
        <el-form-item label="签约单位">
          <el-input
            v-model="searchForm.signingUnit"
            placeholder="请输入签约单位"
            clearable
          />
        </el-form-item>
        <el-form-item label="合同起始时间">
          <el-date-picker
            v-model="contractStartDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="合同结束时间">
          <el-date-picker
            v-model="contractEndDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格卡片 -->
    <el-card class="table-card" shadow="never">
      <div class="flex justify-between items-center mb-[10px]">
        <div class="text-lg font-medium">达人合同列表</div>
        <div class="table-actions">
          <el-date-picker
            v-model="settleMonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="结算月份"
            :clearable="false"
            class="settle-month"
          />
          <el-button
            :loading="settlePreviewLoading"
            @click="handleSettlePreview"
          >
            <el-icon><Money /></el-icon>
            结算
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增达人合同
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <!-- 展开行列 -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <div class="mb-2 font-medium">合同月份明细：</div>
              <el-table
                :data="sortContracts(row.contractList || [])"
                border
                style="width: 100%"
              >
                <el-table-column type="index" label="#" width="60" />
                <el-table-column
                  prop="executionDate"
                  label="归属月份"
                  width="120"
                />
                <el-table-column label="规则类型" width="100">
                  <template #default="{ row: contract }">
                    {{ getRuleTypeLabel(contract.ruleType) }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="110">
                  <template #default="{ row: contract }">
                    <el-tag
                      :type="getRuleStatus(contract.ruleStatus).type"
                      size="small"
                    >
                      {{ getRuleStatus(contract.ruleStatus).label }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="比值" width="100">
                  <template #default="{ row: contract }">
                    {{ formatRatio(contract.ratio) }}
                  </template>
                </el-table-column>
                <el-table-column label="税率" width="80">
                  <template #default="{ row: contract }">
                    {{ formatTaxRate(contract.taxRate) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="settlementRule"
                  label="结算规则"
                  min-width="180"
                  show-overflow-tooltip
                />
                <el-table-column label="取档销售额" width="140">
                  <template #default="{ row: contract }">
                    {{ formatAmount(contract.computedBaseSales) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createdAt"
                  label="创建时间"
                  width="170"
                />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="expertNickname" label="达人昵称" width="150" />
        <el-table-column prop="douyinId" label="抖音号" width="150" />
        <el-table-column
          prop="settlementDarrenId"
          label="结算达人UID"
          width="180"
        />
        <el-table-column prop="signingUnit" label="签约单位" width="150" />
        <el-table-column label="最新合同时间" width="230">
          <template #default="{ row }">
            <div>
              <div>起始: {{ row.latestContractStartTime }}</div>
              <div>结束: {{ row.latestContractEndTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结算规则" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ latestField(row, "settlementRule") || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="比值" width="100">
          <template #default="{ row }">
            {{ formatRatio(latestField(row, "ratio")) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag
              :type="getRuleStatus(latestField(row, 'ruleStatus')).type"
              size="small"
            >
              {{ getRuleStatus(latestField(row, "ruleStatus")).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contractCount" label="合同数量" width="100" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1000px"
      :close-on-click-modal="false"
    >
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="text-lg font-medium">基础信息</div>
        </template>
        <el-form :model="expertForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="结算达人UID" required>
                <el-input
                  v-model="expertForm.settlementDarrenId"
                  placeholder="请输入结算达人UID"
                  :disabled="isEdit"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="达人昵称">
                <el-input
                  v-model="expertForm.expertNickname"
                  placeholder="请输入达人昵称"
                  :disabled="isEdit"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="抖音号">
                <el-input
                  v-model="expertForm.douyinId"
                  placeholder="请输入抖音号"
                  :disabled="isEdit"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="签约单位">
                <el-input
                  v-model="expertForm.signingUnit"
                  placeholder="请输入签约单位"
                  :disabled="isEdit"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同起始时间" required>
                <el-date-picker
                  v-model="expertForm.contractStartTime"
                  type="date"
                  placeholder="选择起始日期"
                  value-format="YYYY-MM-DD"
                  :disabled="isEdit"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同结束时间" required>
                <el-date-picker
                  v-model="expertForm.contractEndTime"
                  type="date"
                  placeholder="选择结束日期"
                  value-format="YYYY-MM-DD"
                  :disabled="isEdit"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="text-lg font-medium">结算规则</div>
            <div v-if="isEdit" class="text-sm text-gray-500">
              共 {{ contractHistoryList.length }} 个月份，点击行尾图标编辑规则
            </div>
          </div>
        </template>

        <template v-if="!isEdit">
          <el-form :model="ruleForm" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="开票税率">
                  <el-input-number
                    v-model="ruleForm.taxRate"
                    :min="0"
                    :max="100"
                    :precision="2"
                    :step="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
                <div class="form-tip">百分数，6 表示 6%</div>
              </el-col>
              <el-col :span="16">
                <el-form-item label="规则类型">
                  <el-radio-group v-model="ruleForm.ruleType">
                    <el-radio-button value="FIXED">固定费率</el-radio-button>
                    <el-radio-button value="TIERED">阶梯档位</el-radio-button>
                    <el-radio-button value="MANUAL">人工比值</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item v-if="ruleForm.ruleType === 'FIXED'" label="固定费率">
              <el-input-number
                v-model="ruleForm.fixedRate"
                :min="0"
                :max="1"
                :precision="4"
                :step="0.01"
                controls-position="right"
                style="width: 220px"
              />
              <span class="rate-tip">
                实际销售额 × {{ formatPercent(ruleForm.fixedRate) }}
              </span>
            </el-form-item>

            <el-form-item
              v-else-if="ruleForm.ruleType === 'TIERED'"
              label="阶梯档位"
            >
              <div class="tiered-rules">
                <div
                  v-for="(rule, index) in ruleForm.tieredRules"
                  :key="index"
                  class="tiered-row"
                >
                  <span>销售额 ≥</span>
                  <el-input-number
                    v-model="rule.min"
                    :min="0"
                    :precision="2"
                    :step="1000"
                    controls-position="right"
                    class="tiered-input"
                  />
                  <span>元 → 费率</span>
                  <el-input-number
                    v-model="rule.rate"
                    :min="0"
                    :max="1"
                    :precision="4"
                    :step="0.01"
                    controls-position="right"
                    class="tiered-input"
                  />
                  <el-button
                    type="danger"
                    link
                    :disabled="ruleForm.tieredRules.length <= 1"
                    @click="removeTieredRule(index)"
                  >
                    删除
                  </el-button>
                </div>
                <el-button
                  type="primary"
                  link
                  :disabled="ruleForm.tieredRules.length >= 5"
                  @click="addTieredRule"
                >
                  + 增加档位（最多 5 档）
                </el-button>
                <div class="form-tip">
                  费率填小数，0.05 表示 5%；阈值必须严格递增
                </div>
              </div>
            </el-form-item>

            <el-form-item v-else label="人工比值">
              <el-input-number
                v-model="ruleForm.ratio"
                :min="0"
                :max="1"
                :precision="4"
                :step="0.01"
                controls-position="right"
                style="width: 220px"
              />
              <span class="rate-tip">0.2096 表示 20.96%</span>
            </el-form-item>
          </el-form>

          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="保存后后端会按合同起止时间自动展开为每月一行，无需手动逐月添加。"
            class="mt-4"
          />
        </template>

        <div v-else class="contract-history">
          <div class="mb-2 font-medium">
            合同月份明细（点击行尾图标编辑该月规则）
          </div>
          <el-table :data="contractHistoryList" border style="width: 100%">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column
              prop="executionDate"
              label="归属月份"
              width="120"
            />
            <el-table-column label="规则类型" width="100">
              <template #default="{ row }">
                {{ getRuleTypeLabel(row.ruleType) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="getRuleStatus(row.ruleStatus).type" size="small">
                  {{ getRuleStatus(row.ruleStatus).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="比值" width="100">
              <template #default="{ row }">
                {{ formatRatio(row.ratio) }}
              </template>
            </el-table-column>
            <el-table-column label="税率" width="80">
              <template #default="{ row }">
                {{ formatTaxRate(row.taxRate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="settlementRule"
              label="结算规则"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-tooltip content="编辑此月规则" placement="top">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="openMonthRuleDialog(row)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ isEdit ? "关闭" : "取消" }}
        </el-button>
        <el-button
          v-if="!isEdit"
          type="primary"
          :loading="saveLoading"
          @click="handleSave"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 单月结算规则编辑 -->
    <el-dialog
      v-model="monthRuleDialogVisible"
      :title="`编辑结算规则 - ${monthRuleRow?.executionDate || ''}`"
      width="680px"
      :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" label-width="110px">
        <el-form-item label="开票税率">
          <el-input-number
            v-model="ruleForm.taxRate"
            :min="0"
            :max="100"
            :precision="2"
            :step="1"
            controls-position="right"
            style="width: 220px"
          />
          <span class="rate-tip">百分数，6 表示 6%</span>
        </el-form-item>

        <el-form-item label="规则类型">
          <el-radio-group v-model="ruleForm.ruleType">
            <el-radio-button value="FIXED">固定费率</el-radio-button>
            <el-radio-button value="TIERED">阶梯档位</el-radio-button>
            <el-radio-button value="MANUAL">人工比值</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="ruleForm.ruleType === 'FIXED'" label="固定费率">
          <el-input-number
            v-model="ruleForm.fixedRate"
            :min="0"
            :max="1"
            :precision="4"
            :step="0.01"
            controls-position="right"
            style="width: 220px"
          />
          <span class="rate-tip">
            实际销售额 × {{ formatPercent(ruleForm.fixedRate) }}
          </span>
        </el-form-item>

        <el-form-item
          v-else-if="ruleForm.ruleType === 'TIERED'"
          label="阶梯档位"
        >
          <div class="tiered-rules">
            <div
              v-for="(rule, index) in ruleForm.tieredRules"
              :key="index"
              class="tiered-row"
            >
              <span>销售额 ≥</span>
              <el-input-number
                v-model="rule.min"
                :min="0"
                :precision="2"
                :step="1000"
                controls-position="right"
                class="tiered-input"
              />
              <span>元 → 费率</span>
              <el-input-number
                v-model="rule.rate"
                :min="0"
                :max="1"
                :precision="4"
                :step="0.01"
                controls-position="right"
                class="tiered-input"
              />
              <el-button
                type="danger"
                link
                :disabled="ruleForm.tieredRules.length <= 1"
                @click="removeTieredRule(index)"
              >
                删除
              </el-button>
            </div>
            <el-button
              type="primary"
              link
              :disabled="ruleForm.tieredRules.length >= 5"
              @click="addTieredRule"
            >
              + 增加档位（最多 5 档）
            </el-button>
            <div class="form-tip">
              费率填小数，0.05 表示 5%；阈值必须严格递增
            </div>
          </div>
        </el-form-item>

        <el-form-item v-else label="人工比值">
          <el-input-number
            v-model="ruleForm.ratio"
            :min="0"
            :max="1"
            :precision="4"
            :step="0.01"
            controls-position="right"
            style="width: 220px"
          />
          <span class="rate-tip">0.2096 表示 20.96%</span>
        </el-form-item>

        <el-form-item label="应用范围">
          <el-checkbox v-model="applyToAllMonths">
            应用到整份合同（所有月份）
          </el-checkbox>
          <span class="rate-tip">默认只更新当前月份</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="monthRuleDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="monthRuleSaving"
          @click="handleSaveMonthRule"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 结算预览对话框 -->
    <el-dialog
      v-model="settlePreviewVisible"
      :title="`结算预览 - ${settleMonth}`"
      width="1200px"
      :close-on-click-modal="false"
    >
      <el-alert
        v-if="hasUnreadyData"
        type="warning"
        :closable="false"
        show-icon
        title="该月存在数据未齐备的达人，勾选“强制结算”后才能按现有数据结算。"
        class="mb-4"
      />

      <el-table
        v-loading="settlePreviewLoading"
        :data="settlePreviewList"
        border
        max-height="460"
        style="width: 100%"
        :row-class-name="settleRowClassName"
      >
        <el-table-column
          prop="expertNickname"
          label="达人昵称"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="settlementDarrenId"
          label="结算达人UID"
          width="170"
          show-overflow-tooltip
        />
        <el-table-column prop="executionDate" label="归属月份" width="110" />
        <el-table-column label="规则类型" width="100">
          <template #default="{ row }">
            {{ getRuleTypeLabel(row.ruleType) }}
          </template>
        </el-table-column>
        <el-table-column label="销售额" width="130" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.salesAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="落档费率" width="100" align="right">
          <template #default="{ row }">
            {{ formatPercent(row.rate) }}
          </template>
        </el-table-column>
        <el-table-column label="当前比值" width="100" align="right">
          <template #default="{ row }">
            {{ formatRatio(row.currentRatio) }}
          </template>
        </el-table-column>
        <el-table-column label="结算后比值" width="110" align="right">
          <template #default="{ row }">
            {{ formatRatio(row.ratio) }}
          </template>
        </el-table-column>
        <el-table-column label="数据齐备" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.dataReady ? 'success' : 'danger'" size="small">
              {{ row.dataReady ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否结算" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.willSettle ? 'success' : 'info'" size="small">
              {{ row.willSettle ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="skipReason"
          label="跳过原因"
          min-width="180"
          show-overflow-tooltip
        />
      </el-table>

      <template #footer>
        <div class="settle-footer">
          <el-checkbox v-model="settleForce">
            强制结算（数据未齐备时按现有数据结算）
          </el-checkbox>
          <div>
            <el-button @click="settlePreviewVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="settleSubmitting"
              :disabled="hasUnreadyData && !settleForce"
              @click="handleSettleSubmit"
            >
              确定结算
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 结算结果 -->
    <el-dialog v-model="settleResultVisible" title="结算完成" width="560px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="结算月份">
          {{ settleResult?.month }}
        </el-descriptions-item>
        <el-descriptions-item label="数据齐备">
          {{ settleResult?.dataReady ? "是" : "否" }}
        </el-descriptions-item>
        <el-descriptions-item label="成功结算">
          {{ settleResult?.settledCount ?? 0 }} 条
        </el-descriptions-item>
        <el-descriptions-item label="跳过">
          {{ settleResult?.skippedCount ?? 0 }} 条
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="settleResult?.skipped?.length" class="skipped-list">
        <div class="font-medium mb-2">跳过明细</div>
        <ul>
          <li v-for="(item, index) in settleResult.skipped" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>

      <template #footer>
        <el-button type="primary" @click="settleResultVisible = false">
          知道了
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.expert-contract {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

/* 固定搜索栏控件宽度（参考 petProfiles 搜索栏） */
.peidi-expert-contract-search .el-input {
  --el-input-width: 200px;
}

.peidi-expert-contract-search .el-date-editor--daterange {
  --el-date-editor-width: 340px;

  width: 340px;
}

.table-card {
  margin-top: 20px;
}

.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.settle-month {
  width: 130px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 表格字体变小 */
:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table th),
:deep(.el-table td) {
  padding: 8px 0;
  font-size: 12px;
}

/* 间距样式 */
.mb-4 {
  margin-bottom: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.text-lg {
  font-size: 16px;
}

.font-medium {
  font-weight: 500;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rate-tip {
  margin-left: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tiered-rules {
  width: 100%;
}

.tiered-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.tiered-input {
  width: 170px;
}

.contract-history {
  margin-top: 16px;
}

/* 当前编辑月份高亮 */
:deep(.current-contract-row) td {
  background-color: var(--el-color-primary-light-9) !important;
}

/* 结算预览：数据未齐备行标红 */
:deep(.settle-row-unready) td {
  background-color: var(--el-color-danger-light-9) !important;
}

.settle-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.skipped-list {
  margin-top: 16px;
  font-size: 13px;
}

.skipped-list ul {
  padding-left: 18px;
}

/* 展开内容样式 */
.expand-content {
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
