<script setup lang="ts">
import { getBiDouyinVideo } from "@/api/douyin";
import { onMounted, ref } from "vue";
import dayjs from "dayjs";
import EpSearch from "~icons/ep/search";

// 加载状态
const loading = ref<boolean>(false);
// 抖音短视频数据类型定义
interface DouyinShortVideo {
  /** 数据记录ID */
  id: number;
  /** 数据日期 */
  date: string;
  /** 平台名称 */
  platform: string;
  /** 店铺名称 */
  shopName: string;
  /** 视频标题 */
  videoTitle: string;
  /** 视频ID */
  videoId: string;
  /** 是否为广告视频（是/否） */
  isAd: string;
  /** 视频链接 */
  videoUrl: string;
  /** 发布时间 */
  publishTime: string;
  /** 达人昵称 */
  influencerNickname: string;
  /** 达人抖音ID */
  influencerDouyinId: string;
  /** 商品ID */
  productId: string;
  /** 商品名称 */
  productName: string;
  /** 观看次数 */
  viewCount: number | null;
  /** 支付金额 */
  paymentAmount: number;
  /** 退款金额 */
  refundAmount: number;
  /** 直播间跳转次数 */
  liveRoomRedirect: number;
  /** 观看后搜索次数 */
  searchAfterView: number;
  /** 店铺页面跳转次数 */
  storePageRedirect: number | null;
  /** 销售类型 */
  salesType: string | null;
  /** 账户列表（可能包含多个账户数据） */
  accountList: any[] | null;
  /** 商品曝光次数 */
  exposureCnt: number;
  /** 商品点击次数 */
  clickCnt: number;
  /** 成交订单数 */
  ordersCnt: number;
}
// 抖音短视频数据列表
const videoList = ref<DouyinShortVideo[]>([]);
// 搜索日期，默认当天 开发中先选择有数据的日期范围
const searchDate = ref<string[]>([
  dayjs("2025-11-16").format("YYYY-MM-DD"),
  dayjs("2025-11-16").format("YYYY-MM-DD")
]);

//#region 请求逻辑
// 获取抖音短视频数据
function fetchDouyinVideo() {
  getBiDouyinVideo({
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
  }).then((res: any) => {
    console.log("抖音短视频数据", res);

    // 处理抖音短视频数据
    // 把data.records里的每条数据里的accountList铺平
    const videoListTemp = res.data.records.flatMap((item: any) => {
      if (item.accountList && item.accountList.length > 0) {
        return item.accountList.map((account: any) => ({
          ...account
        }));
      }
      return [];
    });

    console.log("videoListTemp", videoListTemp);
    videoList.value = videoListTemp;
  });
}
//#endregion

// 处理查询
function handleSearch() {
  fetchDouyinVideo();
}

onMounted(() => {
  fetchDouyinVideo();
});
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
    :data="videoList"
    :header-row-style="{ color: '#09090b' }"
    size="small"
    stripe
    border
    height="720"
  >
    <el-table-column prop="date" label="日期" width="100" :resizable="false" />
    <el-table-column
      prop="salesType"
      label="销售类别"
      width="100"
      :resizable="false"
    />
    <el-table-column
      prop="productName"
      label="销售产品"
      width="200"
      :resizable="false"
    />
    <el-table-column
      prop="influencerNickname"
      label="达人"
      width="200"
      :resizable="false"
    />
    <el-table-column
      prop="publishTime"
      label="发布时间（历史发视频）"
      width="160"
      :resizable="false"
    >
      <template #default="scope">
        {{ dayjs(scope.row.publishTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
    </el-table-column>
    <el-table-column
      prop="videoTitle"
      label="视频标题"
      min-width="300"
      show-overflow-tooltip
      :resizable="false"
    />
    <el-table-column
      prop="paymentAmount"
      label="用户支付金额"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="ordersCnt"
      label="成交订单数"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="viewCount"
      label="视频观看次数"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="exposureCnt"
      label="商品曝光次数"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="clickCnt"
      label="商品点击次数"
      width="100"
      align="right"
      :resizable="false"
    />
  </el-table>
</template>

<style lang="scss" scoped>
.link {
  color: #409eff;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
