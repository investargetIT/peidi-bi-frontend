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

const barChartTotalOrdersData = ref(null);

// 监听sourceData变化
watch(
  () => props.sourceData,
  newVal => {
    //#region 累计消费频次 -柱状图
    // 深拷贝newVal 并排序，从小到大排序
    const totalOrdersVal = [...newVal].sort(
      (a, b) => a.totalOrders - b.totalOrders
    );
    const barChartTotalOrdersDataTemp = {
      // x轴为 一级行政区+二级行政区
      yAxisData: totalOrdersVal.map(
        item => item.areaLevel1 + "-" + item.areaLevel2
      ),
      xAxisData: totalOrdersVal.map(item => item.totalOrders)
    };
    barChartTotalOrdersData.value = barChartAmount({
      title: "累计消费频次",
      yAxisData: barChartTotalOrdersDataTemp.yAxisData,
      xAxisData: barChartTotalOrdersDataTemp.xAxisData
    });
    //#endregion
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <ChartCard
    v-if="barChartTotalOrdersData"
    :name="barChartTotalOrdersData.name"
    :title="barChartTotalOrdersData.title"
    :text="barChartTotalOrdersData.text"
    :option="barChartTotalOrdersData.option"
    :style="barChartTotalOrdersData?.style"
  />
</template>
