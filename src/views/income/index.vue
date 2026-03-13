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
        console.log("周收入数据:", res);
        incomeWeekData.value = res.data || [];
      } else {
        ElMessage.error("获取周收入数据失败: " + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取周收入数据失败: " + error?.message);
    });
};

const fetchIncomeMonthData = (params: incomeParams) => {
  return getFinancialIncomeMonthList(params)
    .then((res: any) => {
      if (res.code === 200) {
        console.log("月度收入数据:", res);
        incomeMonthData.value = res.data || [];
      } else {
        ElMessage.error("获取月度收入数据失败: " + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取月度收入数据失败: " + error?.message);
    });
};

const fetchIncomeLastYearData = () => {
  return getFinancialIncomeMonthList({ year: dayjs().year() - 1 })
    .then((res: any) => {
      if (res.code === 200) {
        console.log("去年月度收入数据:", res);
        incomeLastYearData.value = res.data || [];
      } else {
        ElMessage.error("获取去年月度收入数据失败: " + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取去年月度收入数据失败: " + error?.message);
    });
};

const fetchIncomeTargetData = (params: incomeParams) => {
  return getFinancialIncomeTargetList(params)
    .then((res: any) => {
      if (res.code === 200) {
        console.log("目标收入数据:", res);
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
  fetchIncomeMonthData({ year: dayjs().year() });
  fetchIncomeTargetData({ year: dayjs().year() });
  fetchIncomeLastYearData();
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

  // 定义收入模块特有的 LAB 颜色变量
  --background: lab(96.5356% -1.63302 -3.29707);
  --foreground: lab(7.23336% -2.52666 -6.34827);
  --card: lab(100% 0 0);
  --card-foreground: lab(7.23336% -2.52666 -6.34827);
  --popover: lab(100% 0 0);
  --popover-foreground: lab(7.23336% -2.52666 -6.34827);
  --primary: lab(46.5021% 0.144899 -65.679);
  --primary-foreground: lab(97.68% -0.0000298023 0.0000119209);
  --secondary: lab(94.2156% -1.63248 -3.29677);
  --secondary-foreground: lab(24.619% -3.01947 -6.47737);
  --muted: lab(94.2156% -1.63248 -3.29677);
  --muted-foreground: lab(36.2224% -3.08807 -6.5062);
  --accent: lab(46.5021% 0.144899 -65.679);
  --accent-foreground: lab(97.68% -0.0000298023 0.0000119209);
  --destructive: lab(45.5382% 69.8881 46.2994);
  --destructive-foreground: lab(94.2% 0 0);
  --border: lab(88.4155% -1.63096 -3.29593);
  --input: lab(94.2156% -1.63248 -3.29677);
  --ring: lab(46.5021% 0.144899 -65.679);
  --chart-1: lab(46.5021% 0.144899 -65.679);
  --chart-2: lab(61.7604% -62.0984 21.3971);
  --chart-3: lab(64.207% 42.8074 76.4887);
  --chart-4: lab(49.0306% 69.7939 45.0284);
  --chart-5: lab(53.2273% 36.3736 -58.2611);
  --sidebar: lab(96.5356% -1.63302 -3.29707);
  --sidebar-foreground: lab(7.23336% -2.52666 -6.34827);
  --sidebar-primary: lab(46.5021% 0.144899 -65.679);
  --sidebar-primary-foreground: lab(97.68% -0.0000298023 0.0000119209);
  --sidebar-accent: lab(94.2156% -1.63248 -3.29677);
  --sidebar-accent-foreground: lab(24.619% -3.01947 -6.47737);
  --sidebar-border: lab(88.4155% -1.63096 -3.29593);
  --sidebar-ring: lab(46.5021% 0.144899 -65.679);
  --dash-bg: lab(96.5356% -1.63302 -3.29707);
  --dash-surface: lab(100% 0 0);
  --dash-surface-hover: lab(97.6956% -1.63329 -3.29721);
  --dash-border: lab(88.4282% -3.20494 -6.5616);
  --dash-border-strong: lab(82.6278% -3.19815 -6.55819);
  --dash-text-primary: lab(7.23336% -2.52666 -6.34827);
  --dash-text-secondary: lab(36.2224% -3.08807 -6.5062);
  --dash-text-dim: lab(53.6253% -3.14695 -6.5331);
  --dash-blue: lab(46.5021% 0.144899 -65.679);
  --dash-blue-light: lab(58.8084% -7.36728 -49.8773);
  --dash-blue-dim: lab(86.0062% -6.20028 -20.6824);
  --dash-orange: lab(64.207% 42.8074 76.4887);
  --dash-green: lab(55.921% -56.4854 50.0925);
  --dash-red: lab(45.5382% 69.8881 46.2994);
  --dash-teal: lab(64.8019% -56.0636 -5.55686);
  --dash-bar-bg: lab(90.7356% -1.63162 -3.29628);

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
