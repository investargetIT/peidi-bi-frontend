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

const barChartTotalAmountData = ref(null);

// 监听sourceData变化
watch(
  () => props.sourceData,
  newVal => {
    //#region 累计消费金额 -柱状图
    // 深拷贝newVal 并排序，从小到大排序
    const totalAmountVal = [...newVal].sort(
      (a, b) => a.totalAmount - b.totalAmount
    );
    const barChartTotalAmountDataTemp = {
      // x轴为 一级行政区+二级行政区
      yAxisData: totalAmountVal.map(
        item => item.areaLevel1 + "-" + item.areaLevel2
      ),
      xAxisData: totalAmountVal.map(item => item.totalAmount)
    };
    barChartTotalAmountData.value = barChartAmount({
      title: "累计消费金额",
      yAxisData: barChartTotalAmountDataTemp.yAxisData,
      xAxisData: barChartTotalAmountDataTemp.xAxisData
    });
    //#endregion
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <ChartCard
    v-if="barChartTotalAmountData"
    :name="barChartTotalAmountData.name"
    :title="barChartTotalAmountData.title"
    :text="barChartTotalAmountData.text"
    :option="barChartTotalAmountData.option"
    :style="barChartTotalAmountData?.style"
  />
</template>
