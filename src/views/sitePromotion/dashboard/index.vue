<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import {
  getBiAdsProductPromotionDaily,
  getAdsProductPromotionDailSummary
} from "@/api/sitePromotion";
import { dayjs, ElMessage, FormInstance } from "element-plus";
import SummaryCard from "./summaryCard.vue";

const summaryTableData = ref([]);
const tableData = ref([]);
const pagination = ref({
  pageNo: 1,
  pageSize: 10,
  pageTotal: 0
});

//#region 排序相关
// 请求的排序参数
const sortStr = ref<{ sortName: string; sortType: string }[]>([
  {
    sortName: "costAmount",
    sortType: "desc"
  }
]);
// 处理排序事件
function handleSortChange(column: any) {
  // console.log("column", column);
  // 处理排序逻辑
  if (column.column.sortable === "custom") {
    // 自定义排序逻辑
    // 这里可以根据 column.prop 来判断是哪个列在排序
    // 并根据 column.order 来判断排序方向（ascending 或 descending）
    // 最后更新表格数据即可
    if (!column.order) {
      sortStr.value = [];
    }
    if (column.order === "descending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "desc"
        }
      ];
    }
    if (column.order === "ascending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "asc"
        }
      ];
    }
    fetchAdsProductPromotionDaily();
  }
}
//#endregion

//#region 搜索相关
const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  date: null,
  productLine: "",
  productShortName: "",
  productId: ""
});

const formatSearchStr = () => {
  const searchStr = [];

  if (searchForm.date && searchForm.date.length === 2) {
    searchStr.push({
      searchName: "date",
      searchType: "betweenStr",
      searchValue: [
        dayjs(searchForm.date[0]).format("YYYY-MM-DD 00:00:00"),
        dayjs(searchForm.date[1]).format("YYYY-MM-DD 23:59:59")
      ].join(",")
    });
  }
  if (searchForm.productLine) {
    searchStr.push({
      searchName: "productLine",
      searchType: "like",
      searchValue: searchForm.productLine
    });
  }
  if (searchForm.productShortName) {
    searchStr.push({
      searchName: "productShortName",
      searchType: "like",
      searchValue: searchForm.productShortName
    });
  }
  if (searchForm.productId) {
    searchStr.push({
      searchName: "productId",
      searchType: "like",
      searchValue: searchForm.productId
    });
  }
  return JSON.stringify(searchStr);
};

const handleReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl?.resetFields();
  handleSearch();
};

const handleSearch = () => {
  fetchAdsProductPromotionDaily();
  fetchAdsProductPromotionDailySummary();
};
//#endregion

//#region 请求相关
const fetchAdsProductPromotionDaily = () => {
  getBiAdsProductPromotionDaily({
    pageNo: pagination.value.pageNo,
    pageSize: pagination.value.pageSize,
    searchStr: formatSearchStr(),
    sortStr: JSON.stringify(sortStr.value)
  })
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("获取广告商品推广数据:", res.data);

        // 如果当前页大于总页数，重置为最后一页 排除总页数为0的情况
        if (res.data?.current > res.data?.pages && res.data?.total !== 0) {
          pagination.value.pageNo = res.data?.pages;
          return;
        }

        // 更新总页数
        pagination.value.pageTotal = res.data?.total || 0;

        tableData.value = res.data?.records || [];
      } else {
        ElMessage.error("获取广告商品推广数据失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取广告商品推广数据失败:" + error.message);
    });
};
const fetchAdsProductPromotionDailySummary = () => {
  getAdsProductPromotionDailSummary({
    searchStr: formatSearchStr()
  })
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("获取广告商品推广数据汇总:", res.data);
        summaryTableData.value = res.data || [];
      } else {
        ElMessage.error("获取广告商品推广数据汇总失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取广告商品推广数据汇总失败:" + error.message);
    });
};
//#endregion

//#region 计算方法
// 生参去退款销售额 计算方法
const calculateRefundSales = (
  payAmount: string | null,
  refundAmount: string | null
) => {
  // null 或者 undefined 当作0
  payAmount = payAmount || "0";
  refundAmount = refundAmount || "0";
  return Number(payAmount) - Number(refundAmount);
};
// 费比(退款后) 计算方法
const calculateFeeRatio = (
  payAmount: string | null,
  refundAmount: string | null,
  costAmount: string | null
) => {
  // null 或者 undefined 当作0
  payAmount = payAmount || "0";
  refundAmount = refundAmount || "0";
  costAmount = costAmount || "0";
  const refundSales = calculateRefundSales(payAmount, refundAmount);
  // 除数为0时，返回0
  if (refundSales === 0) {
    return "0";
  } else {
    return (Number(costAmount) / refundSales).toFixed(2);
  }
};

// 通用除法 计算方法
const calculateDivision = (
  dividend: string | null,
  divisor: string | null,
  isPercent: boolean = false
) => {
  // null 或者 undefined 当作0
  dividend = dividend || "0";
  divisor = divisor || "0";
  let result = 0;
  // 除数为0时，返回0
  if (Number(divisor) === 0) {
    result = 0;
  } else {
    result = Number(dividend) / Number(divisor);
  }
  // 是否加上百分比符号
  if (isPercent) {
    return (result * 100).toFixed(2) + "%";
  } else {
    return result.toFixed(2);
  }
};
//#endregion

watch(
  () => [pagination.value.pageNo, pagination.value.pageSize],
  () => {
    fetchAdsProductPromotionDaily();
  },
  {
    immediate: true
  }
);

onMounted(() => {
  fetchAdsProductPromotionDailySummary();
});
</script>

<template>
  <div>
    <div>
      <el-card
        shadow="never"
        style="margin-bottom: 12px; border-radius: 10px"
        class="search-card"
      >
        <el-form
          ref="searchFormRef"
          :inline="true"
          :model="searchForm"
          class="demo-form-inline"
        >
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="searchForm.date"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
            />
          </el-form-item>
          <el-form-item label="产品线" prop="productLine">
            <el-input
              v-model="searchForm.productLine"
              placeholder="请输入产品线（模糊查询）"
              clearable
            />
          </el-form-item>
          <el-form-item label="产品简称" prop="productShortName">
            <el-input
              v-model="searchForm.productShortName"
              placeholder="请输入产品简称（模糊查询）"
              clearable
            />
          </el-form-item>
          <el-form-item label="产品ID" prop="productId">
            <el-input
              v-model="searchForm.productId"
              placeholder="请输入产品ID（模糊查询）"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button @click="handleReset(searchFormRef)">重置</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div>
      <SummaryCard
        :tableData="summaryTableData"
        :calculateDivision="calculateDivision"
        :calculateRefundSales="calculateRefundSales"
        :calculateFeeRatio="calculateFeeRatio"
      />
    </div>

    <div class="mt-[12px]">
      <el-card shadow="never" style="border-radius: 10px">
        <div class="text-[#0a0a0a] text-[14px] mb-[6px]">详细数据表</div>
        <el-table
          :data="tableData"
          style="width: 100%"
          size="small"
          :header-cell-style="{ color: '#0a0a0a' }"
          border
          @sort-change="handleSortChange"
        >
          <el-table-column
            prop="date"
            label="日期"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="productLine"
            label="产品线"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="productShortName"
            label="产品简称"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="productId"
            label="产品ID"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop=""
            label="生参去退款销售额"
            width=""
            :resizable="false"
          >
            <template #default="scope">
              {{
                calculateRefundSales(
                  scope.row?.payAmount,
                  scope.row?.refundAmount
                ).toFixed(2)
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            label="费比(退款后)"
            width=""
            :resizable="false"
          >
            <template #default="scope">
              {{
                calculateFeeRatio(
                  scope.row?.payAmount,
                  scope.row?.refundAmount,
                  scope.row?.costAmount
                )
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="costAmount"
            label="站内消耗"
            width=""
            :resizable="false"
            sortable="custom"
          />
          <el-table-column
            prop="impressions"
            label="展现量"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="clicks"
            label="点击量"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="totalOrders"
            label="总成交笔数"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="totalSalesAmount"
            label="总成交金额"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="directOrders"
            label="直接成交笔数"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="directSalesAmount"
            label="直接成交金额"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="buyersCount"
            label="成交人数"
            width=""
            :resizable="false"
          />
          <el-table-column
            prop="newBuyersCount"
            label="成交新客"
            width=""
            :resizable="false"
          />
          <el-table-column prop="" label="点击成本" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(scope.row?.costAmount, scope.row?.impressions)
              }}
            </template>
          </el-table-column>
          <el-table-column prop="" label="点击率" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(
                  scope.row?.clicks,
                  scope.row?.impressions,
                  true
                )
              }}
            </template>
          </el-table-column>
          <el-table-column prop="" label="转化率" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(
                  scope.row?.buyersCount,
                  scope.row?.clicks,
                  true
                )
              }}
            </template>
          </el-table-column>
          <el-table-column prop="" label="ROI" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(
                  scope.row?.totalSalesAmount,
                  scope.row?.costAmount
                )
              }}
            </template>
          </el-table-column>
          <el-table-column prop="" label="直接ROI" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(
                  scope.row?.directSalesAmount,
                  scope.row?.costAmount
                )
              }}
            </template>
          </el-table-column>
          <el-table-column prop="" label="直接客单" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(
                  scope.row?.directSalesAmount,
                  scope.row?.directOrders
                )
              }}
            </template>
          </el-table-column>
          <el-table-column prop="" label="拉新成本" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(
                  scope.row?.costAmount,
                  scope.row?.newBuyersCount
                )
              }}
            </template>
          </el-table-column>
          <el-table-column prop="" label="新客占比" width="" :resizable="false">
            <template #default="scope">
              {{
                calculateDivision(
                  scope.row?.newBuyersCount,
                  scope.row?.buyersCount,
                  true
                )
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="productUrl"
            label="产品链接"
            width=""
            fixed="right"
            :resizable="false"
          >
            <template #default="scope">
              <a
                v-if="scope.row.productUrl"
                :href="scope.row.productUrl"
                target="_blank"
                rel="noopener noreferrer"
                style="color: #1890ff; text-decoration: underline"
                @click.stop
              >
                查看链接
              </a>
              <span v-else style="color: #999">无链接</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-[16px] flex justify-end">
          <el-pagination
            v-model:current-page="pagination.pageNo"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            size="small"
            background
            layout="total, sizes, prev, pager, next"
            :total="pagination.pageTotal"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

:deep(.search-card .el-card__body) {
  padding-bottom: 0;
}
</style>
