<script setup lang="ts">
import { computed, ref } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import * as echarts from "echarts";
import { DATA_TIME } from "../../utils/config";

const props = defineProps({
  sizeConfig: {
    type: Object,
    required: true
  }
});

// 成本结构
const costStructure1 = computed(() => ({
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
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    xAxis: {
      type: "category",
      data: ["商品成本率", "履约费率", "营销费率", "人力成本率", "管理费率"],
      axisLabel: {
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif",
        interval: 0,
        rotate: props.sizeConfig.rotate
      }
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: {
          type: "dashed"
        }
      },
      axisLabel: {
        fontSize: props.sizeConfig.fontSizeL2,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif",
        formatter: value => `${value}%`
      }
    },
    series: [
      {
        name: "",
        type: "bar",
        data: [68.2, 8, 23.7, 9.8, 0.4],
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
          fontSize: props.sizeConfig.fontSize,
          fontWeight: props.sizeConfig.fontWeight,
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
    height: props.sizeConfig.name === "XS" ? "450" : "950",
    borderRadius: "10px"
  }
}));

const costStructure2 = computed(() => ({
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
        radius: props.sizeConfig.pieRadius,
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: "outside",
          alignTo: "none",
          fontSize: props.sizeConfig.fontSize,
          fontWeight: props.sizeConfig.fontWeight,
          lineHeight: props.sizeConfig.fontSize,
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
          { value: 60.9, name: "商品成本率", itemStyle: { color: "#118DFF" } },
          { value: 7.2, name: "履约费率", itemStyle: { color: "#6B007B" } },
          { value: 21.2, name: "营销费率", itemStyle: { color: "#12239E" } },
          { value: 8.9, name: "⼈⼒成本率", itemStyle: { color: "#E66C37" } },
          { value: 0.3, name: "管理费率", itemStyle: { color: "#E044A7" } }
        ]
      }
    ]
  },
  style: {
    width: "100%",
    height: props.sizeConfig.name === "XS" ? "250" : "450",
    borderRadius: "10px"
  }
}));

const costStructure3 = computed(() => ({
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
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    xAxis: {
      type: "category",
      data: ["商品成本率", "履约费率", "营销费率", "⼈⼒成本率", "管理费率"],
      axisLabel: {
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif",
        interval: 0,
        rotate: props.sizeConfig.rotate
      }
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: {
          type: "dashed"
        }
      },
      axisLabel: {
        fontSize: props.sizeConfig.fontSizeL2,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif",
        formatter: value => `${value}%`
      }
    },
    series: [
      {
        name: "",
        type: "bar",
        data: [1.02, -0.3, 0.32, -0.11, -0.09],
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
          fontSize: props.sizeConfig.fontSize,
          fontWeight: props.sizeConfig.fontWeight,
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
    height: props.sizeConfig.name === "XS" ? "250" : "450",
    borderRadius: "10px"
  }
}));

//#region 联动逻辑
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
//#endregion
</script>

<template>
  <div>
    <!-- <el-card shadow="never" style="border-radius: 10px"> -->
    <div class="text-[#0a0a0a] text-base md:text-xl">
      成本结构
      <span class="text-[#666] text-xs md:text-sm">
        (数据期间: {{ DATA_TIME }})
      </span>
    </div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :md="12">
        <div class="relative">
          <div
            class="absolute top-0 right-0 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-sm"
          >
            <div class="text-[#0a0a0a] font-bold text-xs md:text-sm">
              <div class="text-[#118DFF] font-bold">去除沃尔玛后⽑利率</div>
              <div class="flex items-center mt-2">
                <div>37.53%</div>
                <div class="ml-5">-0.69%</div>
              </div>
              <div class="text-[#118DFF] font-bold mt-3">
                去除沃尔玛后营销费率
              </div>
              <div class="flex items-center mt-2">
                <div>29.34%</div>
                <div class="ml-5">1.37%</div>
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
      <el-col :xs="24" :sm="12" :md="12">
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
    <!-- </el-card> -->
  </div>
</template>
