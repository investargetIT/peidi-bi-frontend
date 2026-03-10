<script setup lang="ts">
import { ref } from "vue";
import ChartCard from "@/components/PdChart/index.vue";

// 销售额
const salesCards = ref({
  name: "salesCards",
  title: "",
  text: "",
  option: {
    title: {
      text: "本月累计销售额",
      left: "center",
      top: "20",
      textStyle: {
        fontSize: 16,
        color: "#0a0a0a"
      }
    },
    tooltip: {
      trigger: "item"
    },
    legend: {
      bottom: "5%",
      left: "center"
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "350 万",
          textAlign: "center",
          textVerticalAlign: "middle",
          fontSize: 32,
          fontWeight: "bold",
          fill: "#333"
        }
      }
    ],
    series: [
      {
        name: "",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          position: "inside",
          formatter: params => {
            return Math.round(params.percent) + "%";
          },
          fontSize: 14,
          color: "#fff",
          fontWeight: "bold"
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: "线上", itemStyle: { color: "#4472C4" } },
          { value: 735, name: "线下", itemStyle: { color: "#ED7D31" } }
        ]
      }
    ]
  },
  style: {
    width: "100%"
  }
});
</script>

<template>
  <div>
    <ChartCard
      :name="salesCards.name"
      :title="salesCards.title"
      :text="salesCards.text"
      :option="salesCards.option"
      :style="salesCards?.style"
      :showCard="false"
    />
  </div>
</template>
