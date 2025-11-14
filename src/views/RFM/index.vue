<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import Table from "@/views/RFM/tableCard/index.vue";
import OperationBar from "@/views/RFM/operationBar/index.vue";
import ChartCard from "@/views/RFM/chartCard/index.vue";
import { lineChartTest, pieChartTest } from "@/views/RFM/chartCard/template";
import MapChart from "@/views/RFM/chartCard/map.vue";
import { getBiRfm } from "@/api/rfm";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import Analysis from "@/views/RFM/analysis.vue";
// 调试数据
import debugData from "@/views/RFM/response_debug.json";

// RFM客户分析数据类型定义
export interface RFMCustomerData {
  // 基础信息字段
  id: string; // 客户ID
  areaLevel1: string; // 一级行政区：如"黑龙江省"
  areaLevel2: string; // 二级行政区：如"七台河市"
  level: string; // 客户等级：如"其他"
  date: string; // 数据日期：如"2025-11-13"

  // 时间相关字段 (R - Recency)
  firstOrderTime: string; // 首次消费时间：如"2022-01-01 18:44:09"
  lastOrderTime: string; // 最近一次消费时间：如"2025-11-09 11:43:31"

  // 金额相关字段 (M - Monetary)
  totalAmount: string; // 累计消费金额：总消费金额
  lastYearAmount: string; // 近一年消费金额：如36561.93
  lastDayAmount: string; // 最近一次消费金额：如27.9

  // 频次相关字段 (F - Frequency)
  totalOrders: string; // 累计消费频次：总消费次数
  lastYearOrders: string; // 近一年消费频次：如347次
}

// 定义rfm模型数据
const rfmData = ref<RFMCustomerData[]>([]);
const rfmDataLoading = ref<boolean>(false);
// loading进度条
const loadingProgress = ref<number>(0);

//#region 请求逻辑
// 获取rfm模型
function fetchBiRfm({
  date,
  endTime,
  startTime
}: {
  date: string;
  endTime: string;
  startTime: string;
}) {
  // 调试数据
  console.log("请求rfm模型");
  //@ts-ignore
  // rfmData.value = debugData.data;
  // return;
  rfmDataLoading.value = true;
  loadingProgress.value = 0;

  // 模拟进度条增加
  const interval = setInterval(() => {
    loadingProgress.value += 1;
    if (loadingProgress.value >= 99) {
      clearInterval(interval);
    }
  }, 300);

  getBiRfm({
    date,
    endTime: dayjs(endTime).format("YYYY-MM-DD 23:59:59"), // 做个格式化
    startTime
  })
    .then((res: any) => {
      if (res.code === 200) {
        console.log("获取rfm模型成功", res);
        rfmData.value = res.data;
        if (res.data.length === 0) {
          message("当日数据暂未抓取", { type: "warning" });
        }
      } else {
        message(res.msg || "获取rfm模型失败", { type: "error" });
      }
    })
    .catch((err: any) => {
      message(err.msg || "获取rfm模型失败", { type: "error" });
    })
    .finally(() => {
      loadingProgress.value = 100;
      // 清除定时器
      if (interval) {
        clearInterval(interval);
      }
      rfmDataLoading.value = false;
    });
}
provide("fetchBiRfm", fetchBiRfm);
//#endregion
onMounted(() => {
  // 请求rfm模型方法放到操作栏组件中
});
</script>

<template>
  <div>
    <!-- 操作栏 -->
    <OperationBar :rfmDataLoading="rfmDataLoading" />
    <!-- 表格 -->
    <Table
      v-loading="rfmDataLoading"
      class="mt-[15px]"
      :sourceData="rfmData"
      :element-loading-text="`数据获取中...${loadingProgress}%`"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    />
    <el-divider />
    <!-- 分析模块 -->
    <Analysis :sourceData="rfmData" />
    <!-- 折线图 -测试 -->
    <!-- <ChartCard
      :name="lineChartTest.name"
      :title="lineChartTest.title"
      :text="lineChartTest.text"
      :option="lineChartTest.option"
      :style="lineChartTest?.style"
    />
    <el-divider /> -->
    <!-- 饼图 -测试 -->
    <!-- <ChartCard
      :name="pieChartTest.name"
      :title="pieChartTest.title"
      :text="pieChartTest.text"
      :option="pieChartTest.option"
      :style="pieChartTest?.style"
    />
    <el-divider /> -->
    <!-- 地图 -测试 -->
    <!-- <MapChart />
    <el-divider /> -->
  </div>
</template>
