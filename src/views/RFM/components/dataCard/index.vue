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

const channelDistributionCards = ref({
  name: "channelDistributionCards",
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
    channelDistributionCards.value.option.series.data = temp;
  }
);

onMounted(() => {});
</script>

<template>
  <div class="overflow-x-hidden">
    <el-row :gutter="60">
      <el-col :xs="24" :span="12">
        <ChartCard
          :name="channelDistributionCards.name"
          :title="channelDistributionCards.title"
          :text="channelDistributionCards.text"
          :option="channelDistributionCards.option"
          :style="channelDistributionCards?.style"
        />
      </el-col>
      <el-col :xs="24" :span="12" />
    </el-row>
  </div>
</template>
