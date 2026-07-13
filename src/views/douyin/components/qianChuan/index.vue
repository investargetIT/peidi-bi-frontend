<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Edit,
  Delete,
  Plus,
  Search,
  RefreshLeft,
  CirclePlus,
  Delete as DeleteIcon
} from "@element-plus/icons-vue";
import {
  getDyQianChuanPage,
  postDyQianChuanBatch,
  postDyQianChuanUpdate,
  postDyQianChuanDelete
} from "@/api/douyin";

// 计算一年中的第几周
const getWeekNumber = (dateStr: string): number => {
  const date = new Date(dateStr);
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

// 搜索表单数据
const searchForm = reactive({
  accountName: "",
  accountId: "",
  accountOwnership: undefined as number | undefined,
  businessType: undefined as number | undefined,
  dateStart: "",
  dateEnd: ""
});

// 月份选择的单独引用
const selectedMonth = ref<string>("");

// 监听月份变化，自动设置当月1号~当月最后一天
watch(selectedMonth, newVal => {
  if (newVal) {
    const year = Number(newVal.split("-")[0]);
    const month = Number(newVal.split("-")[1]);
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const lastDayStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    searchForm.dateStart = firstDay;
    searchForm.dateEnd = lastDayStr;
  } else {
    searchForm.dateStart = "";
    searchForm.dateEnd = "";
  }
});

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 对话框相关
const dialogVisible = ref(false);
const batchDialogVisible = ref(false);
const dialogTitle = ref("新增千川投流");
const isEdit = ref(false);
const currentRow = ref<any>(null);

// 单条表单数据
const formData = reactive({
  accountName: "",
  accountId: "",
  accountOwnership: undefined as number | undefined,
  businessType: undefined as number | undefined,
  date: "",
  deliveryAmount: undefined as number | undefined,
  weekNumber: undefined as number | undefined
});

// 批量新增表单数据
const batchFormData = ref<any[]>([]);

// 批量新增通用设置
const batchSettings = reactive({
  accountName: "",
  accountId: "",
  date: "",
  weekNumber: undefined as number | undefined
});

// 添加批量行
const addBatchRow = () => {
  batchFormData.value.push({
    accountOwnership: undefined as number | undefined,
    businessType: 2,
    deliveryAmount: undefined as number | undefined
  });
};

// 删除批量行
const removeBatchRow = (index: number) => {
  batchFormData.value.splice(index, 1);
};

// 打开批量新增对话框
const handleBatchAdd = () => {
  // 初始化批量表单
  batchFormData.value = [];
  Object.assign(batchSettings, {
    accountName: "",
    accountId: "",
    date: "",
    weekNumber: undefined
  });
  // 默认添加所有账号归属选项：直播(3)、短视频(1)、商品卡(2)，业务类型默认自营(2)
  [3, 1, 2].forEach(accountOwnership => {
    batchFormData.value.push({
      accountOwnership: accountOwnership,
      businessType: 2,
      deliveryAmount: undefined as number | undefined
    });
  });
  batchDialogVisible.value = true;
};

// 监听投放日期变化，自动计算周数
watch(
  () => formData.date,
  newVal => {
    if (newVal) {
      formData.weekNumber = getWeekNumber(newVal);
    }
  }
);

// 监听批量设置投放日期变化，自动计算周数
watch(
  () => batchSettings.date,
  newVal => {
    if (newVal) {
      batchSettings.weekNumber = getWeekNumber(newVal);
    }
  }
);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 构建参数，过滤空值，获取全量数据
    const params: any = {
      pageNum: 1,
      pageSize: 10000 // 大数字获取全量
    };

    if (searchForm.accountName) params.accountName = searchForm.accountName;
    if (searchForm.accountId) params.accountId = searchForm.accountId;
    if (searchForm.accountOwnership !== undefined)
      params.accountOwnership = searchForm.accountOwnership;
    if (searchForm.businessType !== undefined)
      params.businessType = searchForm.businessType;
    if (searchForm.dateStart) params.dateStart = searchForm.dateStart;
    if (searchForm.dateEnd) params.dateEnd = searchForm.dateEnd;

    const res: any = await getDyQianChuanPage(params);
    if (res.success) {
      // 优先按账号ID排序，其次按周数排序
      tableData.value = (res.data?.records || []).sort((a: any, b: any) => {
        const idCompare = (a.accountId || "").localeCompare(b.accountId || "");
        if (idCompare !== 0) return idCompare;
        return a.weekNumber - b.weekNumber;
      });
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
  if (!selectedMonth.value) {
    ElMessage.warning("请选择投放日期");
    return;
  }
  loadData();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    accountName: "",
    accountId: "",
    accountOwnership: undefined,
    businessType: undefined,
    dateStart: "",
    dateEnd: ""
  });
  // 重置为上个月
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const previousMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  selectedMonth.value = previousMonth;
  handleSearch();
};

// 打开新增对话框
const handleAdd = () => {
  dialogTitle.value = "新增千川投流";
  isEdit.value = false;
  currentRow.value = null;
  Object.assign(formData, {
    accountName: "",
    accountId: "",
    accountOwnership: undefined,
    businessType: undefined,
    date: "",
    deliveryAmount: undefined,
    weekNumber: undefined
  });
  dialogVisible.value = true;
};

// 打开编辑对话框
const handleEdit = (row: any) => {
  dialogTitle.value = "编辑千川投流";
  isEdit.value = true;
  currentRow.value = row;
  Object.assign(formData, {
    accountName: row.accountName,
    accountId: row.accountId,
    accountOwnership: row.accountOwnership,
    businessType: row.businessType,
    date: row.date,
    deliveryAmount: row.deliveryAmount,
    weekNumber: row.weekNumber
  });
  dialogVisible.value = true;
};

// 保存
const handleSave = async () => {
  try {
    let res: any;
    if (isEdit.value) {
      const updateData = {
        id: currentRow.value.id,
        ...formData
      };
      res = await postDyQianChuanUpdate([updateData]);
    } else {
      res = await postDyQianChuanBatch([formData]);
    }

    if (res.success) {
      ElMessage.success(isEdit.value ? "编辑成功" : "新增成功");
      dialogVisible.value = false;
      loadData();
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  }
};

// 批量保存
const handleBatchSave = async () => {
  try {
    // 验证数据
    if (!batchSettings.accountName) {
      ElMessage.error("请输入账号名称");
      return;
    }
    if (!batchSettings.accountId) {
      ElMessage.error("请输入账号ID");
      return;
    }
    if (!batchSettings.date) {
      ElMessage.error("请选择投放日期");
      return;
    }
    if (batchFormData.value.length === 0) {
      ElMessage.error("请至少添加一条数据");
      return;
    }

    for (let i = 0; i < batchFormData.value.length; i++) {
      const row = batchFormData.value[i];
      if (!row.accountOwnership) {
        ElMessage.error(`第${i + 1}行请选择账号归属`);
        return;
      }
      if (!row.businessType) {
        ElMessage.error(`第${i + 1}行请选择业务类型`);
        return;
      }
      if (row.deliveryAmount === undefined || row.deliveryAmount === null) {
        ElMessage.error(`第${i + 1}行请输入投放金额`);
        return;
      }
    }

    // 构建提交数据
    const submitData = batchFormData.value.map(row => ({
      accountName: batchSettings.accountName,
      accountId: batchSettings.accountId,
      accountOwnership: row.accountOwnership,
      businessType: row.businessType,
      date: batchSettings.date,
      deliveryAmount: row.deliveryAmount,
      weekNumber: batchSettings.weekNumber
    }));

    const res = await postDyQianChuanBatch(submitData);
    if (res.success) {
      ElMessage.success("批量新增成功");
      batchDialogVisible.value = false;
      loadData();
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } catch (error) {
    console.error("批量保存失败:", error);
    ElMessage.error("批量保存失败");
  }
};

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这条记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const res: any = await postDyQianChuanDelete(row.id);
    if (res.success) {
      ElMessage.success("删除成功");
      loadData();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

// 计算行合并
const spanMethod = ({ row, column, rowIndex }: any) => {
  if (column.property === "accountId") {
    // 找到当前账号ID的起始行和结束行
    let startRow = rowIndex;
    let endRow = rowIndex;
    while (
      startRow > 0 &&
      tableData.value[startRow - 1].accountId === row.accountId
    ) {
      startRow--;
    }
    while (
      endRow < tableData.value.length - 1 &&
      tableData.value[endRow + 1].accountId === row.accountId
    ) {
      endRow++;
    }
    const rowspan = endRow - startRow + 1;
    // 如果是起始行，返回rowspan，否则返回0（隐藏）
    if (rowIndex === startRow) {
      return {
        rowspan: rowspan,
        colspan: 1
      };
    } else {
      return {
        rowspan: 0,
        colspan: 0
      };
    }
  }
  if (column.property === "weekNumber") {
    // 找到当前账号ID和周数都相同的起始行和结束行
    let startRow = rowIndex;
    let endRow = rowIndex;
    while (
      startRow > 0 &&
      tableData.value[startRow - 1].accountId === row.accountId &&
      tableData.value[startRow - 1].weekNumber === row.weekNumber
    ) {
      startRow--;
    }
    while (
      endRow < tableData.value.length - 1 &&
      tableData.value[endRow + 1].accountId === row.accountId &&
      tableData.value[endRow + 1].weekNumber === row.weekNumber
    ) {
      endRow++;
    }
    const rowspan = endRow - startRow + 1;
    // 如果是起始行，返回rowspan，否则返回0（隐藏）
    if (rowIndex === startRow) {
      return {
        rowspan: rowspan,
        colspan: 1
      };
    } else {
      return {
        rowspan: 0,
        colspan: 0
      };
    }
  }
  // 其他列不合并
  return {
    rowspan: 1,
    colspan: 1
  };
};

// 初始化
onMounted(() => {
  // 默认选中上个月
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const previousMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  selectedMonth.value = previousMonth;
  loadData();
});
</script>

<template>
  <div class="qian-chuan">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="账号ID">
              <el-input
                v-model="searchForm.accountId"
                placeholder="请输入账号ID（精确查询）"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="账号名称">
              <el-input
                v-model="searchForm.accountName"
                placeholder="请输入账号名称（模糊查询）"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="账号归属">
              <el-select
                v-model="searchForm.accountOwnership"
                placeholder="请选择账号归属"
                clearable
                style="width: 100%"
              >
                <el-option label="短视频" :value="1" />
                <el-option label="商品卡" :value="2" />
                <el-option label="直播" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务类型">
              <el-select
                v-model="searchForm.businessType"
                placeholder="请选择业务类型"
                clearable
                style="width: 100%"
              >
                <el-option label="达播" :value="1" />
                <el-option label="自营" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="投放日期" required>
              <el-date-picker
                v-model="selectedMonth"
                type="month"
                placeholder="选择月份"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
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
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 表格卡片 -->
    <el-card class="table-card" shadow="never">
      <div class="flex justify-between items-center mb-[10px]">
        <div class="text-lg font-medium">千川投流列表</div>
        <div>
          <el-button type="primary" @click="handleBatchAdd">
            <el-icon><CirclePlus /></el-icon>
            批量新增
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            单条新增
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        :span-method="spanMethod"
        border
        style="width: 100%"
      >
        <el-table-column prop="accountId" label="账号ID" min-width="150" />
        <el-table-column prop="accountName" label="账号名称" min-width="150" />
        <el-table-column prop="weekNumber" label="周数" width="80">
          <template #default="{ row }"> 周{{ row.weekNumber }} </template>
        </el-table-column>
        <el-table-column
          prop="accountOwnershipName"
          label="账号归属"
          width="120"
        />
        <el-table-column prop="businessTypeName" label="业务类型" width="120" />
        <el-table-column prop="date" label="投放日期" width="120" />
        <el-table-column prop="deliveryAmount" label="投放金额(元)" width="150">
          <template #default="{ row }">
            {{ row.deliveryAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
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
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="账号ID" required>
          <el-input v-model="formData.accountId" placeholder="请输入账号ID" />
        </el-form-item>
        <el-form-item label="账号名称" required>
          <el-input
            v-model="formData.accountName"
            placeholder="请输入账号名称"
          />
        </el-form-item>
        <el-form-item label="账号归属" required>
          <el-select
            v-model="formData.accountOwnership"
            placeholder="请选择账号归属"
            style="width: 100%"
          >
            <el-option label="短视频" :value="1" />
            <el-option label="商品卡" :value="2" />
            <el-option label="直播" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型" required>
          <el-select
            v-model="formData.businessType"
            placeholder="请选择业务类型"
            style="width: 100%"
          >
            <el-option label="达播" :value="1" />
            <el-option label="自营" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="投放日期" required>
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="选择投放日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="投放金额" required>
          <el-input-number
            v-model="formData.deliveryAmount"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="周数">
          <el-input
            v-model="formData.weekNumber"
            disabled
            placeholder="自动计算"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量新增对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量新增千川投流"
      width="1000px"
      :close-on-click-modal="false"
    >
      <el-card class="batch-settings-card" shadow="never">
        <div class="text-sm font-medium mb-3">通用设置（所有行共用）</div>
        <el-form :model="batchSettings" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="账号ID" required>
                <el-input
                  v-model="batchSettings.accountId"
                  placeholder="请输入账号ID"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="账号名称" required>
                <el-input
                  v-model="batchSettings.accountName"
                  placeholder="请输入账号名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="投放日期" required>
                <el-date-picker
                  v-model="batchSettings.date"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="周数">
                <el-input
                  v-model="batchSettings.weekNumber"
                  disabled
                  placeholder="自动计算"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card class="batch-table-card" shadow="never" style="margin-top: 20px">
        <div class="flex justify-between items-center mb-3">
          <div class="text-sm font-medium">投放数据</div>
          <el-button type="primary" link @click="addBatchRow">
            <el-icon><CirclePlus /></el-icon>
            添加行
          </el-button>
        </div>
        <el-table :data="batchFormData" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column
            prop="accountOwnership"
            label="账号归属"
            min-width="150"
          >
            <template #default="{ row }">
              <el-select
                v-model="row.accountOwnership"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="短视频" :value="1" />
                <el-option label="商品卡" :value="2" />
                <el-option label="直播" :value="3" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="businessType" label="业务类型" min-width="120">
            <template #default="{ row }">
              <el-select
                v-model="row.businessType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="达播" :value="1" />
                <el-option label="自营" :value="2" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column
            prop="deliveryAmount"
            label="投放金额(元)"
            min-width="150"
          >
            <template #default="{ row }">
              <el-input-number
                v-model="row.deliveryAmount"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeBatchRow($index)">
                <el-icon><DeleteIcon /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSave">批量保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.qian-chuan {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-top: 20px;
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
  padding: 6px 0;
}

/* 间距样式 */
.text-lg {
  font-size: 16px;
}

.text-sm {
  font-size: 14px;
}

.font-medium {
  font-weight: 500;
}

.mb-3 {
  margin-bottom: 15px;
}

.batch-settings-card,
.batch-table-card {
  background-color: #f5f7fa;
}
</style>
