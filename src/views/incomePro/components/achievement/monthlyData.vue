<script setup lang="ts">
import { ref, watch } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import _ from "lodash";
import dayjs from "dayjs";

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  dataList: {
    type: Array,
    required: true
  },
  yearOverYearGrowthList: {
    type: Array,
    required: true
  },
  monthOverMonthGrowthList: {
    type: Array,
    required: true
  }
});

// 月度数据
const monthlyDataCards = ref({
  name: "monthlyDataCards" + props.id,
  title: "",
  text: "",
  option: {
    textStyle: {
      fontFamily: "NotoSansSC, Geist"
    },
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
      data: ["本年", "同比", "环比"]
    },
    xAxis: [
      {
        type: "category",
        data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        axisPointer: {
          type: "shadow"
        },
        axisLabel: {
          show: true,
          interval: 0 //使x轴文字显示全
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "业绩(万)",
        // min: 0,
        // max: 250,
        // interval: 50,
        axisLabel: {
          formatter: "{value}",
          show: true
        },
        splitLine: {
          show: false
        }
      },
      {
        type: "value",
        name: "比例(%)",
        // min: 0,
        // max: 25,
        // interval: 5,
        axisLabel: {
          formatter: "{value}"
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: "本年",
        type: "bar",
        itemStyle: {
          color: params => {
            const seriesData = monthlyDataCards.value.option.series[0].data;
            const maxVal = Math.max(...seriesData);
            const currentValue = params.value;
            if (currentValue === maxVal) {
              return "#20C6DF";
            }
            return "#3B82F6";
          }
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
        data: [
          // 25, 30, 20, 15, 10, 5, 0, 25, 30, 20, 15, 10, 5
        ]
      },
      {
        name: "同比",
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
            return value + "%";
          }
        },
        markLine: {
          symbol: "none",
          lineStyle: {
            color: "#ccc",
            width: 1,
            type: "dashed"
          },
          data: [
            {
              yAxis: 0
            }
          ]
        },
        data: [
          // 2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2, 2.0
        ]
      },
      {
        name: "环比",
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
            return value + "%";
          }
        },
        data: [
          // 3.0, 2.6, 2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0
        ]
      }
    ]
  },
  style: {
    width: "100%",
    height: "300"
  }
});

watch(
  () => [
    props.dataList,
    props.yearOverYearGrowthList,
    props.monthOverMonthGrowthList
  ],
  ([dataList, yearOverYearGrowthList, monthOverMonthGrowthList]) => {
    if (
      !dataList.length ||
      !yearOverYearGrowthList.length ||
      !monthOverMonthGrowthList.length
    )
      return;
    // console.log(
    //   "图表数据:",
    //   dataList,
    //   yearOverYearGrowthList,
    //   monthOverMonthGrowthList
    // );

    // 当前月份 当前月份之后的数据截取掉不展示
    const currentMonth = dayjs().month() + 1;
    const barData = dataList.map((item: any) => _.floor(item.income / 10000));
    monthlyDataCards.value = {
      ...monthlyDataCards.value,
      option: {
        ...monthlyDataCards.value.option,
        series: [
          {
            ...monthlyDataCards.value.option.series[0],
            data: barData.slice(0, currentMonth)
          },
          {
            ...monthlyDataCards.value.option.series[1],
            data: yearOverYearGrowthList
              .map((item: any) => _.floor(item.growthRate))
              .slice(0, currentMonth - 1)
          },
          {
            ...monthlyDataCards.value.option.series[2],
            data: monthOverMonthGrowthList
              .map((item: any) => _.floor(item.growthRate))
              .slice(0, currentMonth - 1)
          }
        ]
      }
    };
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div>
    <ChartCard
      :name="monthlyDataCards.name"
      :title="monthlyDataCards.title"
      :text="monthlyDataCards.text"
      :option="monthlyDataCards.option"
      :style="monthlyDataCards?.style"
    />
  </div>
</template>
