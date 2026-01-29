<script setup lang="ts">
import { ref, watch } from "vue";
import NumCard from "../common/numCard.vue";
import ChartCard from "@/components/PdChart/index.vue";

const props = defineProps({
  badIngredientData: {
    type: Object,
    required: true
  }
});

const badIngredientTop = ref([]);

const badIngredientCards = ref({
  name: "badIngredientCards",
  title: "",
  text: "",
  option: {
    grid: {
      left: "0.5%",
      containLabel: true
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function (params) {
        const data = params[0];
        return `${data.axisValue}<br/>Count: ${data.value} products`;
      }
    },
    xAxis: {
      type: "value",
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: "category",
      data: [],
      axisLabel: {
        show: true,
        fontSize: 10,
        width: 65,
        formatter: function (value) {
          if (value.length > 24) {
            return `${value.slice(0, 24)}...`;
          }
          return value;
        }
      }
    },
    series: [
      {
        type: "bar",
        data: [],
        color: "#EF4444"
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px",
    border: 0
  }
});

const badIngredientWordCloudCards = ref({
  name: "badIngredientWordCloudCards",
  title: "",
  text: "",
  option: {
    series: [
      {
        type: "wordCloud",
        //maskImage: maskImage,
        sizeRange: [12, 60], // 增大字体范围
        rotationRange: [0, 0], // 增加旋转角度范围
        rotationStep: 45, // 减小旋转步长
        gridSize: 26, // 减小网格大小，让排列更紧密
        shape: "pentagon",
        width: "100%",
        height: "100%",
        drawOutOfBound: false, // 不绘制超出边界的文字
        layoutAnimation: true, // 启用布局动画
        textStyle: {
          normal: {
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold" // 使用粗体
          },
          color: function (params) {
            // 根据单词的值进行颜色平滑过渡
            const value = params.data.value;
            const minValue = 15.8; // 最小值
            const maxValue = 48.3; // 最大值

            // 计算颜色过渡比例 (0-1)
            const ratio = (value - minValue) / (maxValue - minValue);

            // 定义颜色渐变范围：从蓝色到红色
            const startColor = { r: 54, g: 162, b: 235 }; // 蓝色
            const endColor = { r: 255, g: 99, b: 132 }; // 红色

            // 计算过渡颜色
            const r = Math.round(
              startColor.r + (endColor.r - startColor.r) * ratio
            );
            const g = Math.round(
              startColor.g + (endColor.g - startColor.g) * ratio
            );
            const b = Math.round(
              startColor.b + (endColor.b - startColor.b) * ratio
            );

            return `rgb(${r}, ${g}, ${b})`;
          },
          emphasis: {
            shadowBlur: 15,
            shadowColor: "#333",
            textShadowBlur: 10,
            textShadowColor: "#fff"
          }
        },
        data: [
          // { name: "treats", value: 48.3 },
        ]
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px",
    border: 0
  }
});

watch(
  () => props.badIngredientData,
  newVal => {
    const temp = [];
    for (const key in newVal) {
      temp.push({
        name: key,
        value: newVal[key]
      });
    }
    temp.sort((a, b) => b.value - a.value);
    // console.log("badIngredientData:", temp);

    const tempData = temp.slice(0, 5).reverse();
    badIngredientCards.value = {
      ...badIngredientCards.value,
      option: {
        ...badIngredientCards.value.option,
        yAxis: {
          ...badIngredientCards.value.option.yAxis,
          data: tempData.map(item => item.name)
        },
        series: [
          {
            ...badIngredientCards.value.option.series[0],
            data: tempData.map(item => item.value)
          }
        ]
      }
    };
    badIngredientWordCloudCards.value = {
      ...badIngredientWordCloudCards.value,
      option: {
        ...badIngredientWordCloudCards.value.option,
        series: [
          {
            ...badIngredientWordCloudCards.value.option.series[0],
            data: temp.map(item => ({
              name: item.name,
              value: item.value
            }))
          }
        ]
      }
    };
    badIngredientTop.value = [...tempData].reverse();
  }
);
</script>

<template>
  <NumCard
    title="Red Flag Wall - Bad Ingredient Monitor"
    num="3"
    desc='Find competitor weaknesses as your marketing attack points. If "Sugar" is most common, promote "No Sugar"; if "Wheat" dominates, go "Grain-Free".'
  >
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <ChartCard
          :name="badIngredientCards.name"
          :title="badIngredientCards.title"
          :text="badIngredientCards.text"
          :option="badIngredientCards.option"
          :style="badIngredientCards.style"
        />
      </el-col>
      <el-col :xs="24" :sm="12">
        <ChartCard
          :name="badIngredientWordCloudCards.name"
          :title="badIngredientWordCloudCards.title"
          :text="badIngredientWordCloudCards.text"
          :option="badIngredientWordCloudCards.option"
          :style="badIngredientWordCloudCards.style"
        />
      </el-col>
    </el-row>

    <div>
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 class="font-semibold text-green-800">Marketing Opportunities</h4>
        <div class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="item in badIngredientTop"
            :key="item.name"
            class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
          >
            Promote: No {{ item.name }}
          </span>
        </div>
      </div>
    </div>
  </NumCard>
</template>
