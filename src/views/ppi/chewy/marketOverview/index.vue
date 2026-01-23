<script setup lang="ts">
import { ref, watch } from "vue";
import NumCard from "../common/numCard.vue";

const props = defineProps({
  marketOverviewData: {
    type: Object,
    required: true
  }
});

const blockData = ref([]);

watch(
  () => props.marketOverviewData,
  newVal => {
    console.log("marketOverviewData:", newVal);
    const blockDataTemp = [];
    for (const key in newVal) {
      blockDataTemp.push({
        name: key,
        count: newVal[key].count,
        score: newVal[key].score,
        avg: calcAvg(newVal[key].score, newVal[key].count)
      });
    }
    blockData.value = blockDataTemp;
  }
);

const calcAvg = (score, count) => {
  if (!score || !count) {
    return "0";
  }
  return (score / count).toFixed(2);
};
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
          class="p-4 rounded-lg border-2 transition-all text-left border-transparent hover:border-muted-foreground/20 mt-[10px]"
          style="
            background-color: rgb(34 197 94 / 12.5%);
            border-left-color: rgb(34 197 94);
            border-left-width: 4px;
          "
        >
          <p class="font-medium text-sm truncate text-[#0a0a0a]">
            {{ item.name }}
          </p>
          <p class="text-2xl font-bold">{{ item.count }}</p>
          <p class="text-xs text-[#71717a]">
            Avg Score:
            <span style="color: rgb(34 197 94)">{{ item.avg }}</span>
          </p>
        </div>
      </el-col>
    </el-row>
  </NumCard>
</template>
