<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { getInfluencerProfit } from "@/api/douyin";
import dayjs from "dayjs";
import { Download, Search } from "@element-plus/icons-vue";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// 默认日期：上个月月初到月末
const lastMonth = dayjs().subtract(1, "month");
const defaultStartDate = lastMonth.startOf("month").format("YYYY-MM-DD");
const defaultEndDate = lastMonth.endOf("month").format("YYYY-MM-DD");

// 查询条件
const formData = reactive({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  selfOperatedInfluencerIds: ["1143971292653752", "2159871682941675"]
});

// 达人ID输入相关
const influencerInputValue = ref("");
const handleInfluencerInputConfirm = () => {
  const value = influencerInputValue.value.trim();
  if (value && !formData.selfOperatedInfluencerIds.includes(value)) {
    formData.selfOperatedInfluencerIds.push(value);
  }
  influencerInputValue.value = "";
};
const handleInfluencerInputKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    handleInfluencerInputConfirm();
  }
};
const removeInfluencerId = (index: number) => {
  formData.selfOperatedInfluencerIds.splice(index, 1);
};
const clearAllInfluencerIds = () => {
  formData.selfOperatedInfluencerIds = [];
};

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 分页（前端分页，先全量查询后本地分页）
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
const amountColumns = [
  { prop: "taxIncludedAmount", label: "含税收入" },
  { prop: "taxExcludedAmount", label: "未税收入" },
  { prop: "totalFinancialCost", label: "财务总成本" },
  { prop: "grossProfit", label: "毛利" },
  { prop: "qcLive", label: "千川推直播" },
  { prop: "qcProduct", label: "千川推商品" },
  { prop: "qcProductNoId", label: "千川推商品(无ID)" },
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

// 加载数据
const loadData = async () => {
  if (!formData.startDate || !formData.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return;
  }
  if (formData.startDate > formData.endDate) {
    ElMessage.warning("开始日期不能晚于结束日期");
    return;
  }
  loading.value = true;
  try {
    const params: any = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      // 全量查询：只取第1页并传足够大的每页条数
      pageNo: 1,
      pageSize: 9999999
    };
    // 需要限定达人ID时传入，否则传空数组（无达人ID的记录归为"无ID"）
    params.selfOperatedInfluencerIds = formData.selfOperatedInfluencerIds;
    const res: any = await getInfluencerProfit(params);
    if (res.success) {
      // 全量查询，前端分页
      const page = res.data || {};
      // 按日期升序、达人ID升序排列
      const data = ((page.records as any[]) || []).slice();
      data.sort((a: any, b: any) => {
        const dateCmp = (a.profitDate || "").localeCompare(b.profitDate || "");
        if (dateCmp !== 0) return dateCmp;
        return (a.influencerId || "").localeCompare(b.influencerId || "");
      });
      tableData.value = data;
      total.value = data.length;
      currentPage.value = 1;
      totalProfit.value = data.reduce(
        (sum: number, item: any) => sum + (item.taxIncludedAmount || 0),
        0
      );
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 导出Excel
const exportToExcel = async () => {
  if (tableData.value.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("利润表(达人)");

  const headers = [
    "利润日期",
    "达人ID",
    ...amountColumns.map(c => c.label),
    "毛利率",
    "净毛利率"
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
      row.influencerId,
      ...amountColumns.map(c => {
        const v = row[c.prop];
        return v !== undefined && v !== null ? Number(v).toFixed(2) : "";
      }),
      row.grossMargin !== undefined && row.grossMargin !== null
        ? (Number(row.grossMargin) * 100).toFixed(2) + "%"
        : "",
      row.netMargin !== undefined && row.netMargin !== null
        ? (Number(row.netMargin) * 100).toFixed(2) + "%"
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
    { width: 14 },
    { width: 20 },
    ...amountColumns.map(() => ({ width: 13 })),
    { width: 10 },
    { width: 10 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    "利润表达人_" + dayjs().format("YYYYMMDDHHmmss") + ".xlsx"
  );
};
</script>

<template>
  <div class="influencer-profit">
    <!-- 查询条件 -->
    <el-card class="search-card" shadow="never">
      <el-form label-width="120px">
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
            <el-form-item label="达人ID">
              <div class="influencer-input-wrapper">
                <div
                  v-if="formData.selfOperatedInfluencerIds.length > 0"
                  class="tag-list-scroll"
                >
                  <div class="tag-list">
                    <el-tag
                      v-for="(id, index) in formData.selfOperatedInfluencerIds"
                      :key="id"
                      closable
                      @close="removeInfluencerId(index)"
                    >
                      {{ id }}
                    </el-tag>
                  </div>
                </div>
                <div class="input-row">
                  <el-input
                    v-model="influencerInputValue"
                    placeholder="输入达人ID后按回车添加"
                    @keydown="handleInfluencerInputKeydown"
                    @blur="handleInfluencerInputConfirm"
                  />
                  <el-button
                    v-if="formData.selfOperatedInfluencerIds.length > 0"
                    type="danger"
                    size="small"
                    text
                    style="white-space: nowrap"
                    @click="clearAllInfluencerIds"
                  >
                    清除全部
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleSearch"
              >
                <el-icon><Search /></el-icon>
                查询
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <div class="flex justify-between items-center mb-[10px]">
        <div class="text-lg font-medium">
          利润表（达人）
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
        <el-table-column prop="influencerId" label="达人ID" width="160" fixed />
        <el-table-column
          v-for="col in amountColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          width="120"
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
        <el-table-column label="毛利率" width="90">
          <template #default="{ row }">
            {{
              row.grossMargin !== undefined && row.grossMargin !== null
                ? (Number(row.grossMargin) * 100).toFixed(2) + "%"
                : ""
            }}
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
.influencer-profit {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
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

/* 调整表格字体 */
:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table th),
:deep(.el-table td) {
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.2;
}

/* 表头文字居中 */
:deep(.el-table th.el-table__cell) {
  text-align: center;
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

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-list-scroll {
  width: 100%;
  max-height: 100px;
  overflow: hidden auto;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

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

.input-row :deep(.el-input__wrapper) {
  padding: 0;
  box-shadow: none;
}

.input-row :deep(.el-input) {
  flex: 1;
}
</style>
