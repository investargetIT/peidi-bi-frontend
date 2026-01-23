<script setup lang="ts">
import { ref, watch } from "vue";
import NumCard from "../common/numCard.vue";
import ChartCard from "@/components/PdChart/index.vue";

const props = defineProps({
  healthScoreData: {
    type: Array,
    required: true
  },
  ingredientData: {
    type: Object,
    required: true
  }
});

const healthScoreCards = ref({
  name: "healthScoreCards",
  title: "",
  text: "",
  option: {
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
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: ["0-2", "2-4", "4-6", "6-8", "8-10"],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value"
      }
    ],
    series: [
      {
        type: "bar",
        barWidth: "60%",
        data: []
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
  () => props.healthScoreData,
  (newVal, oldVal) => {
    if (newVal) {
      healthScoreCards.value.option.series[0].data = newVal;
    }
  },
  {
    immediate: true,
    deep: true
  }
);

const ingredientAnalysisCards = ref({
  name: "ingredientAnalysisCards",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "item"
    },
    legend: {
      top: "bottom",
      left: "center"
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 0, name: "Positive", itemStyle: { color: "#4caf50" } },
          // { value: 0, name: "Neutral", itemStyle: { color: "#9e9e9e" } },
          // { value: 0, name: "Negative", itemStyle: { color: "#f44336" } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
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
  () => props.ingredientData,
  (newVal, oldVal) => {
    if (newVal) {
      ingredientAnalysisCards.value.option.series[0].data = Object.keys(
        newVal
      ).map(key => ({
        value: newVal[key],
        name: key
      }));
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<template>
  <el-row :gutter="20">
    <el-col :xs="24" :sm="12">
      <NumCard
        title="Quality Truth - Health Score Distribution"
        num="2a"
        desc='Is the market "olive-shaped" (mostly mediocre 5 points) or "dumbbell-shaped" (polarized)?'
      >
        <ChartCard
          :name="healthScoreCards.name"
          :title="healthScoreCards.title"
          :text="healthScoreCards.text"
          :option="healthScoreCards.option"
          :style="healthScoreCards?.style"
        />
      </NumCard>
    </el-col>
    <el-col :xs="24" :sm="12">
      <NumCard
        title="First Ingredient Analysis"
        num="2b"
        desc="Click to filter products by first ingredient type."
      >
        <ChartCard
          :name="ingredientAnalysisCards.name"
          :title="ingredientAnalysisCards.title"
          :text="ingredientAnalysisCards.text"
          :option="ingredientAnalysisCards.option"
          :style="ingredientAnalysisCards?.style"
        />
      </NumCard>
    </el-col>
  </el-row>
</template>
