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

const barChartLastYearAmountData = ref(null);

// 监听sourceData变化
watch(
  () => props.sourceData,
  newVal => {
    //#region 近一年消费金额 -柱状图
    // 深拷贝newVal 并排序，从小到大排序
    const lastYearAmountVal = [...newVal].sort(
      (a, b) => a.lastYearAmount - b.lastYearAmount
    );
    const barChartLastYearAmountDataTemp = {
      // x轴为 一级行政区+二级行政区
      yAxisData: lastYearAmountVal.map(
        item => item.areaLevel1 + "-" + item.areaLevel2
      ),
      xAxisData: lastYearAmountVal.map(item => item.lastYearAmount)
    };
    barChartLastYearAmountData.value = barChartAmount({
      title: "近一年消费金额",
      yAxisData: barChartLastYearAmountDataTemp.yAxisData,
      xAxisData: barChartLastYearAmountDataTemp.xAxisData
    });
    //#endregion
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <ChartCard
    v-if="barChartLastYearAmountData"
    :name="barChartLastYearAmountData.name"
    :title="barChartLastYearAmountData.title"
    :text="barChartLastYearAmountData.text"
    :option="barChartLastYearAmountData.option"
    :style="barChartLastYearAmountData?.style"
  />
</template>
