<script setup lang="ts">
import { ref, watch } from "vue";
import type { RFMCustomerData } from "@/views/RFM_backup_20251212/index.vue";
import { barChartAmount } from "@/views/RFM_backup_20251212/chartCard/template";
import ChartCard from "@/views/RFM_backup_20251212/chartCard/index.vue";

const props = defineProps({
  sourceData: {
    type: Array as PropType<RFMCustomerData[]>,
    required: true
  }
});

const barChartLastYearOrdersData = ref(null);

// 监听sourceData变化
watch(
  () => props.sourceData,
  newVal => {
    //#region 近一年消费频次 -柱状图
    // 深拷贝newVal 并排序，从小到大排序
    const lastYearOrdersVal = [...newVal].sort(
      (a, b) => a.lastYearOrders - b.lastYearOrders
    );
    const barChartLastYearOrdersDataTemp = {
      // x轴为 一级行政区+二级行政区
      yAxisData: lastYearOrdersVal.map(
        item => item.areaLevel1 + "-" + item.areaLevel2
      ),
      xAxisData: lastYearOrdersVal.map(item => item.lastYearOrders)
    };
    barChartLastYearOrdersData.value = barChartAmount({
      title: "近一年消费频次",
      yAxisData: barChartLastYearOrdersDataTemp.yAxisData,
      xAxisData: barChartLastYearOrdersDataTemp.xAxisData
    });
    //#endregion
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <ChartCard
    v-if="barChartLastYearOrdersData"
    :name="barChartLastYearOrdersData.name"
    :title="barChartLastYearOrdersData.title"
    :text="barChartLastYearOrdersData.text"
    :option="barChartLastYearOrdersData.option"
    :style="barChartLastYearOrdersData?.style"
  />
</template>
