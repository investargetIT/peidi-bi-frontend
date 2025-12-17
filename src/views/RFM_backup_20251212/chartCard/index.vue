<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, onUnmounted, watch, ref, nextTick } from "vue";

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
    default: () => ({ width: "700px", chartMinHeight: "450px" })
  }
});

// 使用ref确保ID唯一性
const chartId = ref(props.name + "-" + Math.random().toString(36).substr(2, 9));
const myChart = ref<echarts.ECharts | null>(null);
const chartDom = ref<HTMLElement | null>(null);

// 初始化图表
const initChart = () => {
  if (!chartDom.value) return;

  // 如果图表已存在，先销毁
  if (myChart.value) {
    myChart.value.dispose();
  }

  myChart.value = echarts.init(chartDom.value);
  props.option && myChart.value.setOption(props.option, true); // 使用true参数进行不合并的更新
};

// 更新图表数据
const updateChart = (newOption: any) => {
  if (myChart.value) {
    myChart.value.setOption(newOption, true);
  }
};

// 监听option变化
watch(
  () => props.option,
  newOption => {
    if (myChart.value) {
      // 使用nextTick确保DOM已更新
      nextTick(() => {
        updateChart(newOption);
      });
    }
  },
  { deep: true }
);

onMounted(() => {
  // 使用nextTick确保DOM已渲染
  nextTick(() => {
    initChart();
  });
});

onUnmounted(() => {
  if (myChart.value) {
    myChart.value.dispose();
    myChart.value = null;
  }
});

// 暴露方法供父组件调用
defineExpose({
  updateChart,
  getInstance: () => myChart.value
});
</script>

<template>
  <el-card shadow="never" :style="style">
    <div class="text-[16px] font-bold text-[#09090B]">{{ title }}</div>
    <div class="text-[14px] text-[#71717a]">{{ text }}</div>
    <!-- 使用ref绑定DOM元素 -->
    <div
      :id="chartId"
      ref="chartDom"
      :style="{ minHeight: style.chartMinHeight }"
    />
  </el-card>
</template>
