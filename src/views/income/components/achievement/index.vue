<script setup lang="ts">
import { ref } from "vue";
import SelectCard from "../selectCard/index.vue";
import TableList from "./tableList.vue";

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
  },
  incomeTargetData: {
    type: Object,
    required: true
  },
  incomeLastYearData: {
    type: Object,
    required: true
  }
});

const CUSTOM_OPTIONS = [
  { key: "growth", label: "同比增长" },
  { key: "ringGrowth", label: "环比增长" }
];
const selectedValue = ref("growth");
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <div class="flex justify-between items-center mb-4 flex-wrap">
      <div class="text-base font-bold uppercase tracking-widest text-[#0a0a0a]">
        {{ timeType === "month" ? "本月" : "年度" }}目标达成
      </div>
      <div>
        <!-- <SelectCard :options="CUSTOM_OPTIONS" v-model="selectedValue" /> -->
      </div>
    </div>

    <div>
      <TableList
        :time-type="timeType"
        :income-week-data="incomeWeekData"
        :income-month-data="incomeMonthData"
        :income-target-data="incomeTargetData"
        :income-last-year-data="incomeLastYearData"
      />
    </div>
  </el-card>
</template>
