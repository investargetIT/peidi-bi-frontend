<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { getDyAssessment } from "@/api/douyin";
import dayjs from "dayjs";
import { Download, Search } from "@element-plus/icons-vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ConfigSelector from "../configSelector/index.vue";

// 默认月份：上个月（接口按月取数）
const lastMonth = dayjs().subtract(1, "month");
const defaultMonth = lastMonth.format("YYYY-MM");

// 查询条件：月份 + 费用配置（比例/自营达人名单已下沉到配置，只传 configId）
const formData = reactive({
  yearMonth: defaultMonth
});

// 配置 id（与其它 tab 共享，存 localStorage；非数字视为未选）
const configId = ref<number | string | null>(
  (() => {
    const raw = localStorage.getItem("douyin-active-config");
    if (!raw) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  })()
);

// 表格数据（接口返回全量数组）
const tableData = ref<any[]>([]);
const loading = ref(false);

// 分页（前端分页）
const currentPage = ref(1);
const pageSize = ref(50);
const total = ref(0);

// 当前页展示数据
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return tableData.value.slice(start, start + pageSize.value);
});

const totalProfit = ref(0);

// 金额列（顺序与人工表「抖音考核」sheet 一致：E→Q 列）
type AmountColumn = { prop: string; label: string; rate?: boolean };
const amountColumns: AmountColumn[] = [
  { prop: "taxIncludedAmount", label: "含税收入" },
  { prop: "taxExcludedAmount", label: "未税收入" },
  { prop: "totalFinancialCost", label: "财务总成本" },
  { prop: "grossProfit", label: "毛利" },
  { prop: "grossMargin", label: "毛利率", rate: true },
  { prop: "logisticsCost", label: "物流成本" },
  { prop: "warehouseCost", label: "仓储损耗包材" },
  { prop: "platformFee", label: "平台费用" },
  { prop: "commission", label: "佣金" },
  { prop: "qianChuanCost", label: "千川投流" },
  { prop: "qianChuanRatio", label: "千川投流占比", rate: true },
  { prop: "channelNetProfit", label: "渠道净毛利" },
  { prop: "netMargin", label: "净毛利率", rate: true }
];

// 金额格式化（空值显示空，避免 0 与"无数据"混淆）
const fmtMoney = (v: any) =>
  v === undefined || v === null ? "" : Number(v).toFixed(2);
const fmtRate = (v: any) =>
  v === undefined || v === null ? "" : (Number(v) * 100).toFixed(2) + "%";

const handlePageChange = () => {
  if (loading.value) return;
};
const handleSizeChange = () => {
  if (loading.value) return;
  currentPage.value = 1;
};
const handleSearch = () => {
  if (loading.value) return;
  currentPage.value = 1;
  loadData();
};

// 兼容多种返回结构
const extractRows = (res: any): any[] => {
  if (!res) return [];
  const body = res.data !== undefined ? res.data : res;
  if (Array.isArray(body)) return body.slice();
  if (body && Array.isArray(body.records)) return body.records;
  return [];
};

// 店铺顺序与人工表一致
const SHOP_ORDER = [
  "杭州-抖音-meatyway爵宴宠物食品旗舰店",
  "杭州-抖音-smartbones专卖店",
  "杭州-抖音-佩蒂旗舰店",
  "杭州-抖音-好适嘉旗舰店",
  "杭州-抖音-爵宴旗舰店"
];
// 流量来源顺序：直播 / 短视频 / 商品卡 / 其他
const TRAFFIC_ORDER = ["直播", "短视频", "商品卡", "其他"];
const BIZ_ORDER = ["自营", "达播"];

const loadData = async () => {
  if (!formData.yearMonth) {
    ElMessage.warning("请选择月份");
    return;
  }
  if (
    configId.value === null ||
    configId.value === undefined ||
    configId.value === ""
  ) {
    ElMessage.warning("请先选择费用配置");
    return;
  }
  loading.value = true;
  try {
    const res: any = await getDyAssessment({
      yearMonth: formData.yearMonth,
      configId: configId.value
    });
    const data = extractRows(res);
    // 按 店铺 → 自营/达播 → 流量来源 排序，与人工表行序一致
    data.sort((a: any, b: any) => {
      const si =
        SHOP_ORDER.indexOf(a.shopName) - SHOP_ORDER.indexOf(b.shopName);
      if (si !== 0) return si;
      const bi =
        BIZ_ORDER.indexOf(a.businessType) - BIZ_ORDER.indexOf(b.businessType);
      if (bi !== 0) return bi;
      return (
        TRAFFIC_ORDER.indexOf(a.trafficFormatName) -
        TRAFFIC_ORDER.indexOf(b.trafficFormatName)
      );
    });
    tableData.value = data;
    total.value = data.length;
    currentPage.value = 1;
    totalProfit.value = data.reduce(
      (sum: number, item: any) => sum + (item.taxIncludedAmount || 0),
      0
    );
  } catch (error: any) {
    console.error("加载抖音考核数据失败:", error);
    ElMessage.error(error?.message || "加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 导出 Excel
const exportToExcel = async () => {
  if (tableData.value.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("抖音考核");

  const headers = [
    "店铺",
    "月数",
    "自营/达播",
    "流量来源",
    ...amountColumns.map(c => c.label)
  ];
  const headerRow = worksheet.addRow(headers);
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

  tableData.value.forEach(row => {
    const dataRow = worksheet.addRow([
      row.shopName,
      row.month,
      row.businessType,
      row.trafficFormatName,
      ...amountColumns.map(c =>
        c.rate ? fmtRate(row[c.prop]) : fmtMoney(row[c.prop])
      )
    ]);
    dataRow.eachCell(cell => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  worksheet.columns = [
    { width: 34 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    ...amountColumns.map(c => ({ width: c.rate ? 13 : 14 }))
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    "抖音考核_" + dayjs().format("YYYYMMDDHHmmss") + ".xlsx"
  );
};
</script>

<template>
  <div class="dy-assessment">
    <!-- 查询条件 -->
    <el-card class="search-card" shadow="never">
      <el-form
        :model="formData"
        :inline="true"
        class="peidi-dy-assessment-search"
      >
        <el-form-item label="月份" required>
          <el-date-picker
            v-model="formData.yearMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            :clearable="false"
            class="month-picker"
          />
        </el-form-item>
        <el-form-item label="费用配置">
          <ConfigSelector v-model="configId" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            <el-icon><Search /></el-icon>
            处理
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <div class="flex justify-between items-center mb-[10px]">
        <div class="text-lg font-medium">
          抖音考核
          <span class="ml-4 text-base font-normal text-primary">
            含税收入合计(元):
            <strong>{{ totalProfit.toFixed(2) }}</strong>
          </span>
        </div>
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
        :data="pagedData"
        border
        size="small"
        style="width: 100%"
        height="600"
      >
        <el-table-column
          prop="shopName"
          label="店铺"
          width="190"
          fixed
          show-overflow-tooltip
        />
        <el-table-column prop="month" label="月数" width="95" fixed />
        <el-table-column
          prop="businessType"
          label="自营/达播"
          width="95"
          fixed
        />
        <el-table-column
          prop="trafficFormatName"
          label="流量来源"
          width="95"
          fixed
        />
        <el-table-column
          v-for="col in amountColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.rate ? 105 : 125"
        >
          <template #default="{ row }">
            <span
              v-if="col.prop === 'channelNetProfit'"
              :style="{ color: row.channelNetProfit < 0 ? '#f56c6c' : '' }"
            >
              {{ fmtMoney(row[col.prop]) }}
            </span>
            <template v-else-if="col.rate">
              {{ fmtRate(row[col.prop]) }}
            </template>
            <template v-else>
              {{ fmtMoney(row[col.prop]) }}
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 前端分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          :disabled="loading"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dy-assessment {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.month-picker {
  --el-date-editor-width: 180px;

  width: 180px;
}

.table-card {
  margin-top: 20px;
}

.text-lg {
  font-size: 16px;
}

.text-base {
  font-size: 14px;
}

.text-primary {
  color: #409eff;
}

.ml-4 {
  margin-left: 16px;
}

.font-medium {
  font-weight: 500;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table th),
:deep(.el-table td) {
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.2;
}

:deep(.el-table th.el-table__cell) {
  text-align: center;
}
</style>
