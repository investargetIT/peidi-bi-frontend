<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  getWdtOrderDetailSalesSummary,
  postDyQianChuanSummary,
  type DyQianChuanSummaryItem
} from "@/api/douyin";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { Refresh, Download, Operation } from "@element-plus/icons-vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ConfigSelector from "../configSelector/index.vue";

// 默认日期：上个月月初到月末
const lastMonth = dayjs().subtract(1, "month");
const defaultStartDate = lastMonth.startOf("month").format("YYYY-MM-DD");
const defaultEndDate = lastMonth.endOf("month").format("YYYY-MM-DD");

// 表单数据（只剩日期范围，比例/自营名单/除数已下沉到配置，只传 configName）
const formData = reactive({
  startDate: defaultStartDate,
  endDate: defaultEndDate
});

// 配置名称（全局共享，存 localStorage）
const configName = ref(localStorage.getItem("douyin-active-config") || "");
// 当前选中配置详情（从配置接口回显，用于前端计算比例，含默认兜底）
const activeConfig = ref<any>(null);

// 从配置中取比例，缺省用默认值
const DEFAULT_RATIOS: Record<string, number> = {
  untaxedRatio: 1.09,
  logisticsRatio1: 0.0474,
  logisticsRatio2: 1.06,
  warehouseRatio: 0.04643,
  platformRatio1: 0.02226,
  platformRatio2: 1.06,
  qianChuanDivisor1: 1.06,
  qianChuanDivisor2: 1.01
};
// 内部 key -> 配置接口字段名 映射（配置字段：taxRate/platformFeeRatio1/qcDivisor1 等）
const RATIO_KEY_MAP: Record<string, string> = {
  untaxedRatio: "taxRate",
  logisticsRatio1: "logisticsRatio1",
  logisticsRatio2: "logisticsRatio2",
  warehouseRatio: "warehouseRatio",
  platformRatio1: "platformFeeRatio1",
  platformRatio2: "platformFeeRatio2"
};
const getRatio = (key: string): number => {
  const field = RATIO_KEY_MAP[key] ?? key;
  const v = activeConfig.value?.[field];
  return v !== undefined && v !== null ? Number(v) : DEFAULT_RATIOS[key];
};

// 千川投流汇总数据（按周分组）
const qianChuanSummaryData = ref<DyQianChuanSummaryItem[]>([]);

// 存储原始API数据
const rawData = ref<any[]>([]);
// 表格数据
const tableData = ref<any[]>([]);
// 合计行数据
const summaryData = ref<any>(null);
// loading状态
const loading = ref(false);

// 根据流量来源和业务类型获取千川投流金额（接口按周返回，跨周求和）
const getQianChuanAmount = (
  trafficFormatName: string,
  businessType: string
) => {
  return qianChuanSummaryData.value
    .filter(
      item =>
        item.flowSource === trafficFormatName && item.segment === businessType
    )
    .reduce((sum, item) => sum + (item.qianChuanCost || 0), 0);
};

// 计算单条数据的各项指标（比例取自当前选中的配置）
const calculateRowData = (item: any) => {
  const untaxedIncome = item.taxIncludedAmount / getRatio("untaxedRatio");
  const grossProfit = untaxedIncome - item.totalFinancialCost;
  const grossProfitRate =
    untaxedIncome !== 0
      ? ((grossProfit / untaxedIncome) * 100).toFixed(2) + "%"
      : "0%";
  const logisticsCost =
    (item.taxIncludedAmount * getRatio("logisticsRatio1")) /
    getRatio("logisticsRatio2");
  const warehouseCost = untaxedIncome * getRatio("warehouseRatio");
  const platformCost =
    (item.taxIncludedAmount * getRatio("platformRatio1")) /
    getRatio("platformRatio2");
  const qianChuanAmount = getQianChuanAmount(
    item.trafficFormatName,
    item.businessType
  );
  const qianChuanRatio =
    untaxedIncome !== 0 ? (qianChuanAmount / untaxedIncome) * 100 : 0;
  // 佣金 = 站内(totalA1) + 站外(totalContractAmount)；接口已给 brokerage 则直接使用
  const brokerage =
    (item.brokerage ?? (item.totalA1 || 0) + (item.totalContractAmount || 0)) ||
    0;
  // 渠道净毛利=毛利-（物流成本+仓储损耗包材+平台费用+佣金+千川投流）
  const channelNetGrossProfit =
    grossProfit -
    (logisticsCost +
      warehouseCost +
      platformCost +
      brokerage +
      qianChuanAmount);
  // 净毛利率=渠道净毛利/未税收入
  const netGrossProfitRate =
    untaxedIncome !== 0
      ? ((channelNetGrossProfit / untaxedIncome) * 100).toFixed(2) + "%"
      : "0%";

  // 紧凑的日期格式
  const formatCompactDate = (start: string, end: string) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    // 使用更紧凑的格式，去掉分隔符中的空格
    if (startDate.year() === endDate.year()) {
      return `${startDate.format("MM.DD")}-${endDate.format("MM.DD")}(${startDate.year()})`;
    }
    return `${startDate.format("MM.DD")}-${endDate.format("MM.DD")}`;
  };

  return {
    ...item,
    date: formatCompactDate(formData.startDate, formData.endDate),
    untaxedIncome,
    grossProfit,
    grossProfitRate,
    logisticsCost,
    warehouseCost,
    platformCost,
    brokerage,
    qianChuanAmount,
    qianChuanRatio,
    channelNetGrossProfit,
    netGrossProfitRate
  };
};

// 计算分组合计
const calculateGroupSummary = (
  groupName: string,
  filterFn: (item: any) => boolean,
  data: any[]
) => {
  const groupData = data.filter(filterFn);
  if (groupData.length === 0) return null;

  const totalTaxIncludedAmount = groupData.reduce(
    (sum, item) => sum + item.taxIncludedAmount,
    0
  );
  const totalUntaxedIncome = groupData.reduce(
    (sum, item) => sum + item.untaxedIncome,
    0
  );
  const totalFinancialCost = groupData.reduce(
    (sum, item) => sum + item.totalFinancialCost,
    0
  );
  const totalGrossProfit = groupData.reduce(
    (sum, item) => sum + item.grossProfit,
    0
  );
  const totalGrossProfitRate =
    totalUntaxedIncome !== 0
      ? ((totalGrossProfit / totalUntaxedIncome) * 100).toFixed(2) + "%"
      : "0%";
  const totalLogisticsCost = groupData.reduce(
    (sum, item) => sum + item.logisticsCost,
    0
  );
  const totalWarehouseCost = groupData.reduce(
    (sum, item) => sum + item.warehouseCost,
    0
  );
  const totalPlatformCost = groupData.reduce(
    (sum, item) => sum + item.platformCost,
    0
  );
  const totalBrokerage = groupData.reduce(
    (sum, item) => sum + (item.brokerage || 0),
    0
  );

  // 计算千川投流合计（接口按周返回，取对应的合计行跨周求和）
  let totalQianChuanAmount = 0;
  const trafficFormats = ["短视频", "商品卡", "直播"];
  const businessTypes = ["自营", "达播"];

  if (groupName === "合计") {
    // 总计：取接口返回的"合计"行跨周求和
    totalQianChuanAmount = qianChuanSummaryData.value
      .filter(item => item.flowSource === "合计")
      .reduce((sum, item) => sum + (item.qianChuanCost || 0), 0);
  } else if (trafficFormats.some(format => groupName.includes(format))) {
    // 按流量来源合计：取接口返回的"XX合计"行跨周求和
    const formatName = groupName.replace("合计", "");
    totalQianChuanAmount = qianChuanSummaryData.value
      .filter(item => item.flowSource === `${formatName}合计`)
      .reduce((sum, item) => sum + (item.qianChuanCost || 0), 0);
  } else if (businessTypes.some(type => groupName.includes(type))) {
    // 按业务类型合计：取接口返回的"XX合计"行跨周求和
    const typeName = groupName.replace("合计", "");
    totalQianChuanAmount = qianChuanSummaryData.value
      .filter(item => item.flowSource === `${typeName}合计`)
      .reduce((sum, item) => sum + (item.qianChuanCost || 0), 0);
  }

  const totalQianChuanRatio =
    totalUntaxedIncome !== 0
      ? (totalQianChuanAmount / totalUntaxedIncome) * 100
      : 0;

  // 渠道净毛利合计
  const totalChannelNetGrossProfit =
    totalGrossProfit -
    (totalLogisticsCost +
      totalWarehouseCost +
      totalPlatformCost +
      totalBrokerage +
      totalQianChuanAmount);
  // 净毛利率合计
  const totalNetGrossProfitRate =
    totalUntaxedIncome !== 0
      ? ((totalChannelNetGrossProfit / totalUntaxedIncome) * 100).toFixed(2) +
        "%"
      : "0%";

  return {
    date: groupName,
    trafficFormatName: "",
    businessType: "",
    taxIncludedAmount: totalTaxIncludedAmount,
    untaxedIncome: totalUntaxedIncome,
    totalFinancialCost: totalFinancialCost,
    grossProfit: totalGrossProfit,
    grossProfitRate: totalGrossProfitRate,
    logisticsCost: totalLogisticsCost,
    warehouseCost: totalWarehouseCost,
    platformCost: totalPlatformCost,
    brokerage: totalBrokerage,
    qianChuanAmount: totalQianChuanAmount,
    qianChuanRatio: totalQianChuanRatio,
    channelNetGrossProfit: totalChannelNetGrossProfit,
    netGrossProfitRate: totalNetGrossProfitRate,
    isSummary: true
  };
};

// 重新计算所有数据（不重新请求API）
const recalculateData = () => {
  // 重新计算各项指标
  const data = rawData.value.map(calculateRowData);

  // 构建完整的表格数据
  buildTableData(data);
};

// 构建表格数据
const buildTableData = (data: any[]) => {
  const fullTableData: any[] = [];

  // 如果没有数据，直接设置空数组并返回
  if (data.length === 0) {
    tableData.value = fullTableData;
    return;
  }

  // 按流量来源分组并添加各自的合计（合计行在前面）
  const trafficFormats = ["短视频", "商品卡", "直播", "其他"];
  trafficFormats.forEach(format => {
    const formatData = data.filter(item => item.trafficFormatName === format);
    if (formatData.length > 0) {
      // 添加该流量来源的合计
      const summary = calculateGroupSummary(
        `${format}合计`,
        item => item.trafficFormatName === format,
        data
      );
      if (summary) fullTableData.push(summary);
      // 添加该流量来源的所有数据，达播在上，自营在下
      const dabodata = formatData.filter(item => item.businessType === "达播");
      const ziyingdata = formatData.filter(
        item => item.businessType === "自营"
      );
      fullTableData.push(...dabodata, ...ziyingdata);
    }
  });

  // 添加按业务类型的合计，达播在上，自营在下
  const businessTypes = ["达播", "自营"];
  businessTypes.forEach(type => {
    const summary = calculateGroupSummary(
      `${type}合计`,
      item => item.businessType === type,
      data
    );
    if (summary) fullTableData.push(summary);
  });

  // 添加总计
  const totalSummary = calculateGroupSummary("合计", () => true, data);
  if (totalSummary) fullTableData.push(totalSummary);

  tableData.value = fullTableData;
};

// 加载数据（请求API，传 configName）
const loadData = async () => {
  if (!formData.startDate || !formData.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return;
  }
  if (formData.startDate > formData.endDate) {
    ElMessage.warning("开始日期不能晚于结束日期");
    return;
  }
  if (!configName.value) {
    ElMessage.warning("请先选择费用配置（configName）");
    return;
  }
  loading.value = true;
  try {
    // 先初始化参数
    const params: any = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      configName: configName.value
    };

    // 同时请求两个接口
    const [res1, res2] = await Promise.all([
      getWdtOrderDetailSalesSummary(params),
      postDyQianChuanSummary({
        dateStart: formData.startDate,
        dateEnd: formData.endDate,
        configName: configName.value
      })
    ]);

    if (res1.success) {
      // 保存原始数据（即使是空数组）
      rawData.value = res1.data || [];
    }

    if (res2.success) {
      // 保存千川投流汇总数据
      qianChuanSummaryData.value = res2.data || [];
    }

    // 计算并显示数据
    recalculateData();
  } catch (error) {
    console.error("加载数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  loadData();
});

// 配置详情变化时，用新配置的比例重新计算表格
const onConfigDetailChange = (detail: any) => {
  activeConfig.value = detail;
  recalculateData();
};

// 导出Excel
const exportToExcel = async () => {
  if (tableData.value.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("抖音周报");

  // 设置列标题
  const headers = [
    "日期",
    "流量来源",
    "自营/达播",
    "含税收入",
    "未税收入",
    "财务总成本",
    "毛利",
    "毛利率",
    "物流成本",
    "仓储损耗包材",
    "平台费用",
    "千川投流",
    "千川投流占比",
    "佣金",
    "渠道净毛利",
    "净毛利率"
  ];
  const headerRow = worksheet.addRow(headers);

  // 设置表头样式
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" }
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });

  // 添加数据行
  tableData.value.forEach(row => {
    const dataRow = worksheet.addRow([
      row.date,
      row.trafficFormatName,
      row.businessType,
      row.taxIncludedAmount !== undefined
        ? Number(row.taxIncludedAmount).toFixed(2)
        : "",
      row.untaxedIncome !== undefined
        ? Number(row.untaxedIncome).toFixed(2)
        : "",
      row.totalFinancialCost !== undefined
        ? Number(row.totalFinancialCost).toFixed(2)
        : "",
      row.grossProfit !== undefined ? Number(row.grossProfit).toFixed(2) : "",
      row.grossProfitRate,
      row.logisticsCost !== undefined
        ? Number(row.logisticsCost).toFixed(2)
        : "",
      row.warehouseCost !== undefined
        ? Number(row.warehouseCost).toFixed(2)
        : "",
      row.platformCost !== undefined ? Number(row.platformCost).toFixed(2) : "",
      row.qianChuanAmount !== undefined
        ? Number(row.qianChuanAmount).toFixed(2)
        : "",
      row.qianChuanRatio !== undefined
        ? Number(row.qianChuanRatio).toFixed(2) + "%"
        : "",
      row.brokerage !== undefined ? Number(row.brokerage).toFixed(2) : "",
      row.channelNetGrossProfit !== undefined
        ? Number(row.channelNetGrossProfit).toFixed(2)
        : "",
      row.netGrossProfitRate
    ]);

    // 设置单元格样式
    dataRow.eachCell(cell => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // 如果是合计行，设置特殊样式
    if (row.isSummary) {
      dataRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F5F7FA" }
        };
      });
    }
  });

  // 设置列宽
  worksheet.columns = [
    { width: 18 },
    { width: 10 },
    { width: 10 },
    { width: 11 },
    { width: 11 },
    { width: 11 },
    { width: 11 },
    { width: 9 },
    { width: 11 },
    { width: 12 },
    { width: 11 },
    { width: 11 },
    { width: 12 },
    { width: 11 },
    { width: 13 },
    { width: 11 }
  ];

  // 导出文件
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `抖音周报_${dayjs().format("YYYYMMDDHHmmss")}.xlsx`
  );
};

// 给合计行添加特殊样式
const getRowClassName = ({ row }: { row: any }) => {
  if (row.isSummary) {
    return "summary-row";
  }
  return "";
};
</script>

<template>
  <div class="douyin-report">
    <!-- 计算逻辑说明 -->
    <el-card class="note-card" shadow="never">
      <div class="calculation-note">
        <h4>计算逻辑说明</h4>
        <ul>
          <li>未税收入：含税收入 / 计算比例【未税收入】</li>
          <li>毛利：未税收入 - 财务总成本</li>
          <li>毛利率：毛利 / 未税收入</li>
          <li>
            物流成本：含税收入 * 计算比例【物流成本1】 / 计算比例【物流成本2】
          </li>
          <li>仓储损耗包材：未税收入 * 计算比例【仓储损耗包材】</li>
          <li>
            平台费用：含税收入 * 计算比例【平台费用1】 / 计算比例【平台费用2】
          </li>
          <li>佣金：接口返回的佣金数据</li>
          <li>千川投流：根据流量来源和自营/达播从千川投流汇总数据中获取</li>
          <li>千川投流占比：千川投流 / 未税收入</li>
          <li>
            渠道净毛利：毛利 - (物流成本 + 仓储损耗包材 + 平台费用 + 佣金 +
            千川投流)
          </li>
          <li>净毛利率：渠道净毛利 / 未税收入</li>
        </ul>
      </div>
    </el-card>

    <!-- 查询条件 -->
    <el-card class="search-card" shadow="never">
      <el-form
        :model="formData"
        :inline="true"
        class="peidi-douyin-report-search"
      >
        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" required>
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="费用配置">
          <ConfigSelector
            v-model="configName"
            @detail-change="onConfigDetailChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="loadData">
            <el-icon class="mr-[4px]"><Operation /></el-icon>
            处理
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <div class="flex justify-between items-center mb-[10px]">
        <div class="text-lg font-medium">抖音周报</div>
        <div>
          <el-button
            type="primary"
            :disabled="tableData.length === 0"
            color="#217346"
            @click="exportToExcel"
          >
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="date" label="日期" width="140" fixed />
        <el-table-column
          prop="trafficFormatName"
          label="流量来源"
          width="80"
          fixed
        />
        <el-table-column
          prop="businessType"
          label="自营/达播"
          width="80"
          fixed
        />
        <el-table-column prop="taxIncludedAmount" label="含税收入" width="110">
          <template #default="{ row }">
            {{ row.taxIncludedAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="未税收入" width="110">
          <template #default="{ row }">
            {{ row.untaxedIncome?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalFinancialCost"
          label="财务总成本"
          width="110"
        >
          <template #default="{ row }">
            {{ row.totalFinancialCost?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="毛利" width="110">
          <template #default="{ row }">
            {{ row.grossProfit?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="毛利率" width="90">
          <template #default="{ row }">
            {{ row.grossProfitRate }}
          </template>
        </el-table-column>
        <el-table-column label="物流成本" width="110">
          <template #default="{ row }">
            {{ row.logisticsCost?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="仓储损耗包材" width="130">
          <template #default="{ row }">
            {{ row.warehouseCost?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="平台费用" width="110">
          <template #default="{ row }">
            {{ row.platformCost?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="千川投流" width="110">
          <template #default="{ row }">
            {{ row.qianChuanAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="千川投流占比" width="120">
          <template #default="{ row }">
            {{
              row.qianChuanRatio !== undefined
                ? row.qianChuanRatio.toFixed(2) + "%"
                : ""
            }}
          </template>
        </el-table-column>
        <el-table-column label="佣金" width="110">
          <template #default="{ row }">
            {{ row.brokerage?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="渠道净毛利" width="130">
          <template #default="{ row }">
            <span
              :style="{ color: row.channelNetGrossProfit < 0 ? '#f56c6c' : '' }"
            >
              {{ row.channelNetGrossProfit?.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="净毛利率" width="110">
          <template #default="{ row }">
            {{ row.netGrossProfitRate }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.douyin-report {
  padding: 20px;
}

.note-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%);
  border: 1px solid #adc6ff;
  border-radius: 8px;
}

.note-card :deep(.el-card__body) {
  padding: 16px;
  background-color: transparent;
}

.calculation-note {
  font-size: 13px;
  color: #597ef7;
}

.calculation-note h4 {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #2f54eb;
}

.calculation-note h4::before {
  font-size: 16px;
  content: "ℹ️";
}

.calculation-note ul {
  padding-left: 20px;
  margin: 0;
}

.calculation-note li {
  margin-bottom: 4px;
  line-height: 2;
  color: #4e6ef2;
}

.search-card {
  margin-bottom: 20px;
}

/* 固定日期选择器宽度（参考 petProfiles 搜索栏） */
.peidi-douyin-report-search .el-date-editor {
  --el-date-editor-width: 220px;

  width: 220px;
}

.table-card {
  margin-top: 20px;
}

:deep(.summary-row) {
  font-weight: bold;
  background-color: #f5f7fa !important;
}

/* 调整表格整体字体大小 */
:deep(.el-table) {
  font-size: 12px;
}

/* 调整表格表头字体大小 */
:deep(.el-table th) {
  font-size: 12px;
}

/* 调整表格单元格字体大小 */
:deep(.el-table td) {
  font-size: 12px;
}

/* 达人ID输入框容器 */
.influencer-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.influencer-input-wrapper:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgb(64 158 255 / 20%);
}

/* 输入行布局 */
.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 带滚动条的标签容器 */
.tag-list-scroll {
  width: 100%;
  max-height: 100px;
  overflow: hidden auto;
}

/* 标签列表样式 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

/* 滚动条样式 */
.tag-list-scroll::-webkit-scrollbar {
  width: 6px;
}

.tag-list-scroll::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.tag-list-scroll::-webkit-scrollbar-track {
  background-color: #f5f7fa;
  border-radius: 3px;
}

/* 让输入框没有边框，与容器融合 */
.input-row :deep(.el-input__wrapper) {
  padding: 0;
  box-shadow: none;
}

.input-row :deep(.el-input) {
  flex: 1;
}
</style>
