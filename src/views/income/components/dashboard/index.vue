<script setup lang="ts">
import { inject, ref, watch } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import { divide, formatToWan } from "../../utils/calc";
import NumCard from "./numCard.vue";
import _ from "lodash";

const monthSales = ref({
  online: 0,
  offline: 0
});
const yearSales = ref({
  online: 0,
  offline: 0
});

// 销售额
const salesMonthCard = ref({
  name: "salesMonthCard",
  title: "",
  text: "",
  option: {
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
              text: "总额",
              textAlign: "center",
              textVerticalAlign: "middle",
              fontSize: 10,
              fontWeight: "bold",
              fill: "#5c5c5c"
            },
            position: [0, -10]
          },
          {
            type: "text",
            style: {
              text: "0 万",
              textAlign: "center",
              textVerticalAlign: "middle",
              fontSize: 14,
              fontWeight: "bold",
              fill: "#0a0a0a"
            },
            position: [0, 10]
          }
        ]
      }
    ],
    series: [
      {
        name: "",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
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
              text: "总额",
              textAlign: "center",
              textVerticalAlign: "middle",
              fontSize: 10,
              fontWeight: "bold",
              fill: "#5c5c5c"
            },
            position: [0, -10]
          },
          {
            type: "text",
            style: {
              text: "0 万",
              textAlign: "center",
              textVerticalAlign: "middle",
              fontSize: 14,
              fontWeight: "bold",
              fill: "#0a0a0a"
            },
            position: [0, 10]
          }
        ]
      }
    ],
    series: [
      {
        name: "",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
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
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: "#002A78" // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#618BFF" // 100% 处的颜色
                    }
                  ],
                  global: false // 缺省为 false
                }
              }
            },
            {
              value: item.offline,
              name: "线下",
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: "#855300" // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#EE9800" // 100% 处的颜色
                    }
                  ],
                  global: false // 缺省为 false
                }
              }
            }
          ];

          const totalText = `${((item.online + item.offline) / 10000).toFixed(0)}万`;

          if (index === 0) {
            salesMonthCard.value.option.series[0].data = temp;
            salesMonthCard.value.option.graphic[0].children[1].style.text =
              totalText;

            const monthSalesTotal = item.online + item.offline;
            monthSales.value = {
              online: _.floor(divide(item.online, monthSalesTotal) * 100),
              offline: _.floor(divide(item.offline, monthSalesTotal) * 100)
            };
          }
          if (index === 1) {
            salesYearCards.value.option.series[0].data = temp;
            salesYearCards.value.option.graphic[0].children[1].style.text =
              totalText;
            const yearSalesTotal = item.online + item.offline;
            yearSales.value = {
              online: _.floor(divide(item.online, yearSalesTotal) * 100),
              offline: _.floor(divide(item.offline, yearSalesTotal) * 100)
            };
          }
        }
      );
    }
  }
);
</script>

<template>
  <div>
    <el-row :gutter="10">
      <el-col :xs="24" :md="12">
        <div>
          <div class="text-xs font-bold text-[var(--secondary-color)]">
            本月累计销售额
          </div>
          <ChartCard
            :name="salesMonthCard.name"
            :title="salesMonthCard.title"
            :text="salesMonthCard.text"
            :option="salesMonthCard.option"
            :style="salesMonthCard?.style"
            :clacHeight="0"
            :showCard="false"
          />

          <div class="mb-2">
            <el-row :gutter="10">
              <el-col :span="12">
                <NumCard
                  :title="'线上'"
                  :text="monthSales.online + '%'"
                  :titleColor="'#0050DC'"
                />
              </el-col>
              <el-col :span="12">
                <NumCard
                  :title="'线下'"
                  :text="monthSales.offline + '%'"
                  :titleColor="'#7E4F00'"
                />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div>
          <div class="text-xs font-bold text-[var(--secondary-color)]">
            年度累计销售额
          </div>
          <ChartCard
            :name="salesYearCards.name"
            :title="salesYearCards.title"
            :text="salesYearCards.text"
            :option="salesYearCards.option"
            :style="salesYearCards?.style"
            :clacHeight="0"
            :showCard="false"
          />

          <div class="mb-2">
            <el-row :gutter="10">
              <el-col :span="12">
                <NumCard
                  :title="'线上'"
                  :text="yearSales.online + '%'"
                  :titleColor="'#0050DC'"
                />
              </el-col>
              <el-col :span="12">
                <NumCard
                  :title="'线下'"
                  :text="yearSales.offline + '%'"
                  :titleColor="'#7E4F00'"
                />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.el-card__body) {
  padding: 10px 0;
}
</style>
