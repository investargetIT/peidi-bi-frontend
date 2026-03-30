<script setup lang="ts">
import { computed, ref, PropType } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import dayjs from "dayjs";
import { DATA_TIME } from "../../utils/config";

const props = defineProps({
  excelData: {
    type: Array as PropType<any[]>,
    default: () => []
  }
});

// 核心指标达成总览
const getCoreCard1Data = computed(() => {
  const data = props.excelData?.[0]?.data || [];
  return [
    { value: 395, name: "哈宠千百仓", itemStyle: { color: "#118DFF" } },
    { value: 3962, name: "杭州智创", itemStyle: { color: "#12239E" } },
    { value: 185, name: "内销其他", itemStyle: { color: "#E66C37" } }
  ].map(item => {
    item.value =
      data.find(d => d[dayjs().month() + "月"].trim() === item.name)?.[
        "当期实际"
      ] || 0;
    return item;
  });
});
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
        emphasis: {
          focus: "self",
          scale: true,
          scaleSize: 10
        },
        blur: {
          alpha: 0.3
        },
        data: getCoreCard1Data
        // [
        //   { value: 395, name: "哈宠千百仓", itemStyle: { color: "#118DFF" } },
        //   { value: 3962, name: "杭州智创", itemStyle: { color: "#12239E" } },
        //   { value: 185, name: "内销其他", itemStyle: { color: "#E66C37" } }
        // ]
      }
    ]
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});

const getCoreCard2Data = computed(() => {
  const data = props.excelData?.[0]?.data || [];

  // 定义三个系列的配置
  const seriesConfig = [
    { name: "完成率", color: "#118DFF" },
    { name: "全年进度", color: "#12239E" },
    { name: "同比", color: "#E66C37" }
  ];

  // 从 excelData 中提取数据的逻辑（需要根据实际数据结构调整）
  // 这里假设需要从 data 中计算这些值
  const xValues = ["哈宠千百仓", "杭州智创", "内销其他"];

  // 示例：根据实际业务逻辑计算数据
  const completionRates = xValues.map(name => {
    const item = data.find(d => d[dayjs().month() + "月"]?.trim() === name);
    return item ? (item?.["完成率"] * 100).toFixed(0) || 0 : 0;
  });

  const yearProgress = xValues.map(name => {
    const item = data.find(d => d[dayjs().month() + "月"]?.trim() === name);
    return item ? (item?.["全年进度"] * 100).toFixed(0) || 0 : 0;
  });

  const yoyGrowth = xValues.map(name => {
    const item = data.find(d => d[dayjs().month() + "月"]?.trim() === name);
    return item
      ? (
          ((item?.["当期实际"] - item?.["去年同期"]) / item?.["去年同期"]) *
          100
        ).toFixed(0) || 0
      : 0;
  });

  return [
    {
      name: "完成率",
      type: "bar",
      data: completionRates,
      itemStyle: { color: seriesConfig[0].color },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: (params: any) => `${params.value}%`
      },
      emphasis: { focus: "series" }
    },
    {
      name: "全年进度",
      type: "bar",
      data: yearProgress,
      itemStyle: { color: seriesConfig[1].color },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: (params: any) => `${params.value}%`
      },
      emphasis: { focus: "series" }
    },
    {
      name: "同比",
      type: "bar",
      data: yoyGrowth,
      itemStyle: { color: seriesConfig[2].color },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: (params: any) => `${params.value}%`
      },
      emphasis: { focus: "series" }
    }
  ];
});
const coreCard2 = ref({
  name: "coreCard2",
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
    series: getCoreCard2Data
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});

const getCoreCard3Data = computed(() => {
  const data = props.excelData?.[0]?.data || [];
  return [
    {
      value: 4358,
      name: "自主品牌收入",

      itemStyle: { color: "#12239E" }
    },
    { value: 184, name: "其他收入", itemStyle: { color: "#118DFF" } }
  ].map(item => {
    item.value =
      data.find(d => d[dayjs().month() + "月"].trim() === item.name)?.[
        "当期实际"
      ] || 0;
    return item;
  });
});
const coreCard3 = ref({
  name: "coreCard3",
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
        emphasis: {
          focus: "self",
          scale: true,
          scaleSize: 10
        },
        blur: {
          alpha: 0.3
        },
        data: getCoreCard3Data
        // [
        //   {
        //     value: 4358,
        //     name: "⾃主品牌收⼊",
        //     itemStyle: { color: "#12239E" }
        //   },
        //   { value: 184, name: "其他收⼊", itemStyle: { color: "#118DFF" } }
        // ]
      }
    ]
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});

const getCoreCard4Data = computed(() => {
  const data = props.excelData?.[0]?.data || [];

  // 定义三个系列的配置
  const seriesConfig = [
    { name: "完成率", color: "#118DFF" },
    { name: "全年进度", color: "#12239E" },
    { name: "同比", color: "#E66C37" }
  ];

  // 从 excelData 中提取数据的逻辑
  const xValues = ["自主品牌收入", "其他收入"];

  // 根据实际业务逻辑计算数据
  const completionRates = xValues.map(name => {
    const item = data.find(d => d[dayjs().month() + "月"]?.trim() === name);
    return item ? (item?.["完成率"] * 100).toFixed(0) || 0 : 0;
  });

  const yearProgress = xValues.map(name => {
    const item = data.find(d => d[dayjs().month() + "月"]?.trim() === name);
    return item ? (item?.["全年进度"] * 100).toFixed(0) || 0 : 0;
  });

  const yoyGrowth = xValues.map(name => {
    const item = data.find(d => d[dayjs().month() + "月"]?.trim() === name);
    return item
      ? (
          ((item?.["当期实际"] - item?.["去年同期"]) / item?.["去年同期"]) *
          100
        ).toFixed(0) || 0
      : 0;
  });

  return [
    {
      name: "完成率",
      type: "bar",
      data: completionRates,
      itemStyle: { color: seriesConfig[0].color },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: (params: any) => `${params.value}%`
      },
      emphasis: { focus: "series" }
    },
    {
      name: "全年进度",
      type: "bar",
      data: yearProgress,
      itemStyle: { color: seriesConfig[1].color },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: (params: any) => `${params.value}%`
      },
      emphasis: { focus: "series" }
    },
    {
      name: "同比",
      type: "bar",
      data: yoyGrowth,
      itemStyle: { color: seriesConfig[2].color },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        fontFamily: "sans-serif",
        formatter: (params: any) => `${params.value}%`
      },
      emphasis: { focus: "series" }
    }
  ];
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
      data: ["自主品牌收入", "其他收入"],
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
    series: getCoreCard4Data
  },
  style: {
    width: "100%",
    // height: "200px",
    borderRadius: "10px"
  }
});

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
          seriesIndex: [0, 1, 2],
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
          seriesIndex: [0, 1, 2]
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
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="text-xl text-[#0a0a0a]">
        核心指标达成总览
        <span class="text-[#666] text-sm">(数据期间：{{ DATA_TIME }})</span>
      </div>
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
            @chart-ready="handlePieChart1Ready"
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
            @chart-ready="handleBarChart1Ready"
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
            @chart-ready="handlePieChart2Ready"
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
            @chart-ready="handleBarChart2Ready"
          />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
