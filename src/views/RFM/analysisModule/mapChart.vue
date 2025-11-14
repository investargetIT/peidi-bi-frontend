<script setup lang="ts">
import MapChart from "@/views/RFM/chartCard/map.vue";
import type { RFMCustomerData } from "@/views/RFM/index.vue";
import { computed, ref, watch } from "vue";

//props
const props = defineProps({
  sourceData: {
    type: Array as PropType<RFMCustomerData[]>,
    required: true
  }
});

// 地图数据
const mapData = ref<any[]>([]);
// 记录图表类型
const chartType = ref<string>("totalAmount");
// 计算属性得到图表title
const chartTitle = computed(() => {
  switch (chartType.value) {
    case "totalAmount":
      return "累计消费金额";
    case "lastYearAmount":
      return "近一年消费金额";
    case "lastDayAmount":
      return "最近一次消费金额";
    case "totalOrders":
      return "累计消费频次";
    case "lastYearOrders":
      return "近一年消费频次";
    default:
      return "";
  }
});

//#region 数据处理逻辑 监听props.sourceData和chartType，根据不同的图表类型，处理数据
watch(
  [() => props.sourceData, () => chartType.value],
  ([newSourceData, newChartType]) => {
    // 遍历newSourceData 根据areaLevel1分类 累加newChartType属性
    // console.log("newSourceData", newSourceData);
    // console.log("newChartType", newChartType);

    // 遍历newSourceData 变成 {北京市: 1000, 上海市: 2000, ...}
    const map = new Map<string, number>();
    newSourceData.forEach(item => {
      const areaLevel1 = item.areaLevel1;
      const value = item[newChartType];
      if (map.has(areaLevel1)) {
        map.set(areaLevel1, map.get(areaLevel1)! + value);
      } else {
        map.set(areaLevel1, value);
      }
    });
    // console.log("map", map);
    // 转换为 [{name: '北京市', value: '1000'}, {name: '上海市', value: '2000'}, ...]
    mapData.value = Array.from(map).map(([name, value]) => ({
      name,
      value: value.toFixed(0)
    }));

    // console.log("mapData", mapData.value);
  },
  { immediate: true, deep: true }
);
//#endregion

// 点击更换图表类型
const handleClickButton = (type: string) => {
  // console.log("点击了按钮", type);
  chartType.value = type;
};
</script>

<template>
  <div class="relative">
    <MapChart :mapData="mapData" :mapTitle="chartTitle" />

    <div class="absolute top-0 left-0 flex">
      <el-button
        type="primary"
        size="small"
        @click="handleClickButton('totalAmount')"
        >累计消费金额</el-button
      >
      <el-button
        type="primary"
        size="small"
        @click="handleClickButton('lastYearAmount')"
        >近一年消费金额</el-button
      >
      <el-button
        type="primary"
        size="small"
        @click="handleClickButton('lastDayAmount')"
        >最近一次消费金额</el-button
      >
      <el-button
        type="primary"
        size="small"
        @click="handleClickButton('totalOrders')"
        >累计消费频次</el-button
      >
      <el-button
        type="primary"
        size="small"
        @click="handleClickButton('lastYearOrders')"
        >近一年消费频次</el-button
      >
    </div>
  </div>
</template>
