<script setup lang="ts">
import { ref, watch } from "vue";
import NumCard from "../common/numCard.vue";
import ChartCard from "@/components/PdChart/index.vue";

const props = defineProps({
  marketOverviewData: {
    type: Object,
    required: true
  },
  changeFilteredProduct: {
    type: Function,
    required: true
  }
});

const TYPE_COLOR_MAP = {
  hight: {
    color: " rgb(34, 197, 94)",
    bgColor: "rgba(34, 197, 94, 0.125)",
    borderColor: " rgb(34, 197, 94)"
  },
  good: {
    color: "rgb(132, 204, 22)",
    bgColor: "rgba(132, 204, 22, 0.125)",
    borderColor: "rgb(132, 204, 22)"
  },
  medium: {
    color: "rgb(251, 191, 36)",
    bgColor: "rgb(251, 191, 36, 0.125)",
    borderColor: "rgb(251, 191, 36)"
  },
  low: {
    color: "rgb(239, 68, 68)",
    bgColor: "rgba(239, 68, 68, 0.125)",
    borderColor: "rgb(239, 68, 68)"
  }
};

const LEGEND_CONFIG = [
  {
    name: "High Score（8+）",
    color: TYPE_COLOR_MAP.hight.color
  },
  {
    name: "Good（6-8）",
    color: TYPE_COLOR_MAP.good.color
  },
  {
    name: "Medium（4-6）",
    color: TYPE_COLOR_MAP.medium.color
  },
  {
    name: "Low（<4）",
    color: TYPE_COLOR_MAP.low.color
  }
];

const getTypeName = data => {
  if (data <= 4) {
    return "low";
  } else if (4 < data && data <= 6) {
    return "medium";
  } else if (6 < data && data <= 8) {
    return "good";
  } else if (8 < data) {
    return "hight";
  }
};

const blockData = ref([]);
const activeBlock = ref(null);
const activeBlockDetail = ref({
  name: "",
  count: 0,
  score: 0,
  avg: "0"
});

watch(
  () => props.marketOverviewData,
  newVal => {
    // console.log("marketOverviewData:", newVal);
    const blockDataTemp = [];
    const marketOverviewCardsDataTemp = { x: [], y: [] };
    for (const key in newVal) {
      blockDataTemp.push({
        name: key,
        count: newVal[key].count,
        score: newVal[key].score,
        avg: calcAvg(newVal[key].score, newVal[key].count)
      });
      marketOverviewCardsDataTemp.x.push(key);
      marketOverviewCardsDataTemp.y.push(newVal[key].count);
    }
    blockData.value = blockDataTemp;
    marketOverviewCards.value = {
      ...marketOverviewCards.value,
      option: {
        ...marketOverviewCards.value.option,
        xAxis: [
          {
            ...marketOverviewCards.value.option.xAxis[0],
            data: marketOverviewCardsDataTemp.x
          }
        ],
        series: [
          {
            ...marketOverviewCards.value.option.series[0],
            data: marketOverviewCardsDataTemp.y
          }
        ]
      }
    };
  }
);

const calcAvg = (score, count) => {
  if (!score || !count) {
    return "0";
  }
  return (score / count).toFixed(1);
};

const marketOverviewCards = ref({
  name: "marketOverviewCards",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function (params) {
        const data = params[0];
        return `${data.axisValue}<br/>SKU Count: ${data.value}`;
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: [],
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          interval: 0,
          rotate: "45"
        }
      }
    ],
    yAxis: [
      {
        type: "value"
      }
    ],
    series: [
      {
        type: "bar",
        barWidth: "60%",
        data: [],
        itemStyle: {
          color: function (params) {
            return TYPE_COLOR_MAP[
              getTypeName(blockData.value[params.dataIndex].avg)
            ].color;
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px",
    border: 0
  }
});

const handleClickProduct = item => {
  // console.log("handleClickProduct:", item);
  if (activeBlock.value === item.name) {
    initActiveBlock();
    return;
  }
  activeBlock.value = item.name;
  activeBlockDetail.value = item;
  props.changeFilteredProduct(item.name);
};

// 初始化选择项
const initActiveBlock = () => {
  activeBlock.value = null;
  activeBlockDetail.value = {
    name: "",
    count: 0,
    score: 0,
    avg: "0"
  };
  props.changeFilteredProduct(null);
};

defineExpose({
  initActiveBlock
});
</script>

<template>
  <NumCard
    title="The Landscape - Market Overview"
    num="1"
    desc="Bar height = SKU count, Color = Average health score (Green = High, Red = Low). Click to filter products by category."
  >
    <el-row :gutter="10">
      <el-col
        v-for="item in blockData"
        :key="item.name"
        :xs="12"
        :sm="12"
        :md="6"
      >
        <div
          :class="{
            'p-4 rounded-lg transition-all text-left mt-[10px] cursor-pointer': true,
            'peidi-ppi-chewy-market-overview-block': true,
            'peidi-ppi-chewy-market-overview-block-active':
              activeBlock === item.name
          }"
          :style="{
            backgroundColor: TYPE_COLOR_MAP[getTypeName(item.avg)].bgColor,
            borderLeftColor: TYPE_COLOR_MAP[getTypeName(item.avg)].borderColor,
            borderLeftWidth: '4px'
          }"
          @click="handleClickProduct(item)"
        >
          <p class="font-medium text-sm truncate text-[#0a0a0a]">
            {{ item.name }}
          </p>
          <p class="text-2xl font-bold leading-[36px]">{{ item.count }}</p>
          <p class="text-xs text-[#71717a]">
            Avg Score:
            <span
              :style="{ color: TYPE_COLOR_MAP[getTypeName(item.avg)].color }"
              >{{ item.avg }}</span
            >
          </p>
        </div>
      </el-col>
    </el-row>

    <ChartCard
      :name="marketOverviewCards.name"
      :title="marketOverviewCards.title"
      :text="marketOverviewCards.text"
      :option="marketOverviewCards.option"
      :style="marketOverviewCards?.style"
    />

    <div class="flex justify-center">
      <div v-for="item in LEGEND_CONFIG" :key="item.name">
        <div class="text-sm text-[#0a0a0a] flex items-center">
          <div
            class="w-[18px] h-[18px] inline-block rounded-[4px] mr-[4px]"
            :style="{ backgroundColor: item.color }"
          />
          {{ item.name }}
        </div>
      </div>
    </div>

    <div v-if="activeBlock" class="mt-4 p-4 bg-[#f5f5f5] rounded-lg">
      <p class="font-medium">Selected: {{ activeBlockDetail.name }}</p>
      <p class="text-sm text-[#71717a]">
        {{ activeBlockDetail.count }} products, Avg Score:
        {{ activeBlockDetail.avg }}
      </p>
    </div>
  </NumCard>
</template>

<style lang="scss" scoped>
.peidi-ppi-chewy-market-overview-block {
  border: 4px solid transparent;
  border-left-width: 4px;

  &:hover {
    border: 4px solid #e5e5e5;
    border-left-color: inherit;
  }
}

.peidi-ppi-chewy-market-overview-block-active {
  border: 4px solid transparent;
  border-top-color: #000;
  border-right-color: #000;
  border-bottom-color: #000;
  border-left-color: inherit;
  border-left-width: 4px;

  &:hover {
    border: 4px solid #000;
    border-left-color: inherit;
  }
}
</style>
