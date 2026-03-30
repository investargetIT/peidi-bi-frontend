<script setup lang="ts">
import { ref } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import * as echarts from "echarts";
import { DATA_TIME } from "../../utils/config";

// 成本结构
const costStructure1 = ref({
  name: "costStructure1",
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
      itemWidth: 16,
      itemHeight: 16,
      itemGap: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    xAxis: {
      type: "category",
      data: ["商品成本率", "营销费率", "⼈⼒成本率", "履约费率", "管理费率"],
      axisLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: value => `${value}%`
      }
    },
    series: [
      {
        name: "",
        type: "bar",
        data: [70.3, 23.7, 9.2, 8.0, 0.5],
        itemStyle: {
          color: params => {
            const colors = [
              "#118DFF",
              "#12239E",
              "#E66C37",
              "#6B007B",
              "#E044A7"
            ];
            return colors[params.dataIndex];
          }
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
          focus: "self",
          itemStyle: {
            opacity: 1
          }
        },
        blur: {
          itemStyle: {
            opacity: 0.2
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    height: "1000",
    borderRadius: "10px"
  }
});

const costStructure2 = ref({
  name: "costStructure2",
  title: "成本占⽐",
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
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: "outside",
          alignTo: "none",
          bleedMargin: 15,
          fontSize: 14,
          fontWeight: "bold",
          lineHeight: 16,
          color: "#666",
          fontFamily: "sans-serif",
          formatter: params => {
            const percent = params.percent.toFixed(1);
            return `${params.name}\n${params.value} (${percent}%)`;
          }
        },
        labelLayout: {
          hideOverlap: false
        },
        emphasis: {
          focus: "self",
          scale: true,
          scaleSize: 10
        },
        blur: {
          alpha: 0.3
        },
        data: [
          { value: 62.9, name: "商品成本率", itemStyle: { color: "#118DFF" } },
          { value: 0.4, name: "管理费率", itemStyle: { color: "#E044A7" } },
          { value: 7.2, name: "履约费率", itemStyle: { color: "#6B007B" } },
          { value: 8.2, name: "⼈⼒成本率", itemStyle: { color: "#E66C37" } },
          { value: 21.2, name: "营销费率", itemStyle: { color: "#12239E" } }
        ]
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

const costStructure3 = ref({
  name: "costStructure3",
  title: "同⽐变化",
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
      itemWidth: 16,
      itemHeight: 16,
      itemGap: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    xAxis: {
      type: "category",
      data: ["商品成本率", "管理费率", "履约费率", "⼈⼒成本率", "营销费率"],
      axisLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: value => `${value}%`
      }
    },
    series: [
      {
        name: "",
        type: "bar",
        data: [2, -0.2, -0.4, -1.6, -3.9],
        itemStyle: {
          color: params => {
            const colors = [
              "#118DFF",
              "#E044A7",
              "#6B007B",
              "#E66C37",
              "#12239E"
            ];
            return colors[params.dataIndex];
          }
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
          focus: "self",
          itemStyle: {
            opacity: 1
          }
        },
        blur: {
          itemStyle: {
            opacity: 0.2
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

let barChart1: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;
let barChart2: echarts.ECharts | null = null;

const handleBarChart1Ready = (chart: echarts.ECharts) => {
  barChart1 = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series") {
      const name = params.name;
      if (pieChart) {
        pieChart.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
      if (barChart2) {
        barChart2.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series") {
      if (pieChart) {
        pieChart.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
      if (barChart2) {
        barChart2.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
    }
  });
};

const handlePieChartReady = (chart: echarts.ECharts) => {
  pieChart = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series" && params.seriesName === "") {
      const name = params.name;
      if (barChart1) {
        barChart1.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
      if (barChart2) {
        barChart2.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series" && params.seriesName === "") {
      if (barChart1) {
        barChart1.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
      if (barChart2) {
        barChart2.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
    }
  });
};

const handleBarChart2Ready = (chart: echarts.ECharts) => {
  barChart2 = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series") {
      const name = params.name;
      if (barChart1) {
        barChart1.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
      if (pieChart) {
        pieChart.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series") {
      if (barChart1) {
        barChart1.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
      if (pieChart) {
        pieChart.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
    }
  });
};
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="text-xl text-[#0a0a0a]">
        成本结构
        <span class="text-[#666] text-sm">(数据期间：{{ DATA_TIME }})</span>
      </div>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="24" :md="12">
          <div class="relative">
            <div
              class="absolute top-0 right-0 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-sm"
            >
              <div class="text-[#0a0a0a] font-bold text-sm">
                <div class="text-[#118DFF] font-bold text-base">
                  去除沃尔玛后⽑利率
                </div>
                <div class="flex items-center mt-2">
                  <div>34.6%</div>
                  <div class="ml-5">-2.4%</div>
                </div>
                <div class="text-[#118DFF] font-bold text-base mt-3">
                  去除沃尔玛后营销费率
                </div>
                <div class="flex items-center mt-2">
                  <div>32.2%</div>
                  <div class="ml-5">-1.9%</div>
                </div>
              </div>
            </div>
            <ChartCard
              :name="costStructure1.name"
              :title="costStructure1.title"
              :text="costStructure1.text"
              :option="costStructure1.option"
              :style="costStructure1?.style"
              :clacHeight="0"
              :showCard="false"
              @chart-ready="handleBarChart1Ready"
            />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <ChartCard
            :name="costStructure2.name"
            :title="costStructure2.title"
            :text="costStructure2.text"
            :option="costStructure2.option"
            :style="costStructure2?.style"
            :clacHeight="0"
            :showCard="false"
            @chart-ready="handlePieChartReady"
          />
          <ChartCard
            :name="costStructure3.name"
            :title="costStructure3.title"
            :text="costStructure3.text"
            :option="costStructure3.option"
            :style="costStructure3?.style"
            :clacHeight="0"
            :showCard="false"
            @chart-ready="handleBarChart2Ready"
          />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
