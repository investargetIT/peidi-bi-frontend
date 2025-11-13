<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import { chinaJson } from "@/views/RFM/chartCard/mapData"; // json数据放最后

const mapRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const initMap = () => {
  if (!mapRef.value) return;

  // 注册地图
  //@ts-ignore
  echarts.registerMap("china", chinaJson);

  // 初始化图表
  chartInstance = echarts.init(mapRef.value);

  // 配置选项
  const option = {
    title: {
      text: "中国地图 -测试",
      left: "center"
    },
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        return `${params.name}<br/>数值：${params.value || 0}`;
      }
    },
    visualMap: {
      type: "continuous",
      left: "left",
      top: "bottom",
      text: ["高", "低"],
      calculable: true,
      inRange: {
        color: ["#e6f7ff", "#1890ff", "#0050b3"]
      }
    },
    series: [
      {
        name: "区域分布",
        type: "map",
        map: "china",
        roam: true,
        zoom: 1.2,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            areaColor: "#0160AD"
          }
        },
        itemStyle: {
          areaColor: "#f0f0f0",
          borderColor: "#d9d9d9",
          borderWidth: 1
        },
        data: [
          { name: "北京市", value: 100 },
          { name: "上海市", value: 200 },
          { name: "广东省", value: 300 }
        ]
      }
    ]
  };

  chartInstance.setOption(option);
};

onMounted(() => {
  // 等待 DOM 渲染完成
  nextTick(() => {
    initMap();
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<template>
  <div ref="mapRef" class="peidi-chartCard-map-container"></div>
</template>

<style lang="scss" scoped>
.peidi-chartCard-map-container {
  width: 100%;
  height: 600px;
}
</style>
