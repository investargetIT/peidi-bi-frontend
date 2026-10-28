<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { getProductProfit } from "@/api/douyin";
import dayjs from "dayjs";
import { Download, Search } from "@element-plus/icons-vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ConfigSelector from "../configSelector/index.vue";

// 默认日期：上个月月初到月末
const lastMonth = dayjs().subtract(1, "month");
const defaultStartDate = lastMonth.startOf("month").format("YYYY-MM-DD");
const defaultEndDate = lastMonth.endOf("month").format("YYYY-MM-DD");

// 查询条件（只有日期范围，比例/自营名单已下沉到配置，只传 configId）
const formData = reactive({
  startDate: defaultStartDate,
  endDate: defaultEndDate
});

// 配置 id（全局共享，存 localStorage；非数字视为未选）
const configId = ref<number | string | null>(
  (() => {
    const raw = localStorage.getItem("douyin-active-config");
    if (!raw) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  })()
);

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 分页（前端分页，接口返回全量数组）
const currentPage = ref(1);
const pageSize = ref(50);
const total = ref(0);

// 当前页展示数据（前端分页切片）
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return tableData.value.slice(start, start + pageSize.value);
});

// 含税收入合计（全量数据合计）
const totalProfit = ref(0);

// 金额字段定义（渲染顺序）
type AmountColumn = { prop: string; label: string; rate?: boolean };
const amountColumns: AmountColumn[] = [
  { prop: "taxIncludedAmount", label: "含税收入" },
  { prop: "taxExcludedAmount", label: "未税收入" },
  { prop: "totalFinancialCost", label: "财务总成本" },
  { prop: "grossProfit", label: "毛利" },
  { prop: "netMargin", label: "净毛利率", rate: true },
  { prop: "grossMargin", label: "毛利率", rate: true },
  { prop: "qcLive", label: "千川推直播" },
  { prop: "qcProduct", label: "千川推商品" },
  { prop: "businessTaxSurcharge", label: "营业税金及附加" },
  { prop: "logisticsCost", label: "物流成本" },
  { prop: "warehouseCost", label: "仓储损耗包材" },
  { prop: "platformFee", label: "平台费用" },
  { prop: "innerCommission", label: "站内佣金" },
  { prop: "outerCommission", label: "站外佣金" },
  { prop: "channelNetProfit", label: "渠道净毛利" }
];

// 页码变化（前端分页，无需重新加载数据）
const handlePageChange = () => {
  if (loading.value) return;
};

// 每页条数变化时回到第一页
const handleSizeChange = () => {
  if (loading.value) return;
  currentPage.value = 1;
};

// 查询：回到第一页并加载
const handleSearch = () => {
  if (loading.value) return;
  currentPage.value = 1;
  loadData();
};

// 兼容多种返回结构，提取行数据（直接数组 / { data: [] } / { success, data: { records: [] } }）
const extractRows = (res: any): any[] => {
  if (!res) return [];
  const body = res.data !== undefined ? res.data : res;
  if (Array.isArray(body)) return body.slice();
  if (body && Array.isArray(body.records)) return body.records.slice();
  return [];
};

// 加载数据（接口返回全量数组，前端分页/排序）
const loadData = async () => {
  if (!formData.startDate || !formData.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return;
  }
  if (formData.startDate > formData.endDate) {
    ElMessage.warning("开始日期不能晚于结束日期");
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
    const params: any = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      configId: configId.value
    };
    const res: any = await getProductProfit(params);
    const data = extractRows(res);
    // 按日期升序、商品ID升序排列
    data.sort((a: any, b: any) => {
      const dateCmp = (a.profitDate || "").localeCompare(b.profitDate || "");
      if (dateCmp !== 0) return dateCmp;
      return (a.productId || "").localeCompare(b.productId || "");
    });
    tableData.value = data;
    total.value = data.length;
    currentPage.value = 1;
    totalProfit.value = data.reduce(
      (sum: number, item: any) => sum + (item.taxIncludedAmount || 0),
      0
    );
  } catch (error: any) {
    console.error("加载数据失败:", error);
    ElMessage.error(error?.message || "加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 导出Excel
const exportToExcel = async () => {
  if (tableData.value.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("利润表(商品)");

  const headers = [
    "利润日期",
    "商品ID",
    "商品名",
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
      row.profitDate,
      row.productId,
      row.productName,
      ...amountColumns.map(c => {
        const v = row[c.prop];
        if (v === undefined || v === null) return "";
        return c.rate
          ? (Number(v) * 100).toFixed(2) + "%"
          : Number(v).toFixed(2);
      })
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
    { width: 14 },
    { width: 20 },
    { width: 28 },
    ...amountColumns.map(c => ({ width: c.rate ? 10 : 13 }))
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    "利润表商品_" + dayjs().format("YYYYMMDDHHmmss") + ".xlsx"
  );
};
</script>

<template>
  <div class="product-profit">
    <!-- 查询条件 -->
    <el-card class="search-card" shadow="never">
      <el-form
        :model="formData"
        :inline="true"
        class="peidi-product-profit-search"
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
          <ConfigSelector v-model="configId" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <div class="flex justify-between items-center mb-[10px]">
        <div class="text-lg font-medium">
          利润表（商品）
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
        <el-table-column prop="profitDate" label="日期" width="120" fixed />
        <el-table-column prop="productId" label="商品ID" width="180" fixed />
        <el-table-column
          prop="productName"
          label="商品名"
          min-width="200"
          fixed
          show-overflow-tooltip
        />
        <el-table-column
          v-for="col in amountColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.rate ? 90 : 120"
        >
          <template #default="{ row }">
            <span
              v-if="col.prop === 'channelNetProfit'"
              :style="{ color: row.channelNetProfit < 0 ? '#f56c6c' : '' }"
            >
              {{ row[col.prop]?.toFixed(2) }}
            </span>
            <template v-else-if="col.rate">
              {{
                row[col.prop] !== undefined && row[col.prop] !== null
                  ? (Number(row[col.prop]) * 100).toFixed(2) + "%"
                  : ""
              }}
            </template>
            <template v-else>
              {{ row[col.prop] !== undefined ? row[col.prop].toFixed(2) : "" }}
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
          :page-sizes="[20, 50, 100, 200, 500]"
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
.product-profit {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.peidi-product-profit-search .el-date-editor {
  --el-date-editor-width: 220px;

  width: 220px;
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
