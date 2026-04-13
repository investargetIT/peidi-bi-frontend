<script setup lang="ts">
import { computed, ref } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import { DATA_TIME } from "../../utils/config";

const props = defineProps({
  sizeConfig: {
    type: Object,
    required: true
  }
});

// 团队指标达成
const teamCard = computed(() => ({
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
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    dataZoom: [
      {
        show: props.sizeConfig.name === "XS",
        type: "inside",
        start: 0,
        end: props.sizeConfig.name === "XS" ? 40 : 100
      },
      {
        show: props.sizeConfig.name === "XS",
        type: "slider",
        start: 0,
        end: props.sizeConfig.name === "XS" ? 40 : 100
      }
    ],
    xAxis: {
      type: "category",
      data: [
        "哈宠团队",
        "天猫团队",
        "京东拼多多团队",
        "抖音团队",
        "销售一组",
        "销售二组",
        "销售三组",
        "跨境电商",
        "Vivaland"
      ],
      axisLabel: {
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif",
        interval: 0,
        rotate: props.sizeConfig.rotate
      }
    },
    yAxis: [
      {
        type: "value",
        axisLabel: {
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          color: "#666",
          fontFamily: "sans-serif"
        }
      },
      {
        type: "value",
        axisLabel: {
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
        data: [814, 1834, 1030, 823, 361, 777, 1884, 27, 1],
        itemStyle: {
          color: "#12239E"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
        data: [756, 1970, 771, 761, 298, 780, 1388, 0, 0],
        itemStyle: {
          color: "#118DFF"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
        data: [126, 85, 115, 98, 120, 114, 139, 49, 12],
        itemStyle: {
          color: "#E66C37"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          color: "#666",
          fontFamily: "sans-serif",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          padding: [4, 6],
          borderRadius: 3,
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
        data: [26, 13, 24, 16, 17, 18, 30, 8, 0],
        itemStyle: {
          color: "#E044A7"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          color: "#666",
          fontFamily: "sans-serif",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          padding: [4, 6],
          borderRadius: 3,
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
}));
</script>

<template>
  <div>
    <!-- <el-card shadow="never" style="border-radius: 10px"> -->
    <div class="text-[#0a0a0a] text-base md:text-xl">
      团队指标达成
      <span class="text-[#666] text-xs md:text-sm">
        (数据期间: {{ DATA_TIME }})
      </span>
    </div>
    <ChartCard
      :name="teamCard.name"
      :title="teamCard.title"
      :text="teamCard.text"
      :option="teamCard.option"
      :style="teamCard?.style"
      :clacHeight="0"
      :showCard="false"
    />
    <!-- </el-card> -->
  </div>
</template>
