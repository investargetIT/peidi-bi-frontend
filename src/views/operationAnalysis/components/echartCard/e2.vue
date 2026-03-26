<script setup lang="ts">
import { ref } from "vue";
import ChartCard from "@/components/PdChart/index.vue";

// 团队指标达成
const teamCard = ref({
  name: "teamCard",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: params => {
        let result = `<div style="font-weight: bold">${params[0].name}</div>`;
        params.forEach(param => {
          const seriesName = param.seriesName;
          const value = param.value;
          // 对于使用第二个 Y 轴的系列（达成情况和达成进度），添加百分号
          if (param.seriesIndex === 2 || param.seriesIndex === 3) {
            result += `<div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${param.marker} ${seriesName}</span>
              <span style="margin-left: 10px; font-weight: bold;">${value}%</span>
            </div>`;
          } else {
            result += `<div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${param.marker} ${seriesName}</span>
              <span style="margin-left: 10px; font-weight: bold;">${value}</span>
            </div>`;
          }
        });
        return result;
      }
    },
    legend: {
      show: true,
      orient: "horizontal",
      left: "left",
      icon: "circle",
      itemWidth: 16, // 图标宽度
      itemHeight: 16, // 图标高度
      itemGap: 10, // 图例项之间的间距
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    xAxis: {
      type: "category",
      data: [
        "商超",
        "天猫团队",
        "京东拼多多团队",
        "哈宠团队",
        "抖音团队",
        "线上分销",
        "线下分销",
        "跨境电商"
      ],
      axisLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    yAxis: [
      {
        type: "value",
        axisLabel: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#666",
          fontFamily: "sans-serif"
        }
      },
      {
        type: "value",
        axisLabel: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#666",
          fontFamily: "sans-serif",
          formatter: value => `${value}%`
        }
      }
    ],
    series: [
      {
        name: "本期累计",
        type: "bar",
        data: [1548, 1171, 618, 496, 480, 439, 216, 25],
        itemStyle: {
          color: "#12239E"
        },
        label: {
          show: true,
          position: "top",
          fontSize: 14,
          fontWeight: "bold",
          color: "#666",
          fontFamily: "sans-serif"
        },
        emphasis: {
          focus: "series"
        }
      },
      {
        name: "去年同期",
        type: "bar",
        data: [771, 1154, 509, 457, 475, 461, 254, 0],
        itemStyle: {
          color: "#118DFF"
        },
        label: {
          show: true,
          position: "top",
          fontSize: 14,
          fontWeight: "bold",
          color: "#666",
          fontFamily: "sans-serif"
        },
        emphasis: {
          focus: "series"
        }
      },
      {
        name: "达成情况",
        type: "line",
        yAxisIndex: 1,
        data: [186, 96, 111, 117, 106, 131, 129, 76],
        itemStyle: {
          color: "#E66C37"
        },
        label: {
          show: true,
          position: "top",
          fontSize: 14,
          fontWeight: "bold",
          color: "#666",
          fontFamily: "sans-serif",
          formatter: params => `${params.value}%`
        },
        emphasis: {
          focus: "series"
        }
      },
      {
        name: "达成进度",
        type: "line",
        yAxisIndex: 1,
        data: [24, 8, 14, 16, 9, 10, 10, 7],
        itemStyle: {
          color: "#E044A7"
        },
        label: {
          show: true,
          position: "top",
          fontSize: 14,
          fontWeight: "bold",
          color: "#666",
          fontFamily: "sans-serif",
          formatter: params => `${params.value}%`
        },
        emphasis: {
          focus: "series"
        }
      }
    ]
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="text-xl text-[#0a0a0a]">团队指标达成</div>
      <ChartCard
        :name="teamCard.name"
        :title="teamCard.title"
        :text="teamCard.text"
        :option="teamCard.option"
        :style="teamCard?.style"
        :clacHeight="0"
        :showCard="false"
      />
    </el-card>
  </div>
</template>
