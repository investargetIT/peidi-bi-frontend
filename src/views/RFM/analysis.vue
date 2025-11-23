<script setup lang="ts">
import ChartCard from "@/views/RFM/chartCard/index.vue";
import { barChartAmount } from "@/views/RFM/chartCard/template";
import type { RFMCustomerData } from "./index.vue";
import { ref, toRefs, watch } from "vue";
import {
  barChartTotalAmount,
  barChartLastYearAmount,
  barChartLastDayAmount,
  barChartTotalOrders,
  barChartLastYearOrders,
  mapChart
} from "@/views/RFM/analysisModule";

//props
const props = defineProps({
  sourceData: {
    type: Array as PropType<RFMCustomerData[]>,
    required: true
  }
});

// 使用toRefs保持响应式
const { sourceData } = toRefs(props);
</script>

<template>
  <div id="peidi-RFM-analysis">
    <el-tabs type="border-card" class="peidi-el-tabs-modern-tabs">
      <el-tab-pane label="地图" lazy>
        <mapChart :sourceData="sourceData" />
      </el-tab-pane>
      <el-tab-pane label="累计消费金额" lazy>
        <barChartTotalAmount :sourceData="sourceData" />
      </el-tab-pane>
      <el-tab-pane label="近一年消费金额" lazy>
        <barChartLastYearAmount :sourceData="sourceData" />
      </el-tab-pane>
      <el-tab-pane label="最近一次消费金额" lazy>
        <barChartLastDayAmount :sourceData="sourceData" />
      </el-tab-pane>
      <el-tab-pane label="累计消费频次" lazy>
        <barChartTotalOrders :sourceData="sourceData" />
      </el-tab-pane>
      <el-tab-pane label="近一年消费频次" lazy>
        <barChartLastYearOrders :sourceData="sourceData" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
