<script setup lang="ts">
import { ref } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import SelectCard from "../selectCard/index.vue";

// 月度数据
const monthlyDataCards = ref({
  name: "monthlyDataCards",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999"
        }
      }
    },
    grid: {
      left: "1%",
      right: "1%",
      bottom: "0%",
      containLabel: true
    },
    legend: {
      data: ["本年", "同比(去年)", "环比(上月)"],
      left: "0",
      top: "0"
    },
    xAxis: [
      {
        type: "category",
        data: [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
          "1月"
        ],
        axisPointer: {
          type: "shadow"
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "本年",
        min: 0,
        // max: 250,
        // interval: 50,
        axisLabel: {
          formatter: "{value}"
        }
      },
      {
        type: "value",
        name: "比例",
        min: 0,
        // max: 25,
        // interval: 5,
        axisLabel: {
          formatter: "{value}"
        }
      }
    ],
    series: [
      {
        name: "本年",
        type: "bar",
        itemStyle: {
          color: "#4472C4"
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c}"
        },
        tooltip: {
          valueFormatter: function (value) {
            return value;
          }
        },
        data: [25, 30, 20, 15, 10, 5, 0, 25, 30, 20, 15, 10, 5]
      },
      {
        name: "同比(去年)",
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        lineStyle: {
          color: "rgb(237, 125, 49)",
          width: 2
        },
        itemStyle: {
          color: "rgb(237, 125, 49)"
        },
        tooltip: {
          valueFormatter: function (value) {
            return value;
          }
        },
        data: [
          2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2, 2.0
        ]
      },
      {
        name: "环比(上月)",
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        lineStyle: {
          color: "rgb(236, 72, 153)",
          width: 2
        },
        itemStyle: {
          color: "rgb(236, 72, 153)"
        },
        tooltip: {
          valueFormatter: function (value) {
            return value;
          }
        },
        data: [
          3.0, 2.6, 2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0
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
    <el-card shadow="never" style="border-radius: 10px">
      <div class="flex justify-between items-center mb-4 flex-wrap">
        <div
          class="text-base font-bold uppercase tracking-widest text-[#0a0a0a]"
        >
          月度数据
        </div>
        <div>
          <SelectCard />
        </div>
      </div>
      <ChartCard
        :name="monthlyDataCards.name"
        :title="monthlyDataCards.title"
        :text="monthlyDataCards.text"
        :option="monthlyDataCards.option"
        :style="monthlyDataCards?.style"
        :showCard="false"
      />
    </el-card>
  </div>
</template>
