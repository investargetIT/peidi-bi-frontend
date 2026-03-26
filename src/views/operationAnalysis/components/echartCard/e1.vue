<script setup lang="ts">
import { ref } from "vue";
import ChartCard from "@/components/PdChart/index.vue";

// 核心指标达成总览
const coreCard1 = ref({
  name: "coreCard1",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "item"
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: ["45%", "70%"],
        avoidLabelOverlap: false,
        label: {
          fontSize: 16,
          fontWeight: "bold",
          lineHeight: 22,
          color: "#666",
          fontFamily: "sans-serif",
          formatter: params => {
            const percent = params.percent.toFixed(1);
            return `${params.name}\n${params.value} (${percent}%)`;
          }
        },
        data: [
          { value: 395, name: "哈宠千百仓", itemStyle: { color: "#118DFF" } },
          { value: 3962, name: "杭州智创", itemStyle: { color: "#12239E" } },
          { value: 185, name: "内销其他", itemStyle: { color: "#E66C37" } }
        ]
      }
    ]
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});

const coreCard2 = ref({
  name: "coreCard2",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "item"
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: ["45%", "70%"],
        avoidLabelOverlap: false,
        label: {
          fontSize: 16,
          fontWeight: "bold",
          lineHeight: 22,
          color: "#666",
          fontFamily: "sans-serif",
          formatter: params => {
            const percent = params.percent.toFixed(1);
            return `${params.name}\n${params.value} (${percent}%)`;
          }
        },
        data: [
          {
            value: 4358,
            name: "⾃主品牌收⼊",
            itemStyle: { color: "#12239E" }
          },
          { value: 184, name: "其他收⼊", itemStyle: { color: "#118DFF" } }
        ]
      }
    ]
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});

const coreCard3 = ref({
  name: "coreCard3",
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
          result += `<div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${param.marker} ${param.seriesName}</span>
            <span style="margin-left: 10px; font-weight: bold;">${param.value}%</span>
          </div>`;
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
      data: ["哈宠千百仓", "杭州智创", "内销其他"],
      axisLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    yAxis: {
      type: "value",
      show: false
    },
    series: [
      {
        name: "完成率",
        type: "bar",
        data: [146, 110, 29],
        itemStyle: {
          color: "#118DFF"
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
        name: "全年进度",
        type: "bar",
        data: [13, 10, 3],
        itemStyle: {
          color: "#12239E"
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
        name: "同比",
        type: "bar",
        data: [-2, 13, 41],
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
      }
    ]
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});

const coreCard4 = ref({
  name: "coreCard4",
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
          result += `<div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${param.marker} ${param.seriesName}</span>
            <span style="margin-left: 10px; font-weight: bold;">${param.value}%</span>
          </div>`;
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
      data: ["⾃主品牌收⼊", "其他收⼊"],
      axisLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    yAxis: {
      type: "value",
      show: false
    },
    series: [
      {
        name: "完成率",
        type: "bar",
        data: [108, 50],
        itemStyle: {
          color: "#118DFF"
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
        name: "全年进度",
        type: "bar",
        data: [10, 5],
        itemStyle: {
          color: "#12239E"
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
        name: "同比",
        type: "bar",
        data: [27, -70],
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
      <div class="text-xl text-[#0a0a0a]">核心指标达成总览</div>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="24" :md="12">
          <ChartCard
            :name="coreCard1.name"
            :title="coreCard1.title"
            :text="coreCard1.text"
            :option="coreCard1.option"
            :style="coreCard1?.style"
            :clacHeight="0"
            :showCard="false"
          />
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <ChartCard
            :name="coreCard3.name"
            :title="coreCard3.title"
            :text="coreCard3.text"
            :option="coreCard3.option"
            :style="coreCard3?.style"
            :clacHeight="0"
            :showCard="false"
          />
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <ChartCard
            :name="coreCard2.name"
            :title="coreCard2.title"
            :text="coreCard2.text"
            :option="coreCard2.option"
            :style="coreCard2?.style"
            :clacHeight="0"
            :showCard="false"
          />
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <ChartCard
            :name="coreCard4.name"
            :title="coreCard4.title"
            :text="coreCard4.text"
            :option="coreCard4.option"
            :style="coreCard4?.style"
            :clacHeight="0"
            :showCard="false"
          />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
