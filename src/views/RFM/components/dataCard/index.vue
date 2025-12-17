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
    const temp_channelDistribution = [];
    const temp_categoryDistribution = [];
    // console.log("源数据", newVal);
    newVal.forEach((item: any) => {
      // 数据处理
      // 客户渠道占比（客户数量）
      const index_channelDistribution = temp_channelDistribution.findIndex(
        (i: any) => i.name === item.channel
      );
      if (index_channelDistribution !== -1) {
        temp_channelDistribution[index_channelDistribution].value += item.cnt;
      } else {
        temp_channelDistribution.push({
          name: item.channel,
          value: item.cnt
        });
      }
      // 客户类别占比（客户数量）
      const index_categoryDistribution = temp_categoryDistribution.findIndex(
        (i: any) => i.name === item.rfmType
      );
      if (index_categoryDistribution !== -1) {
        temp_categoryDistribution[index_categoryDistribution].value += item.cnt;
      } else {
        temp_categoryDistribution.push({
          name: item.rfmType,
          value: item.cnt
        });
      }
    });
    // 赋值图表
    // 客户渠道占比（客户数量）
    channelDistributionCards.value.option.series[0].data =
      temp_channelDistribution;
    // 客户类别占比（客户数量）
    categoryDistributionCards.value.option.series[0].data =
      temp_categoryDistribution;
  }
);

const channelDistributionCards = ref({
  name: "channelDistributionCards",
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
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          formatter: "{b|{b}}\n{c} ({d}%)",
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
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
    borderRadius: "10px"
  }
});
const categoryDistributionCards = ref({
  name: "categoryDistributionCards",
  title: "客户类别占比（客户数量）",
  text: "",
  option: {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)"
    },
    series: [
      {
        type: "pie",
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          formatter: "{b|{b}}\n{c} ({d}%)",
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
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
    borderRadius: "10px"
  }
});
</script>

<template>
  <div class="overflow-x-hidden">
    <el-row :gutter="30">
      <el-col :sm="24" :lg="12" class="mb-[20px]">
        <ChartCard
          :name="channelDistributionCards.name"
          :title="channelDistributionCards.title"
          :text="channelDistributionCards.text"
          :option="channelDistributionCards.option"
          :style="channelDistributionCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="12">
        <ChartCard
          :name="categoryDistributionCards.name"
          :title="categoryDistributionCards.title"
          :text="categoryDistributionCards.text"
          :option="categoryDistributionCards.option"
          :style="categoryDistributionCards?.style"
      /></el-col>
    </el-row>
  </div>
</template>
