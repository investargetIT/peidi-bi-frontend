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

// 产品结构
const productStructure1 = computed(() => ({
  name: "productStructure1",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "item"
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "7245",
          textAlign: "center",
          fill: "#333",
          fontSize: props.sizeConfig.fontSize * 1.5,
          fontWeight: "bold",
          fontFamily: "sans-serif"
        }
      },
      {
        type: "text",
        left: "center",
        top: "55%",
        style: {
          text: "总计",
          textAlign: "center",
          fill: "#999",
          fontSize: props.sizeConfig.fontSize * 0.9,
          fontFamily: "sans-serif"
        }
      }
    ],
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
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          lineHeight: props.sizeConfig.fontSizeL2,
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
          { value: 6433, name: "爵宴", itemStyle: { color: "#12239E" } },
          { value: 308, name: "SMB/⻮能", itemStyle: { color: "#118DFF" } },
          { value: 503, name: "好适嘉", itemStyle: { color: "#E66C37" } },
          { value: 1, name: "Vivaland", itemStyle: { color: "#E044A7" } }
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

const productStructure2 = computed(() => ({
  name: "productStructure2",
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
      data: ["爵宴", "SMB/⻮能", "好适嘉", "Vivaland"],
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
      show: false
    },
    series: [
      {
        name: "进度",
        type: "bar",
        data: [16, 15, 10, 0],
        itemStyle: {
          color: "#118DFF"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
        data: [16, -20, 20, 0],
        itemStyle: {
          color: "#12239E"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
    height: props.sizeConfig.name === "XS" ? "250" : "450",
    borderRadius: "10px"
  }
}));

const productStructure3 = computed(() => ({
  name: "productStructure3",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "item"
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "6434",
          textAlign: "center",
          fill: "#333",
          fontSize: props.sizeConfig.fontSize * 1.5,
          fontWeight: "bold",
          fontFamily: "sans-serif"
        }
      },
      {
        type: "text",
        left: "center",
        top: "55%",
        style: {
          text: "总计",
          textAlign: "center",
          fill: "#999",
          fontSize: props.sizeConfig.fontSize * 0.9,
          fontFamily: "sans-serif"
        }
      }
    ],
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
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          lineHeight: props.sizeConfig.fontSizeL2,
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
          {
            value: 4883,
            name: "爵宴⻛⼲零⻝",
            itemStyle: { color: "#198E44" }
          },
          { value: 578, name: "爵宴湿粮", itemStyle: { color: "#C1F087" } },
          { value: 348, name: "爵宴⻛⼲粮", itemStyle: { color: "#BDD643" } },
          { value: 121, name: "爵宴烘焙粮", itemStyle: { color: "#3EF882" } },
          { value: 504, name: "爵宴冻⼲", itemStyle: { color: "#21C149" } }
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

const productStructure4 = computed(() => ({
  name: "productStructure4",
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
      data: [
        "爵宴⻛⼲零⻝",
        "爵宴湿粮",
        "爵宴⻛⼲粮",
        "爵宴烘焙粮",
        "爵宴冻⼲"
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
    yAxis: {
      type: "value",
      show: false
    },
    series: [
      {
        name: "进度",
        type: "bar",
        data: [20, 19, 7, 3, 17],
        itemStyle: {
          color: "#C1F087"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
        data: [13, 22, -13, 0, 51],
        itemStyle: {
          color: "#198E44"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          color: "#666",
          fontFamily: "sans-serif",
          formatter: params => `${params.value}%`
        },
        emphasis: {
          focus: "series"
        }
      },
      {
        name: "毛利率",
        type: "bar",
        data: [28, 38, 37, 26, 42],
        itemStyle: {
          color: "#BDD643"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
    height: props.sizeConfig.name === "XS" ? "250" : "450",
    borderRadius: "10px"
  }
}));

const productStructure5 = computed(() => ({
  name: "productStructure5",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "item"
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "503",
          textAlign: "center",
          fill: "#333",
          fontSize: props.sizeConfig.fontSize * 1.5,
          fontWeight: "bold",
          fontFamily: "sans-serif"
        }
      },
      {
        type: "text",
        left: "center",
        top: "55%",
        style: {
          text: "总计",
          textAlign: "center",
          fill: "#999",
          fontSize: props.sizeConfig.fontSize * 0.9,
          fontFamily: "sans-serif"
        }
      }
    ],
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
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          lineHeight: props.sizeConfig.fontSizeL2,
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
          { value: 215, name: "好适嘉湿粮", itemStyle: { color: "#EC8FCA" } },
          { value: 120, name: "好适嘉⼲粮", itemStyle: { color: "#E8D166" } },
          { value: 89, name: "好适嘉冻⼲", itemStyle: { color: "#D64550" } },
          {
            value: 79,
            name: "好适嘉其他 + 零食",
            itemStyle: { color: "#9071CE" }
          }
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

const productStructure6 = computed(() => ({
  name: "productStructure6",
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
      data: ["好适嘉湿粮", "好适嘉⼲粮", "好适嘉冻⼲", "好适嘉其他 + 零食"],
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
      show: false
    },
    series: [
      {
        name: "进度",
        type: "bar",
        data: [12, 10, 9, 8],
        itemStyle: {
          color: "#E68F96"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
        data: [-8, 74, 191, -10],
        itemStyle: {
          color: "#EC8FCA"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          color: "#666",
          fontFamily: "sans-serif",
          formatter: params => `${params.value}%`
        },
        emphasis: {
          focus: "series"
        }
      },
      {
        name: "毛利率",
        type: "bar",
        data: [29, 58, 40, 40],
        itemStyle: {
          color: "#C163CA"
        },
        label: {
          show: true,
          position: "top",
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
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
    height: props.sizeConfig.name === "XS" ? "250" : "450",
    borderRadius: "10px"
  }
}));

//#region 联动逻辑
let pieChart1: echarts.ECharts | null = null;
let barChart1: echarts.ECharts | null = null;

const handlePieChart1Ready = (chart: echarts.ECharts) => {
  pieChart1 = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series" && params.seriesName === "") {
      const name = params.name;
      if (barChart1) {
        barChart1.dispatchAction({
          type: "highlight",
          seriesIndex: [0, 1],
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
          seriesIndex: [0, 1]
        });
      }
    }
  });
};

const handleBarChart1Ready = (chart: echarts.ECharts) => {
  barChart1 = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series") {
      const name = params.name;
      if (pieChart1) {
        pieChart1.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series") {
      if (pieChart1) {
        pieChart1.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
    }
  });
};
let pieChart2: echarts.ECharts | null = null;
let barChart2: echarts.ECharts | null = null;

const handlePieChart2Ready = (chart: echarts.ECharts) => {
  pieChart2 = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series" && params.seriesName === "") {
      const name = params.name;
      if (barChart2) {
        barChart2.dispatchAction({
          type: "highlight",
          seriesIndex: [0, 1, 2],
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series" && params.seriesName === "") {
      if (barChart2) {
        barChart2.dispatchAction({
          type: "downplay",
          seriesIndex: [0, 1, 2]
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
      if (pieChart2) {
        pieChart2.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series") {
      if (pieChart2) {
        pieChart2.dispatchAction({
          type: "downplay",
          seriesIndex: 0
        });
      }
    }
  });
};

let pieChart3: echarts.ECharts | null = null;
let barChart3: echarts.ECharts | null = null;

const handlePieChart3Ready = (chart: echarts.ECharts) => {
  pieChart3 = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series" && params.seriesName === "") {
      const name = params.name;
      if (barChart3) {
        barChart3.dispatchAction({
          type: "highlight",
          seriesIndex: [0, 1, 2],
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series" && params.seriesName === "") {
      if (barChart3) {
        barChart3.dispatchAction({
          type: "downplay",
          seriesIndex: [0, 1, 2]
        });
      }
    }
  });
};

const handleBarChart3Ready = (chart: echarts.ECharts) => {
  barChart3 = chart;
  chart.on("mouseover", params => {
    if (params.componentType === "series") {
      const name = params.name;
      if (pieChart3) {
        pieChart3.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          name: name
        });
      }
    }
  });

  chart.on("mouseout", params => {
    if (params.componentType === "series") {
      if (pieChart3) {
        pieChart3.dispatchAction({
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
      产品结构
      <span class="text-[#666] text-xs md:text-sm">
        (数据期间: {{ DATA_TIME }})
      </span>
    </div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :md="12">
        <ChartCard
          :name="productStructure1.name"
          :title="productStructure1.title"
          :text="productStructure1.text"
          :option="productStructure1.option"
          :style="productStructure1?.style"
          :clacHeight="0"
          :showCard="false"
          @chart-ready="handlePieChart1Ready"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12">
        <ChartCard
          :name="productStructure2.name"
          :title="productStructure2.title"
          :text="productStructure2.text"
          :option="productStructure2.option"
          :style="productStructure2?.style"
          :clacHeight="0"
          :showCard="false"
          @chart-ready="handleBarChart1Ready"
        />
      </el-col>

      <el-col :xs="24" :sm="12" :md="12">
        <ChartCard
          :name="productStructure3.name"
          :title="productStructure3.title"
          :text="productStructure3.text"
          :option="productStructure3.option"
          :style="productStructure3?.style"
          :clacHeight="0"
          :showCard="false"
          @chart-ready="handlePieChart2Ready"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12">
        <ChartCard
          :name="productStructure4.name"
          :title="productStructure4.title"
          :text="productStructure4.text"
          :option="productStructure4.option"
          :style="productStructure4?.style"
          :clacHeight="0"
          :showCard="false"
          @chart-ready="handleBarChart2Ready"
        />
      </el-col>

      <el-col :xs="24" :sm="12" :md="12">
        <ChartCard
          :name="productStructure5.name"
          :title="productStructure5.title"
          :text="productStructure5.text"
          :option="productStructure5.option"
          :style="productStructure5?.style"
          :clacHeight="0"
          :showCard="false"
          @chart-ready="handlePieChart3Ready"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12">
        <ChartCard
          :name="productStructure6.name"
          :title="productStructure6.title"
          :text="productStructure6.text"
          :option="productStructure6.option"
          :style="productStructure6?.style"
          :clacHeight="0"
          :showCard="false"
          @chart-ready="handleBarChart3Ready"
        />
      </el-col>
    </el-row>
    <!-- </el-card> -->
  </div>
</template>
