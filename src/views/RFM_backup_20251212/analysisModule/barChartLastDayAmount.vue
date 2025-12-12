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

const barChartLastDayAmountData = ref(null);

// 监听sourceData变化
watch(
  () => props.sourceData,
  newVal => {
    //#region 最近一次消费金额 -柱状图
    // 深拷贝newVal 并排序，从小到大排序
    const lastDayAmountVal = [...newVal].sort(
      (a, b) => a.lastDayAmount - b.lastDayAmount
    );
    const barChartLastDayAmountDataTemp = {
      // x轴为 一级行政区+二级行政区
      yAxisData: lastDayAmountVal.map(
        item => item.areaLevel1 + "-" + item.areaLevel2
      ),
      xAxisData: lastDayAmountVal.map(item => item.lastDayAmount)
    };
    barChartLastDayAmountData.value = barChartAmount({
      title: "最近一次消费金额",
      yAxisData: barChartLastDayAmountDataTemp.yAxisData,
      xAxisData: barChartLastDayAmountDataTemp.xAxisData
    });
    //#endregion
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <ChartCard
    v-if="barChartLastDayAmountData"
    :name="barChartLastDayAmountData.name"
    :title="barChartLastDayAmountData.title"
    :text="barChartLastDayAmountData.text"
    :option="barChartLastDayAmountData.option"
    :style="barChartLastDayAmountData?.style"
  />
</template>
