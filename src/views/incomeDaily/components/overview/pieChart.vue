<script setup lang="ts">
import { inject, ref, watch } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import { formatToWan } from "../../utils/calc";

// 销售额
const salesMonthCard = ref({
  name: "salesMonthCard",
  title: "",
  text: "",
  option: {
    title: {
      text: "本月累计销售额",
      left: "center",
      top: 20,
      textStyle: {
        color: "#0a0a0a",
        fontSize: 14,
        fontWeight: "bold"
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}:${formatToWan(params.value)}(${params.percent}%)`;
      }
    },
    graphic: [
      {
        type: "group",
        left: "center",
        top: "70%",
        children: [
          {
            type: "text",
            style: {
              text: "0 万",
              textAlign: "center",
              textVerticalAlign: "middle",
              fontSize: 14,
              fontWeight: "bold",
              fill: "#0a0a0a"
            }
          }
        ]
      }
    ],
    series: [
      {
        minAngle: 5,
        avoidLabelOverlap: false,
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "70%"],
        startAngle: 180,
        endAngle: 360,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "线上", itemStyle: { color: "#3b82f6" } },
          // { value: 735, name: "线下", itemStyle: { color: "#f97316" } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "outside",
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)}\n${params.percent.toFixed(0)}%`;
          },
          fontSize: 11,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          length: 5, // 增加第一段线长度，让引导线垂直延伸更远
          length2: 0, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    height: "200px"
  }
});
const salesYearCards = ref({
  name: "salesYearCards",
  title: "",
  text: "",
  option: {
    title: {
      text: "年累计销售额",
      left: "center",
      top: 20,
      textStyle: {
        color: "#0a0a0a",
        fontSize: 14,
        fontWeight: "bold"
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}:${formatToWan(params.value)}(${params.percent}%)`;
      }
    },
    graphic: [
      {
        type: "group",
        left: "center",
        top: "70%",
        children: [
          {
            type: "text",
            style: {
              text: "0 万",
              textAlign: "center",
              textVerticalAlign: "middle",
              fontSize: 14,
              fontWeight: "bold",
              fill: "#0a0a0a"
            }
          }
        ]
      }
    ],
    series: [
      {
        minAngle: 5,
        avoidLabelOverlap: false,
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "70%"],
        startAngle: 180,
        endAngle: 360,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "线上", itemStyle: { color: "#3b82f6" } },
          // { value: 735, name: "线下", itemStyle: { color: "#f97316" } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "outside",
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)}\n${params.percent.toFixed(0)}%`;
          },
          fontSize: 11,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          length: 5, // 增加第一段线长度，让引导线垂直延伸更远
          length2: 0, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    height: "200px"
  }
});

// 获取数据
const incomeData = inject<any>("incomeData");
// 监听赋值
watch(
  () => incomeData.value,
  () => {
    if (
      incomeData.value &&
      incomeData.value.onlineOffChartData &&
      incomeData.value.onlineOffChartData.length === 2
    ) {
      incomeData.value.onlineOffChartData.forEach(
        (item: any, index: number) => {
          const temp = [
            {
              value: item.online,
              name: "线上",
              itemStyle: { color: "#3b82f6" }
            },
            {
              value: item.offline,
              name: "线下",
              itemStyle: { color: "#f97316" }
            }
          ];

          const totalText = `${((item.online + item.offline) / 10000).toFixed(0)} 万`;

          if (index === 0) {
            salesMonthCard.value.option.series[0].data = temp;
            salesMonthCard.value.option.graphic[0].children[0].style.text =
              totalText;
          }
          if (index === 1) {
            salesYearCards.value.option.series[0].data = temp;
            salesYearCards.value.option.graphic[0].children[0].style.text =
              totalText;
          }
        }
      );
    }
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <div>
    <ChartCard
      :name="salesMonthCard.name"
      :title="salesMonthCard.title"
      :text="salesMonthCard.text"
      :option="salesMonthCard.option"
      :style="salesMonthCard?.style"
      :showCard="false"
      :clacHeight="0"
    />
    <ChartCard
      :name="salesYearCards.name"
      :title="salesYearCards.title"
      :text="salesYearCards.text"
      :option="salesYearCards.option"
      :style="salesYearCards?.style"
      :showCard="false"
      :clacHeight="0"
    />
  </div>
</template>
