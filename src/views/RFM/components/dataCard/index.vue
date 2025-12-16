<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
// 调试数据
import debugData from "@/views/RFM/response_debug.json";

// props
const props = defineProps({
  dataList: {
    type: Array,
    required: true
  }
});

// watch dataList
watch(
  () => props.dataList,
  (newVal, oldVal) => {
    const temp = [];
    newVal.forEach((item: any) => {
      // 如果temp中存在name为item.rfmType的项，将item.cnt添加到value中
      const index = temp.findIndex((i: any) => i.name === item.rfmType);
      if (index !== -1) {
        temp[index].children.push({
          name: item.channel,
          value: item.cnt
        });
      } else {
        temp.push({
          name: item.rfmType,
          children: [
            {
              name: item.channel,
              value: item.cnt
            }
          ]
        });
      }
    });
    // 遍历一遍temp，将children中的value累加起来
    temp.forEach((item: any) => {
      item.value = item.children.reduce(
        (pre: number, cur: any) => pre + cur.value,
        0
      );
    });
    console.log("channelDistributionCards", temp);
    channelDistributionCardsSunburst.value.option.series.data = temp;
    channelDistributionCardsPie.value.option.series[0].data = temp.map(item => {
      return {
        name: item.name,
        value: item.value
      };
    });

    // 为柱状图处理数据
    const channelDistributionCardsBarYAxisData = temp.map(item => item.name);
    const channelDistributionCardsBarSeries = [
      {
        name: "抖音",
        type: "bar",
        stack: "total",
        label: {
          show: true
        },
        emphasis: {
          focus: "series"
        },
        data: []
      },
      {
        name: "淘宝",
        type: "bar",
        stack: "total",
        label: {
          show: true
        },
        emphasis: {
          focus: "series"
        },
        data: []
      },
      {
        name: "京东",
        type: "bar",
        stack: "total",
        label: {
          show: true
        },
        emphasis: {
          focus: "series"
        },
        data: []
      },
      {
        name: "微盟",
        type: "bar",
        stack: "total",
        label: {
          show: true
        },
        emphasis: {
          focus: "series"
        },
        data: []
      }
    ];
    temp.forEach((item: any) => {
      item.children.forEach((i: any) => {
        const index = channelDistributionCardsBarSeries.findIndex(
          (j: any) => j.name === i.name
        );
        if (index !== -1) {
          channelDistributionCardsBarSeries[index].data.push(i.value);
        }
      });
    });
    console.log(
      "柱状图数据",
      channelDistributionCardsBarYAxisData,
      channelDistributionCardsBarSeries
    );
    channelDistributionCardsBar.value = {
      ...channelDistributionCardsBar.value,
      option: {
        ...channelDistributionCardsBar.value.option,
        yAxis: {
          ...channelDistributionCardsBar.value.option.yAxis,
          data: [...channelDistributionCardsBarYAxisData]
        },
        series: channelDistributionCardsBarSeries
      }
    };
  }
);

const channelDistributionCardsSunburst = ref({
  name: "channelDistributionCardsSunburst",
  title: "客户渠道占比（客户数量）",
  text: "",
  option: {
    tooltip: {
      trigger: "item", // 鼠标悬浮触发
      formatter: function (params) {
        if (!params.name) return "";
        const value = params.value || params.data?.value || 0;
        const formattedValue = value.toLocaleString("en-US");
        return `${params.name}: ${formattedValue}`;
      }
    },
    series: {
      type: "sunburst",
      // emphasis: {
      //     focus: 'ancestor'
      // },
      data: [
        // {
        //   name: "重要价值客户",
        //   children: [
        //     {
        //       name: "淘宝",
        //       value: 15
        //     },
        //     {
        //       name: "抖音",
        //       value: 10
        //     }
        //   ]
        // },
        // {
        //   name: "重要发展客户",
        //   children: [
        //     {
        //       name: "淘宝",
        //       value: 15
        //     },
        //     {
        //       name: "抖音",
        //       value: 10
        //     }
        //   ]
        // }
      ],
      radius: [0, "90%"],
      label: {
        rotate: "radial"
      }
    }
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

const channelDistributionCardsPie = ref({
  name: "channelDistributionCardsPie",
  title: "客户渠道占比（客户数量）",
  text: "",
  option: {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)"
    },
    series: [
      {
        type: "pie",
        radius: "60%",
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
          // { value: 580, name: "Email" },
          // { value: 484, name: "Union Ads" },
          // { value: 300, name: "Video Ads" }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          formatter: "{b|{b}}\n{c} {per|{d}%}  ",
          backgroundColor: "#F6F8FC",
          borderColor: "#8C8D8E",
          borderWidth: 1,
          borderRadius: 4,
          rich: {
            b: {
              color: "#4C5058",
              fontSize: 12,
              fontWeight: "normal",
              lineHeight: 24
            },
            per: {
              color: "#fff",
              backgroundColor: "#4C5058",
              padding: [3, 4],
              borderRadius: 4,
              lineHeight: 24
            }
          }
        },
        labelLine: {
          normal: {
            length: 20, // 第一段线长度
            length2: 30, // 第二段线长度
            lineStyle: {
              width: 1
            }
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

const channelDistributionCardsBar = ref({
  name: "channelDistributionCardsBar",
  title: "客户渠道占比（客户数量）",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        // Use axis to trigger tooltip
        type: "shadow" // 'shadow' as default; can also be 'line' or 'shadow'
      }
    },
    legend: {},
    xAxis: {
      type: "value"
    },
    yAxis: {
      type: "category",
      data: [
        // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
      ]
    },
    series: [
      // {
      //   name: "抖音",
      //   type: "bar",
      //   stack: "total",
      //   label: {
      //     show: true
      //   },
      //   emphasis: {
      //     focus: "series"
      //   },
      //   data: []
      // },
      // {
      //   name: "淘宝",
      //   type: "bar",
      //   stack: "total",
      //   label: {
      //     show: true
      //   },
      //   emphasis: {
      //     focus: "series"
      //   },
      //   data: []
      // },
      // {
      //   name: "京东",
      //   type: "bar",
      //   stack: "total",
      //   label: {
      //     show: true
      //   },
      //   emphasis: {
      //     focus: "series"
      //   },
      //   data: []
      // },
      // {
      //   name: "微盟",
      //   type: "bar",
      //   stack: "total",
      //   label: {
      //     show: true
      //   },
      //   emphasis: {
      //     focus: "series"
      //   },
      //   data: []
      // }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
</script>

<template>
  <div class="overflow-x-hidden">
    <el-row :gutter="60">
      <el-col :xs="24" :span="12">
        <ChartCard
          :name="channelDistributionCardsSunburst.name"
          :title="channelDistributionCardsSunburst.title"
          :text="channelDistributionCardsSunburst.text"
          :option="channelDistributionCardsSunburst.option"
          :style="channelDistributionCardsSunburst?.style"
        />
      </el-col>
      <el-col :xs="24" :span="12">
        <ChartCard
          :name="channelDistributionCardsPie.name"
          :title="channelDistributionCardsPie.title"
          :text="channelDistributionCardsPie.text"
          :option="channelDistributionCardsPie.option"
          :style="channelDistributionCardsPie?.style"
        />
      </el-col>
    </el-row>
    <el-row :gutter="60" class="mt-[20px]">
      <el-col :xs="24" :span="24">
        <ChartCard
          :name="channelDistributionCardsBar.name"
          :title="channelDistributionCardsBar.title"
          :text="channelDistributionCardsBar.text"
          :option="channelDistributionCardsBar.option"
          :style="channelDistributionCardsBar?.style"
        />
      </el-col>
    </el-row>
  </div>
</template>
