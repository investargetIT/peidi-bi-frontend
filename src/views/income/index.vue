<script setup lang="ts">
import Header from "./components/header/index.vue";
import OverView from "./components/overview/index.vue";
import Achievement from "./components/achievement/index.vue";
import {
  getFinancialIncomeWeekList,
  getFinancialIncomeMonthList,
  getFinancialIncomeTargetList,
  type incomeParams
} from "@/api/income";
import { onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

/**
 * 数据每周一更新
 * 实际值>=(期望值-5%)为绿灯，否则为红灯
 * 第三周时 看的是 第二周的数据 因为第三周还没过完
 */

const timeType = ref<"year" | "month">("month");

const incomeWeekData = ref<any>([]);
const incomeMonthData = ref<any>([]);
const incomeTargetData = ref<any>([]);
const incomeLastYearData = ref<any>([]);

//#region 请求相关
const fetchIncomeWeekData = (params: incomeParams) => {
  return getFinancialIncomeWeekList(params)
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("周收入数据:", res);
        incomeWeekData.value = res.data || [];
      } else {
        ElMessage.error("获取周收入数据失败: " + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取周收入数据失败: " + error?.message);
    });
};

const fetchIncomeMonthData = (
  params: incomeParams,
  callback?: (data: any) => void
) => {
  return getFinancialIncomeMonthList(params)
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("月度收入数据:", res);
        callback?.(res.data || []);
        // incomeMonthData.value = res.data || [];
      } else {
        ElMessage.error("获取月度收入数据失败: " + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取月度收入数据失败: " + error?.message);
    });
};

const fetchIncomeTargetData = (params: incomeParams) => {
  return getFinancialIncomeTargetList(params)
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("目标收入数据:", res);
        incomeTargetData.value = res.data || [];
      } else {
        ElMessage.error("获取目标收入数据失败: " + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取目标收入数据失败: " + error?.message);
    });
};
//#endregion

onMounted(() => {
  // 初始化时请求数据
  fetchIncomeWeekData({ year: dayjs().year(), month: dayjs().month() + 1 });
  fetchIncomeMonthData({ year: dayjs().year() }, data => {
    // console.log("月度收入数据:", data);
    incomeMonthData.value = data;
  });
  fetchIncomeMonthData({ year: dayjs().year() - 1 }, data => {
    // console.log("上年度月度收入数据:", data);
    incomeLastYearData.value = data;
  });
  fetchIncomeTargetData({ year: dayjs().year() });
});
</script>

<template>
  <div class="peidi-income-module-wrapper">
    <div>
      <Header />
    </div>
    <div class="mt-4">
      <OverView
        v-model:time-type="timeType"
        :income-week-data="incomeWeekData"
        :income-month-data="incomeMonthData"
        :income-target-data="incomeTargetData"
      />
    </div>
    <div class="mt-4">
      <Achievement
        :time-type="timeType"
        :income-week-data="incomeWeekData"
        :income-month-data="incomeMonthData"
        :income-target-data="incomeTargetData"
        :income-last-year-data="incomeLastYearData"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-income-module-wrapper {
  --background: rgb(245, 245, 245);
  --foreground: rgb(18, 18, 18);
  --card: rgb(255, 255, 255);
  --card-foreground: rgb(18, 18, 18);
  --popover: rgb(255, 255, 255);
  --popover-foreground: rgb(18, 18, 18);
  --primary: rgb(0, 112, 201);
  --primary-foreground: rgb(249, 249, 249);
  --secondary: rgb(240, 240, 240);
  --secondary-foreground: rgb(63, 63, 63);
  --muted: rgb(240, 240, 240);
  --muted-foreground: rgb(92, 92, 92);
  --accent: rgb(0, 112, 201);
  --accent-foreground: rgb(249, 249, 249);
  --destructive: rgb(176, 34, 102);
  --destructive-foreground: rgb(240, 240, 240);
  --border: rgb(225, 225, 225);
  --input: rgb(240, 240, 240);
  --ring: rgb(0, 112, 201);
  --chart-1: rgb(0, 112, 201);
  --chart-2: rgb(70, 150, 0);
  --chart-3: rgb(255, 165, 0);
  --chart-4: rgb(220, 38, 38);
  --chart-5: rgb(99, 102, 241);
  --sidebar: rgb(245, 245, 245);
  --sidebar-foreground: rgb(18, 18, 18);
  --sidebar-primary: rgb(0, 112, 201);
  --sidebar-primary-foreground: rgb(249, 249, 249);
  --sidebar-accent: rgb(240, 240, 240);
  --sidebar-accent-foreground: rgb(63, 63, 63);
  --sidebar-border: rgb(225, 225, 225);
  --sidebar-ring: rgb(0, 112, 201);
  --dash-bg: rgb(245, 245, 245);
  --dash-surface: rgb(255, 255, 255);
  --dash-surface-hover: rgb(249, 249, 249);
  --dash-border: rgb(225, 225, 225);
  --dash-border-strong: rgb(210, 210, 210);
  --dash-text-primary: rgb(18, 18, 18);
  --dash-text-secondary: rgb(92, 92, 92);
  --dash-text-dim: rgb(137, 137, 137);
  --dash-blue: rgb(0, 112, 201);
  --dash-blue-light: rgb(59, 130, 246);
  --dash-blue-dim: rgb(219, 234, 254);
  --dash-orange: rgb(255, 140, 0);
  --dash-green: rgb(0, 176, 80);
  --dash-red: rgb(220, 38, 38);
  --dash-teal: rgb(20, 184, 166);
  --dash-bar-bg: rgb(231, 231, 231);

  --dash-bar-gradient-start: #2563eb;
  --dash-bar-gradient-mid: #3b82f6;
  --dash-bar-gradient-end: #06b6d4;
  --dash-orange-gradient-start: #f97316;
  --dash-orange-gradient-mid: #fb923c;
  --dash-orange-gradient-end: #fbbf24;
  --dash-cyan-gradient-start: #14b8a6;
  --dash-cyan-gradient-mid: #2dd4bf;
  --dash-cyan-gradient-end: #5eead4;
}
</style>
