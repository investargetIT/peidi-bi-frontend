<script setup lang="ts">
import { ref } from "vue";
import PieChart from "./pieChart.vue";
import ProjectProgress from "./projectProgress.vue";

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
  }
});

const emit = defineEmits<{
  "update:timeType": [value: "year" | "month"];
}>();

const handleTimeTypeChange = (value: "year" | "month") => {
  emit("update:timeType", value);
};
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div>
        <el-tabs
          v-model="props.timeType"
          @update:model-value="handleTimeTypeChange"
        >
          <el-tab-pane label="本月" name="month" />
          <el-tab-pane label="年度" name="year" />
        </el-tabs>
      </div>
      <div>
        <el-row :gutter="10">
          <el-col :xs="24" :md="12">
            <PieChart
              :time-type="props.timeType"
              :income-week-data="props.incomeWeekData"
              :income-month-data="props.incomeMonthData"
            />
          </el-col>
          <el-col :xs="24" :md="12">
            <ProjectProgress
              :time-type="props.timeType"
              :income-week-data="props.incomeWeekData"
              :income-month-data="props.incomeMonthData"
              :income-target-data="props.incomeTargetData"
            />
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>
