<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { getShopProfit } from "@/api/douyin";
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

// 金额字段定义（渲染顺序，参照接口文档「利润表（店铺）」字段）
const amountColumns = [
  { prop: "taxIncludedAmount", label: "含税收入" },
  { prop: "taxExcludedAmount", label: "未税收入" },
  { prop: "totalFinancialCost", label: "外部采购成本" },
  { prop: "grossProfit", label: "毛利" },
  { prop: "businessTaxSurcharge", label: "营业税金及附加" },
  { prop: "logisticsCost", label: "物流成本" },
  { prop: "warehouseCost", label: "仓储损耗包材" },
  { prop: "platformFee", label: "平台费用" },
  { prop: "innerCommission", label: "佣金(站内)" },
  { prop: "channelInternalMarketing", label: "渠道站内营销费用" },
  { prop: "outerCommission", label: "渠道站外营销费用" },
  { prop: "shortVideoSubsidy", label: "短视频补贴" },
  { prop: "channelNetProfit", label: "渠道净利" }
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
    const res: any = await getShopProfit(params);
    const data = extractRows(res);
    // 按月份升序、店铺名升序排列
    data.sort((a: any, b: any) => {
      const monthCmp = (a.profitMonth || "").localeCompare(b.profitMonth || "");
      if (monthCmp !== 0) return monthCmp;
      return (a.shopName || "").localeCompare(b.shopName || "");
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
    // 后端业务异常（缺失参数 / 配置已删除等）message 直接透出
    ElMessage.error(error?.message || "加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 导出Excel
const exportToExcel = async () => {
  if (tableData.value.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("利润表(店铺)");

  const headers = [
    "月份",
    "店铺名",
    ...amountColumns.map(c => c.label),
    "净毛利率",
    "毛利率"
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
      row.profitMonth,
      row.shopName,
      ...amountColumns.map(c => {
        const v = row[c.prop];
        return v !== undefined && v !== null ? Number(v).toFixed(2) : "";
      }),
      row.netMargin !== undefined && row.netMargin !== null
        ? (Number(row.netMargin) * 100).toFixed(2) + "%"
        : "",
      row.grossMargin !== undefined && row.grossMargin !== null
        ? (Number(row.grossMargin) * 100).toFixed(2) + "%"
        : ""
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
    { width: 12 },
    { width: 20 },
    ...amountColumns.map(() => ({ width: 13 })),
    { width: 10 },
    { width: 10 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    "利润表店铺_" + dayjs().format("YYYYMMDDHHmmss") + ".xlsx"
  );
};
</script>

<template>
  <div class="shop-profit">
    <!-- 查询条件 -->
    <el-card class="search-card" shadow="never">
      <el-form
        :model="formData"
        :inline="true"
        class="peidi-shop-profit-search"
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
          利润表（店铺）
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
        <el-table-column prop="profitMonth" label="月份" width="110" fixed />
        <el-table-column
          prop="shopName"
          label="店铺名"
          width="160"
          fixed
          show-overflow-tooltip
        />
        <el-table-column
          v-for="col in amountColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          width="130"
        >
          <template #default="{ row }">
            <span
              v-if="col.prop === 'channelNetProfit'"
              :style="{ color: row.channelNetProfit < 0 ? '#f56c6c' : '' }"
            >
              {{ row[col.prop]?.toFixed(2) }}
            </span>
            <template v-else>
              {{ row[col.prop] !== undefined ? row[col.prop].toFixed(2) : "" }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="净毛利率" width="90">
          <template #default="{ row }">
            {{
              row.netMargin !== undefined && row.netMargin !== null
                ? (Number(row.netMargin) * 100).toFixed(2) + "%"
                : ""
            }}
          </template>
        </el-table-column>
        <el-table-column label="毛利率" width="90">
          <template #default="{ row }">
            {{
              row.grossMargin !== undefined && row.grossMargin !== null
                ? (Number(row.grossMargin) * 100).toFixed(2) + "%"
                : ""
            }}
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
.shop-profit {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.peidi-shop-profit-search .el-date-editor {
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
