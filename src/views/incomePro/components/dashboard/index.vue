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
      left: "left",
      top: 0,
      textStyle: {
        color: "#5c5c5c",
        fontSize: 12,
        fontWeight: "normal"
      }
    },
    legend: {
      show: true,
      orient: "horizontal",
      left: "center",
      top: "bottom",
      icon: "circle",
      itemWidth: 10, // 图标宽度
      itemHeight: 10, // 图标高度
      itemGap: 1, // 图例项之间的间距
      formatter: (name: string) => {
        const total = salesMonthCard.value.option.series[0].data.reduce(
          (sum: number, item: any) => sum + item.value,
          0
        );
        const item = salesMonthCard.value.option.series[0].data.find(
          (d: any) => d.name === name
        );
        const percent =
          total > 0 ? (((item?.value || 0) / total) * 100).toFixed(0) : 0;
        return `${name}${percent}%`;
      },
      textStyle: {
        fontSize: 11
      }
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
        top: "center",
        children: [
          {
            type: "text",
            style: {
              text: "0万",
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
        name: "",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          // borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: false,
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
    width: "100%",
    height: "200px",
    borderRadius: "10px"
  }
});
const salesYearCards = ref({
  name: "salesYearCards",
  title: "",
  text: "",
  option: {
    title: {
      text: "年度累计销售额",
      left: "left",
      top: 0,
      textStyle: {
        color: "#5c5c5c",
        fontSize: 12,
        fontWeight: "normal"
      }
    },
    legend: {
      show: true,
      orient: "horizontal",
      left: "center",
      top: "bottom",
      icon: "circle",
      itemWidth: 10, // 图标宽度
      itemHeight: 10, // 图标高度
      itemGap: 1, // 图例项之间的间距
      formatter: (name: string) => {
        const total = salesYearCards.value.option.series[0].data.reduce(
          (sum: number, item: any) => sum + item.value,
          0
        );
        const item = salesYearCards.value.option.series[0].data.find(
          (d: any) => d.name === name
        );
        const percent =
          total > 0 ? (((item?.value || 0) / total) * 100).toFixed(0) : 0;
        return `${name}${percent}%`;
      },
      textStyle: {
        fontSize: 11
      }
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
        top: "center",
        children: [
          {
            type: "text",
            style: {
              text: "0万",
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
        name: "",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          // borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: false,
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
    width: "100%",
    height: "200px",
    borderRadius: "10px"
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

          const totalText = `${((item.online + item.offline) / 10000).toFixed(0)}万`;

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
    <el-row :gutter="10">
      <el-col :span="12">
        <ChartCard
          :name="salesMonthCard.name"
          :title="salesMonthCard.title"
          :text="salesMonthCard.text"
          :option="salesMonthCard.option"
          :style="salesMonthCard?.style"
          :clacHeight="30"
        />
      </el-col>
      <el-col :span="12">
        <ChartCard
          :name="salesYearCards.name"
          :title="salesYearCards.title"
          :text="salesYearCards.text"
          :option="salesYearCards.option"
          :style="salesYearCards?.style"
          :clacHeight="30"
        />
      </el-col>
    </el-row>

    <!-- <ChartCard
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
    /> -->
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.el-card__body) {
  padding: 10px 0;
}
</style>
