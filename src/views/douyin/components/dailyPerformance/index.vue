<script setup lang="ts">
import { getBiDouyinSales } from "@/api/douyin";
import dayjs from "dayjs";
import { onMounted, ref } from "vue";
import EpSearch from "~icons/ep/search";

// 加载状态
const loading = ref<boolean>(false);
// 抖音业绩数据类型定义
export interface DouyinPerformanceData {
  /** 数据记录ID */
  id: number;
  /** 数据日期，格式：YYYY-MM-DD */
  date: string;
  /** 平台名称 */
  platform: string;
  /** 店铺名称 */
  shopName: string;
  /** 账号名称 */
  accountName: string;
  /** 账号类型：联盟/自营等 */
  accountType: string;
  /** 运营模式：带货/直播等 */
  operationMode: string;
  /** 抖音ID */
  douyinId: string;
  /** 用户支付金额（元） */
  userPaymentAmount: number;
  /** 支付用户数 */
  paidUsers: number;
  /** 客单价（元） */
  averageOrderValue: number;
  /** 转化率（百分比） */
  conversionRate: number;
  /** 直播支付金额（元） */
  livePaymentAmount: number;
  /** 短视频支付金额（元） */
  shortVideoPaymentAmount: number;
  /** 商品卡支付金额（元） */
  productCardPaymentAmount: number;
  /** 其他支付金额（元） */
  otherPaymentAmount: number | null;
  /** 退款金额（元） */
  refundAmount: number;
  /** 业务类型 */
  business: string | null;
  /** 账号列表 */
  accountList: any[] | null;
}
const performanceList = ref<DouyinPerformanceData[]>([]);
// 搜索日期，默认当天 开发中先选择有数据的日期范围
const searchDate = ref<string[]>([
  dayjs("2025-11-01").format("YYYY-MM-DD"),
  dayjs("2025-11-03").format("YYYY-MM-DD")
]);

//#region 请求逻辑
// 获取抖音业绩数据
function fetchDouyinSales() {
  loading.value = true;
  getBiDouyinSales({
    pageNo: 1,
    pageSize: 10000,
    searchStr: JSON.stringify([
      {
        searchName: "date",
        searchType: "betweenStr",
        searchValue: searchDate.value
          .map(date => dayjs(date).format("YYYY-MM-DD"))
          .join(",")
      }
    ])
  })
    .then((res: any) => {
      console.log("抖音业绩数据", res);

      // 把data.records里的每条数据里的accountList铺平 暂时把records里的business赋值给accountList里的business
      performanceList.value = res.data.records.flatMap(
        (item: DouyinPerformanceData) => {
          if (item.accountList && item.accountList.length > 0) {
            return item.accountList.map((account: any) => ({
              ...account,
              business: item.business
            }));
          }
          return [];
        }
      );
    })
    .finally(() => {
      loading.value = false;
    });
}
//#endregion

// 处理查询
function handleSearch() {
  fetchDouyinSales();
}

onMounted(() => {
  fetchDouyinSales();
});

// 处理单元格合并的方法
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // 只处理第一列（达人列）
  if (columnIndex === 0) {
    // 获取当前行的达人名称
    const currentAccountName = row.accountName;

    // 查找相同达人名称的连续行数
    let rowspan = 1;
    for (let i = rowIndex + 1; i < performanceList.value.length; i++) {
      if (performanceList.value[i].accountName === currentAccountName) {
        rowspan++;
      } else {
        break;
      }
    }

    // 如果是相同达人名称的第一行，返回合并信息
    if (
      rowIndex === 0 ||
      performanceList.value[rowIndex - 1].accountName !== currentAccountName
    ) {
      return {
        rowspan: rowspan,
        colspan: 1
      };
    } else {
      // 如果不是第一行，隐藏单元格
      return {
        rowspan: 0,
        colspan: 0
      };
    }
  }
};
</script>

<template>
  <!-- 搜索栏 -->
  <div class="mb-[10px]">
    <el-date-picker
      v-model="searchDate"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      unlink-panels
      :clearable="false"
      class="mr-[20px]"
    />

    <el-button
      type="primary"
      :icon="EpSearch"
      @click="handleSearch"
      :loading="loading"
      >查询</el-button
    >
  </div>

  <!-- 表格 -->
  <el-table
    :data="performanceList"
    :header-row-style="{ color: '#09090b' }"
    size="small"
    border
    height="720"
    :span-method="objectSpanMethod"
  >
    <el-table-column
      prop="accountName"
      label="达人"
      min-width="200"
      align="center"
      :resizable="false"
    />
    <el-table-column
      prop="business"
      label="商务"
      width="120"
      align="center"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.business || "-" }}
      </template>
    </el-table-column>

    <el-table-column
      prop="date"
      label="日期"
      width="100"
      align="center"
      :resizable="false"
    />

    <el-table-column
      prop="shopName"
      label="店铺"
      width="120"
      show-overflow-tooltip
      :resizable="false"
    />

    <el-table-column
      prop="userPaymentAmount"
      label="支付金额"
      width="120"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.userPaymentAmount?.toLocaleString() || "0" }}
      </template>
    </el-table-column>

    <el-table-column
      prop="paidUsers"
      label="支付用户"
      width="100"
      align="right"
      :resizable="false"
    />

    <el-table-column
      prop="averageOrderValue"
      label="客单价"
      width="120"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.averageOrderValue?.toLocaleString() || "0" }}
      </template>
    </el-table-column>

    <el-table-column
      prop="conversionRate"
      label="转化率(%)"
      width="120"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ (scope.row.conversionRate * 100)?.toFixed(2) || "0.00" }}%
      </template>
    </el-table-column>

    <el-table-column
      prop="livePaymentAmount"
      label="直播支付"
      width="120"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.livePaymentAmount?.toLocaleString() || "0" }}
      </template>
    </el-table-column>

    <el-table-column
      prop="shortVideoPaymentAmount"
      label="短视频支付"
      width="125"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.shortVideoPaymentAmount?.toLocaleString() || "0" }}
      </template>
    </el-table-column>

    <el-table-column
      prop="productCardPaymentAmount"
      label="商品卡支付"
      width="130"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.productCardPaymentAmount?.toLocaleString() || "0" }}
      </template>
    </el-table-column>

    <el-table-column
      prop="otherPaymentAmount"
      label="其他支付"
      width="120"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.otherPaymentAmount?.toLocaleString() || "0" }}
      </template>
    </el-table-column>

    <el-table-column
      prop="refundAmount"
      label="退款金额"
      width="120"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ scope.row.refundAmount?.toLocaleString() || "0" }}
      </template>
    </el-table-column>
  </el-table>
</template>
