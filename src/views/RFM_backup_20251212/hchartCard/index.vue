<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import * as Highcharts from "highcharts";
import "highcharts/highcharts-3d";

// props
const props = defineProps({
  // name用于图表的初始化
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ""
  },
  text: {
    type: String,
    default: ""
  },
  option: {
    type: Object,
    default: () => ({})
  },
  style: {
    type: Object,
    default: () => ({ width: "700px" })
  }
});

const chartId = props.name + new Date().getTime();
const chartInstance = ref<Highcharts.Chart | null>(null);

onMounted(() => {
  const chartDom = document.getElementById(chartId);
  if (!chartDom) return;

  // 创建图表实例并保存引用
  chartInstance.value = Highcharts.chart(chartDom, props.option);
});

// 监听option变化，更新图表
watch(
  () => props.option,
  newOption => {
    if (chartInstance.value) {
      // 使用update方法更新图表
      chartInstance.value.update(newOption, true, true);
    }
  },
  { deep: true }
);
</script>

<template>
  <el-card shadow="never" :style="style">
    <div class="text-[16px] font-bold text-[#09090B]">{{ title }}</div>
    <div class="text-[14px] text-[#71717a]">{{ text }}</div>
    <!-- 图表容器 id用时间戳拼接 -->
    <div :id="chartId" style="min-height: 450px" />
  </el-card>
</template>
