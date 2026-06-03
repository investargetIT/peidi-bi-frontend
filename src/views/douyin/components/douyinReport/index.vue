<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getWdtOrderDetailSalesSummary } from "@/api/douyin";
import dayjs from "dayjs";
import { Refresh, Download } from "@element-plus/icons-vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// 表单数据
const formData = reactive({
  startDate: "2026-01-01",
  endDate: "2026-02-01",
  selfOperatedInfluencerIds:
    "1143971292653752,2159871682941675,247837613127280",
  untaxedRatio: 1.09, // 未税收入计算比例
  logisticsRatio1: 0.0474, // 物流成本计算比例1
  logisticsRatio2: 1.06, // 物流成本计算比例2
  warehouseRatio: 0.04643, // 仓储损耗包材计算比例
  platformRatio1: 0.02226, // 平台费用计算比例1
  platformRatio2: 1.06 // 平台费用计算比例2
});

// 存储原始API数据
const rawData = ref<any[]>([]);
// 表格数据
const tableData = ref<any[]>([]);
// 合计行数据
const summaryData = ref<any>(null);
// loading状态
const loading = ref(false);

// 计算单条数据的各项指标
const calculateRowData = (item: any) => {
  const untaxedIncome = item.taxIncludedAmount / Number(formData.untaxedRatio);
  const grossProfit = untaxedIncome - item.totalFinancialCost;
  const grossProfitRate =
    grossProfit !== 0
      ? ((untaxedIncome / grossProfit) * 100).toFixed(2) + "%"
      : "0%";
  const logisticsCost =
    (item.taxIncludedAmount * Number(formData.logisticsRatio1)) /
    Number(formData.logisticsRatio2);
  const warehouseCost = untaxedIncome * Number(formData.warehouseRatio);
  const platformCost =
    (item.taxIncludedAmount * Number(formData.platformRatio1)) /
    Number(formData.platformRatio2);

  return {
    ...item,
    date: `${formData.startDate} ~ ${formData.endDate}`,
    untaxedIncome,
    grossProfit,
    grossProfitRate,
    logisticsCost,
    warehouseCost,
    platformCost
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
    totalGrossProfit !== 0
      ? ((totalUntaxedIncome / totalGrossProfit) * 100).toFixed(2) + "%"
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
    isSummary: true
  };
};

// 重新计算所有数据（不重新请求API）
const recalculateData = () => {
  if (rawData.value.length === 0) return;

  // 重新计算各项指标
  const data = rawData.value.map(calculateRowData);

  // 构建完整的表格数据
  buildTableData(data);
};

// 构建表格数据
const buildTableData = (data: any[]) => {
  const fullTableData: any[] = [];

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
      // 添加该流量来源的所有数据
      fullTableData.push(...formatData);
    }
  });

  // 添加按业务类型的合计
  const businessTypes = ["自营", "达播"];
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

// 加载数据（请求API）
const loadData = async () => {
  loading.value = true;
  try {
    // 先初始化参数
    const params: any = {
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    // 处理达人ID列表
    const ids: string[] = [];
    if (formData.selfOperatedInfluencerIds) {
      const parsedIds = formData.selfOperatedInfluencerIds
        .split(",")
        .map(id => id.trim())
        .filter(Boolean);
      ids.push(...parsedIds);
    }
    // 无论有没有ID，都加一个空值
    ids.push("");
    params.selfOperatedInfluencerIds = ids;

    const res: any = await getWdtOrderDetailSalesSummary(params);
    if (res.success && res.data) {
      // 保存原始数据
      rawData.value = res.data;
      // 计算并显示数据
      recalculateData();
    }
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
    "平台费用"
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
      row.platformCost !== undefined ? Number(row.platformCost).toFixed(2) : ""
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
    { width: 25 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 10 },
    { width: 12 },
    { width: 14 },
    { width: 12 }
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
          <li>毛利：含税收入 - 财务总成本</li>
          <li>毛利率：未税收入 / 毛利</li>
          <li>
            物流成本：含税收入 * 计算比例【物流成本1】 / 计算比例【物流成本2】
          </li>
          <li>仓储损耗包材：未税收入 * 计算比例【仓储损耗包材】</li>
          <li>
            平台费用：含税收入 * 计算比例【平台费用1】 / 计算比例【平台费用2】
          </li>
        </ul>
      </div>
    </el-card>

    <!-- 查询条件 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="formData" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="达人ID列表">
              <el-input
                v-model="formData.selfOperatedInfluencerIds"
                placeholder="多个达人ID用逗号分隔"
              />
              <div style=" margin-top: -10px; font-size: 12px;color: #909399">
                多个达人ID用逗号分隔
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 计算比例 -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="未税收入比例">
              <el-input-number
                v-model="formData.untaxedRatio"
                :min="0"
                :precision="3"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="物流成本比例1">
              <el-input-number
                v-model="formData.logisticsRatio1"
                :min="0"
                :precision="4"
                :step="0.001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="物流成本比例2">
              <el-input-number
                v-model="formData.logisticsRatio2"
                :min="0"
                :precision="3"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="仓储损耗比例">
              <el-input-number
                v-model="formData.warehouseRatio"
                :min="0"
                :precision="5"
                :step="0.0001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="平台费用比例1">
              <el-input-number
                v-model="formData.platformRatio1"
                :min="0"
                :precision="5"
                :step="0.0001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="平台费用比例2">
              <el-input-number
                v-model="formData.platformRatio2"
                :min="0"
                :precision="3"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="loadData">
                处理
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
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
        <el-table-column prop="date" label="日期" />
        <el-table-column
          prop="trafficFormatName"
          label="流量来源"
          width="120"
        />
        <el-table-column prop="businessType" label="自营/达播" width="120" />
        <el-table-column prop="taxIncludedAmount" label="含税收入" width="120">
          <template #default="{ row }">
            {{ row.taxIncludedAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="未税收入" width="120">
          <template #default="{ row }">
            {{ row.untaxedIncome?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalFinancialCost"
          label="财务总成本"
          width="120"
        >
          <template #default="{ row }">
            {{ row.totalFinancialCost?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="毛利" width="120">
          <template #default="{ row }">
            {{ row.grossProfit?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="毛利率" width="100">
          <template #default="{ row }">
            {{ row.grossProfitRate }}
          </template>
        </el-table-column>
        <el-table-column label="物流成本" width="120">
          <template #default="{ row }">
            {{ row.logisticsCost?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="仓储损耗包材" width="140">
          <template #default="{ row }">
            {{ row.warehouseCost?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="平台费用" width="120">
          <template #default="{ row }">
            {{ row.platformCost?.toFixed(2) }}
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
}

.calculation-note {
  font-size: 12px;
  color: #666;
}

.calculation-note h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #333;
}

.calculation-note ul {
  padding-left: 20px;
  margin: 0;
}

.calculation-note li {
  line-height: 1.8;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-top: 20px;
}

:deep(.summary-row) {
  font-weight: bold;
  background-color: #f5f7fa !important;
}
</style>
