<script setup lang="ts">
import { ref, watch } from "vue";
import ChartCard from "@/components/PdChart/index.vue";

const props = defineProps({
  timeType: {
    type: String as PropType<"year" | "month">,
    required: true
  },
  incomeWeekData: {
    type: Object,
    required: true
  },
  incomeMonthData: {
    type: Object,
    required: true
  }
});

// 销售额
const salesCards = ref({
  name: "salesCards",
  title: "",
  text: "",
  option: {
    title: {
      text: "",
      left: "center",
      top: "20",
      textStyle: {
        fontSize: 16,
        color: "#0a0a0a",
        fontFamily: "NotoSansSC Geist"
      }
    },
    tooltip: {
      trigger: "item"
    },
    legend: {
      bottom: "5%",
      left: "center"
    },
    graphic: [
      {
        type: "group",
        left: "center",
        top: "center",
        children: [
          {
            type: "text",
            left: "center",
            top: "center",
            style: {
              text: "0 万",
              textAlign: "center",
              textVerticalAlign: "middle",
              fontSize: 32,
              fontWeight: "bold",
              fill: "#333"
            }
          }
        ],
        keyframeAnimation: [
          {
            duration: 3000,
            loop: true,
            keyframes: [
              {
                percent: 0.5,
                easing: "sinusoidalInOut",
                scaleX: 0.97,
                scaleY: 0.97
              },
              {
                percent: 1,
                easing: "sinusoidalInOut",
                scaleX: 1,
                scaleY: 1
              }
            ]
          }
        ]
      }
    ],
    series: [
      {
        name: "",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          position: "inside",
          formatter: params => {
            return Math.round(params.percent) + "%";
          },
          fontSize: 14,
          color: "#fff",
          fontWeight: "bold"
        },
        emphasis: {
          label: {
            show: false
          },
          scale: true,
          scaleSize: 10,
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: "rgba(0, 0, 0, 0.3)"
          }
        },
        labelLine: {
          show: false
        },
        data: [
          // { value: 1048, name: "线上", itemStyle: { color: "#3b82f6" } },
          // { value: 735, name: "线下", itemStyle: { color: "#f97316" } }
        ]
      }
    ]
  },
  style: {
    width: "100%"
  }
});

// watch 监听 timeType 和 incomeMonthData 的变化
watch(
  () => [props.timeType, props.incomeWeekData, props.incomeMonthData],
  ([timeType, incomeWeekData, incomeMonthData]) => {
    const temp = {
      title: timeType === "month" ? "本月累计销售额" : "年累计销售额",
      online: 0,
      offline: 0
    };

    if (incomeMonthData?.length && incomeWeekData?.length) {
      if (timeType === "month") {
        incomeWeekData.forEach((item: any) => {
          if (item.channel === "线上") {
            temp.online += Number(item.income);
          }
          if (item.channel === "线下") {
            temp.offline += Number(item.income);
          }
        });
      }

      if (timeType === "year") {
        incomeWeekData.forEach((item: any) => {
          if (item.channel === "线上") {
            temp.online += Number(item.income);
          }
          if (item.channel === "线下") {
            temp.offline += Number(item.income);
          }
        });
        incomeMonthData.forEach((item: any) => {
          if (item.channelGroup === "线上") {
            temp.online += Number(item.income);
          }
          if (item.channelGroup === "线下") {
            temp.offline += Number(item.income);
          }
        });
      }
    }

    salesCards.value = {
      ...salesCards.value,
      option: {
        ...salesCards.value.option,
        title: {
          ...salesCards.value.option.title,
          text: temp.title
        },
        graphic: [
          {
            ...salesCards.value.option.graphic[0],
            children: [
              {
                ...salesCards.value.option.graphic[0].children[0],
                style: {
                  ...salesCards.value.option.graphic[0].children[0].style,
                  text: `${((temp.online + temp.offline) / 10000).toFixed(0)} 万`
                }
              }
            ]
          }
        ],
        series: [
          {
            ...salesCards.value.option.series[0],
            data: [
              {
                value: Number(temp.online?.toFixed(2)) || 0,
                name: "线上",
                itemStyle: { color: "#3b82f6" }
              },
              {
                value: Number(temp.offline?.toFixed(2)) || 0,
                name: "线下",
                itemStyle: { color: "#f97316" }
              }
            ]
          }
        ]
      }
    };
  }
);
</script>

<template>
  <div>
    <ChartCard
      :name="salesCards.name"
      :title="salesCards.title"
      :text="salesCards.text"
      :option="salesCards.option"
      :style="salesCards?.style"
      :showCard="false"
    />
  </div>
</template>
