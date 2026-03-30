<script setup lang="ts">
/**
 * 入口 只做初始化数据/样式 引入组件
 * 1. 数据每周一更新
 * 2. 实际值>=(期望值-5%)为绿灯，否则为红灯
 * 3. 第三周时 看的是 第二周的数据 因为第三周还没过完
 */
import { onMounted, provide, ref, watch } from "vue";
import {
  getFinancialIncomeWeekList,
  getFinancialIncomeMonthList,
  getFinancialIncomeTargetList,
  type incomeParams
} from "@/api/income";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { divide, getWarningLightStatus, getWeekOfMonth } from "./utils/calc";
import _ from "lodash";
import Header from "./components/header/index.vue";
import Dashboard from "./components/dashboard/index.vue";
import Overview from "./components/overview/index.vue";
import Achievement from "./components/achievement/index.vue";
import DetailCard from "./components/detailCard/index.vue";

// 基础数据
const incomeWeekData = ref<any>([]); // 周数据
const incomeMonthData = ref<any>([]); // 月数据
const incomeLastYearData = ref<any>([]); // 上年度月数据
const incomeTargetData = ref<any>([]); // 目标数据

// 结果数据 格式见 处理函数
const incomeData = ref<any>(null);
// 注入数据
provide("incomeData", incomeData);

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
        callback?.(res.data || []);
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

onMounted(async () => {
  // 初始化时请求数据
  await fetchIncomeWeekData({
    year: dayjs().year(),
    month: dayjs().month() + 1
  });
  await fetchIncomeMonthData({ year: dayjs().year() }, data => {
    // console.log("月度收入数据:", data);
    incomeMonthData.value = data;
  });
  await fetchIncomeMonthData({ year: dayjs().year() - 1 }, data => {
    // console.log("上年度月度收入数据:", data);
    incomeLastYearData.value = data;
  });
  await fetchIncomeTargetData({ year: dayjs().year() });

  // 都请求完成后 再处理数据
  handleIncomeData();
});

const handleIncomeData = () => {
  // 统一 数组0为本月 数组1为本年
  const incomeTemp = {
    onlineOffChartData: [
      // {
      //   online: 0,
      //   offline: 0
      // }
    ],
    projectProgressData: [
      // [
      //   {
      //     name: "全渠道",
      //     status: "success",
      //     income: 0,
      //     target: 0,
      //     expect: 0
      //   },
      //   {
      //     name: "线上",
      //     status: "success",
      //     income: 0,
      //     target: 0,
      //     expect: 0
      //   },
      //   {
      //     name: "线下",
      //     status: "success",
      //     income: 0,
      //     target: 0,
      //     expect: 0
      //   }
      // ]
    ],
    projectProgressDataDetail: []
  };

  // 线上线下图表数据
  function getOnlineOffChartData() {
    const onlineOffChartData = [];
    // 月
    (function () {
      const temp = {
        online: 0,
        offline: 0
      };
      incomeWeekData.value.forEach((item: any) => {
        if (item.channel === "线上") {
          temp.online += Number(item.income);
        }
        if (item.channel === "线下") {
          temp.offline += Number(item.income);
        }
      });
      onlineOffChartData.push(temp);
    })();
    // 年
    (function () {
      const temp = {
        online: 0,
        offline: 0
      };
      incomeWeekData.value.forEach((item: any) => {
        if (item.channel === "线上") {
          temp.online += Number(item.income);
        }
        if (item.channel === "线下") {
          temp.offline += Number(item.income);
        }
      });
      incomeMonthData.value.forEach((item: any) => {
        if (item.channelGroup === "线上") {
          temp.online += Number(item.income);
        }
        if (item.channelGroup === "线下") {
          temp.offline += Number(item.income);
        }
      });
      onlineOffChartData.push(temp);
    })();

    incomeTemp.onlineOffChartData = onlineOffChartData;
  }
  getOnlineOffChartData();

  // 项目进度 -概览
  function getProjectProgressData() {
    const projectProgressData = [];
    // 月
    (function () {
      const temp = [
        {
          name: "全渠道",
          status: "success",
          income: 0,
          target: 0,
          expect: 0
        },
        {
          name: "线上",
          status: "success",
          income: 0,
          target: 0,
          expect: 0
        },
        {
          name: "线下",
          status: "success",
          income: 0,
          target: 0,
          expect: 0
        }
      ];
      temp.forEach(item => {
        // expect 在周数据里去找到该周的期望值
        // console.log("本周", getWeekOfMonth());
        const expect = incomeWeekData.value.find(
          data => data.week === getWeekOfMonth() && data.channel === item.name
        )?.monthExpectation;
        item.expect = Number((expect * 100).toFixed(0));

        // target
        const target = incomeTargetData.value.find(
          data =>
            data.month === dayjs().month() + 1 && data.channel === item.name
        )?.target;
        item.target = Number(target || 0);

        // income incomeWeekData全部income加起来
        const income = incomeWeekData.value
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.income || 0), 0);
        item.income = Number(income || 0);
        console.log("本月周数据", income);
      });
      temp.forEach(item => {
        const progress = divide(item.income, item.target) * 100;
        item.status = getWarningLightStatus(progress, item.expect);
      });
      projectProgressData.push(temp);
    })();
    // 年
    (function () {
      const temp = [
        {
          name: "全渠道",
          status: "success",
          income: 0,
          target: 0,
          expect: 0
        },
        {
          name: "线上",
          status: "success",
          income: 0,
          target: 0,
          expect: 0
        },
        {
          name: "线下",
          status: "success",
          income: 0,
          target: 0,
          expect: 0
        }
      ];
      temp.forEach(item => {
        // expect 在周数据里去找到该周的期望值
        const expect = incomeWeekData.value.find(
          data => data.week === getWeekOfMonth() && data.channel === item.name
        )?.yearExpectation;
        item.expect = Number((expect * 100).toFixed(0));

        // target 算总和
        const target = incomeTargetData.value
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.target || 0), 0);
        item.target = Number(target || 0);

        // income 如果是本年的，就把本周 和月数据 加起来
        let income = 0;
        incomeWeekData.value.forEach(data => {
          if (data.channel === item.name) {
            income += Number(data.income || 0);
          }
        });
        incomeMonthData.value.forEach(data => {
          // 月数据没有全渠道，只有线上线下
          if (data.channelGroup === item.name) {
            income += Number(data.income || 0);
          }
          if (item.name === "全渠道") {
            income += Number(data.income || 0);
          }
        });
        item.income = Number(income || 0);
      });
      temp.forEach(item => {
        const progress = divide(item.income, item.target) * 100;
        item.status = getWarningLightStatus(progress, item.expect);
      });
      projectProgressData.push(temp);
    })();

    incomeTemp.projectProgressData = projectProgressData;
  }
  getProjectProgressData();

  // 项目进度 -详情
  function getProjectProgressDetailData() {
    const projectProgressDataDetail = [];
    // 月
    (function () {
      const temp = [];
      [
        "天猫",
        "京东",
        "抖音",
        "哈宠",
        "跨境电商",
        "Vivaland",
        "销售一组",
        "销售二组",
        "销售三组"
      ].forEach(item => {
        temp.push({
          name: item,
          status: "success",
          income: 0,
          target: 0,
          expect: 0,

          allIncomeDetail: [], // 本月专用
          monthIncomeList: [], // 本月专用
          yearTarget: 0, // 本月专用
          yearIncome: 0, // 本月专用

          yearOverYearGrowth: 0, // 同比
          monthOverMonthGrowth: 0, // 环比

          yearOverYearGrowthList: [], // 同比曲线 本月专用
          monthOverMonthGrowthList: [] // 环比曲线 本月专用
        });
      });
      temp.forEach(item => {
        //#region expect 期望值 在周数据里去找到该周的期望值
        const expect = incomeWeekData.value.find(
          data => data.week === getWeekOfMonth() && data.channel === item.name
        )?.monthExpectation;
        item.expect = Number((expect * 100).toFixed(0));
        //#endregion

        //#region target 目标值
        const target = incomeTargetData.value.find(
          data =>
            data.month === dayjs().month() + 1 && data.channel === item.name
        )?.target;
        item.target = Number(target || 0);
        //#endregion

        //#region income incomeWeekData全部income加起来
        const income = incomeWeekData.value
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.income || 0), 0);
        item.income = Number(income || 0);
        //#endregion

        //#region allIncomeDetail 本月专用 所有周的income 按周排序
        item.allIncomeDetail = incomeWeekData.value
          .filter(data => data.channel === item.name)
          .map(data => ({
            week: data.week,
            income: Number(data.income || 0)
          }))
          .sort((a, b) => a.week - b.week);
        //#endregion

        //#region monthIncomeList 本月专用 所有月的income 按月排序
        item.monthIncomeList = incomeMonthData.value
          .filter(data => data.channel === item.name)
          .map(data => ({
            month: data.month,
            income: Number(data.income || 0)
          }))
          .sort((a, b) => a.month - b.month);
        // 加入本月
        item.monthIncomeList.push({
          month: dayjs().month() + 1,
          income: item.income
        });
        //#endregion

        //#region yearTarget 本月专用 本年的target
        const yearTarget = incomeTargetData.value
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.target || 0), 0);
        item.yearTarget = Number(yearTarget || 0);
        //#endregion

        //#region yearIncome 本月专用 本年的收入 如果是本年的，就把本周 和月数据 加起来
        let yearIncome = 0;
        incomeWeekData.value.forEach(data => {
          if (data.channel === item.name) {
            yearIncome += Number(data.income || 0);
          }
        });
        incomeMonthData.value.forEach(data => {
          if (data.channel === item.name) {
            yearIncome += Number(data.income || 0);
          }
        });
        item.yearIncome = Number(yearIncome || 0);
        //#endregion

        //#region yearOverYearGrowth 同比
        function getYearOverYearGrowth() {
          const lastYearIncome = incomeLastYearData.value.find(
            data =>
              data.month === dayjs().month() + 1 && data.channel === item.name
          )?.income;
          return _.floor(
            divide(
              Number(item.income) - Number(lastYearIncome),
              lastYearIncome
            ) * 100
          );
        }
        item.yearOverYearGrowth = getYearOverYearGrowth();
        //#endregion

        //#region monthOverMonthGrowth 环比
        function getMonthOverMonthGrowth() {
          let lastMonthIncome = 0;
          // 如果是1月份，需要特殊处理
          if (dayjs().month() + 1 === 1) {
            // 1月份去去年的12月
            lastMonthIncome = incomeLastYearData.value.find(
              data => data.month === 12 && data.channel === item.name
            )?.income;
          } else {
            // 去月数据里找到上个月的income
            lastMonthIncome = incomeMonthData.value.find(
              data =>
                data.month === dayjs().month() && data.channel === item.name
            )?.income;
          }
          return _.floor(
            divide(
              Number(item.income) - Number(lastMonthIncome),
              lastMonthIncome
            ) * 100
          );
        }
        item.monthOverMonthGrowth = getMonthOverMonthGrowth();
        //#endregion

        //#region yearOverYearGrowthList 本月专用  同比曲线
        function getYearOverYearGrowthList() {
          const result = [];
          const currentMonth = dayjs().month() + 1;

          // 遍历 1-12 月
          for (let month = 1; month <= 12; month++) {
            let lastYearIncome = 0;
            let currentYearIncome = 0;

            // 获取去年该月的收入
            const lastYearData = incomeLastYearData.value.find(
              data => data.month === month && data.channel === item.name
            );
            lastYearIncome = Number(lastYearData?.income || 0);

            // 获取今年该月的收入
            if (month < currentMonth) {
              // 过去的月份，从 incomeMonthData 中取
              const currentMonthData = incomeMonthData.value.find(
                data => data.month === month && data.channel === item.name
              );
              currentYearIncome = Number(currentMonthData?.income || 0);
            } else if (month === currentMonth) {
              // 当前月份，使用累计收入
              currentYearIncome = Number(item.income || 0);
            } else {
              // 未来的月份，暂时为 0
              currentYearIncome = 0;
            }

            // 计算同比增长率
            const growthRate =
              lastYearIncome > 0
                ? _.floor(
                    divide(currentYearIncome - lastYearIncome, lastYearIncome) *
                      100
                  )
                : 0;

            result.push({
              month: month,
              currentYearIncome: currentYearIncome,
              lastYearIncome: lastYearIncome,
              growthRate: growthRate
            });
          }

          return result;
        }
        item.yearOverYearGrowthList = getYearOverYearGrowthList();
        //#endregion

        //#region monthOverMonthGrowthList 本月专用 环比曲线
        function getMonthOverMonthGrowthList() {
          const result = [];
          const currentMonth = dayjs().month() + 1;

          // 遍历 1-12 月
          for (let month = 1; month <= 12; month++) {
            let currentMonthIncome = 0;
            let lastMonthIncome = 0;

            // 获取本月收入
            if (month < currentMonth) {
              // 过去的月份，从 incomeMonthData 中取
              const currentMonthData = incomeMonthData.value.find(
                data => data.month === month && data.channel === item.name
              );
              currentMonthIncome = Number(currentMonthData?.income || 0);
            } else if (month === currentMonth) {
              // 当前月份，使用累计收入
              currentMonthIncome = Number(item.income || 0);
            } else {
              // 未来的月份，暂时为 0
              currentMonthIncome = 0;
            }

            // 获取上月收入
            if (month === 1) {
              // 1 月份，需要取去年 12 月的数据
              const lastYearDecData = incomeLastYearData.value.find(
                data => data.month === 12 && data.channel === item.name
              );
              lastMonthIncome = Number(lastYearDecData?.income || 0);
            } else {
              // 其他月份，取今年的上月数据
              const lastMonth = month - 1;
              const lastMonthData = incomeMonthData.value.find(
                data => data.month === lastMonth && data.channel === item.name
              );
              lastMonthIncome = Number(lastMonthData?.income || 0);
            }

            // 计算环比增长率
            const growthRate =
              lastMonthIncome > 0
                ? _.floor(
                    divide(
                      currentMonthIncome - lastMonthIncome,
                      lastMonthIncome
                    ) * 100
                  )
                : 0;

            result.push({
              month: month,
              currentMonthIncome: currentMonthIncome,
              lastMonthIncome: lastMonthIncome,
              growthRate: growthRate
            });
          }

          return result;
        }
        item.monthOverMonthGrowthList = getMonthOverMonthGrowthList();
        //#endregion
      });
      temp.forEach(item => {
        const progress = divide(item.income, item.target) * 100;
        item.status = getWarningLightStatus(progress, item.expect);
      });
      projectProgressDataDetail.push(temp);
    })();
    // 年
    (function () {
      const temp = [];
      [
        "天猫",
        "京东",
        "抖音",
        "哈宠",
        "跨境电商",
        "Vivaland",
        "销售一组",
        "销售二组",
        "销售三组"
      ].forEach(item => {
        temp.push({
          name: item,
          status: "success",
          income: 0,
          target: 0,
          expect: 0,

          allIncomeDetail: [], // 本月专用
          monthIncomeList: [], // 本月专用
          yearTarget: 0, // 本月专用
          yearIncome: 0, // 本月专用

          yearOverYearGrowth: 0, // 同比
          monthOverMonthGrowth: 0, // 环比

          yearOverYearGrowthList: [], // 同比曲线 本月专用
          monthOverMonthGrowthList: [] // 环比曲线 本月专用
        });
      });
      temp.forEach(item => {
        //#region expect 期望值 在周数据里去找到该周的期望值
        const expect = incomeWeekData.value.find(
          data => data.week === getWeekOfMonth() && data.channel === item.name
        )?.yearExpectation;
        item.expect = Number((expect * 100).toFixed(0));
        //#endregion

        //#region  target 目标值 算总和
        const target = incomeTargetData.value
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.target || 0), 0);
        item.target = Number(target || 0);
        //#endregion

        //#region income 如果是本年的，就把本周 和月数据 加起来
        let income = 0;
        incomeWeekData.value.forEach(data => {
          if (data.channel === item.name) {
            income += Number(data.income || 0);
          }
        });
        incomeMonthData.value.forEach(data => {
          if (data.channel === item.name) {
            income += Number(data.income || 0);
          }
        });
        item.income = Number(income || 0);
        //#endregion

        //#region yearOverYearGrowth 同比
        function getYearOverYearGrowth() {
          // 获取当前月份
          const currentMonth = dayjs().month() + 1;

          // 在去年数据里面找到当前name的本月之前的所有数据（不包括本月），并且 income 求和
          const lastYearIncome = incomeLastYearData.value
            .filter(
              data => data.channel === item.name && data.month < currentMonth
            )
            .reduce((acc, cur) => acc + Number(cur.income || 0), 0);

          return _.floor(
            divide(
              Number(item.income) - Number(lastYearIncome),
              lastYearIncome
            ) * 100
          );
        }
        item.yearOverYearGrowth = getYearOverYearGrowth();
        //#endregion

        //#region monthOverMonthGrowth 环比
        // function getMonthOverMonthGrowth() {
        //   // 去年数据里面找到当前name的所有数据，并且income求和
        //   const lastYearIncome = incomeLastYearData.value
        //     .filter(data => data.channel === item.name)
        //     .reduce((acc, cur) => acc + Number(cur.income || 0), 0);
        //   return _.floor(
        //     divide(
        //       Number(item.income) - Number(lastYearIncome),
        //       lastYearIncome
        //     ) * 100
        //   );
        // }
        // item.monthOverMonthGrowth = getMonthOverMonthGrowth();
        //#endregion
      });
      temp.forEach(item => {
        const progress = divide(item.income, item.target) * 100;
        item.status = getWarningLightStatus(progress, item.expect);
      });
      projectProgressDataDetail.push(temp);
    })();
    incomeTemp.projectProgressDataDetail = projectProgressDataDetail;
  }
  getProjectProgressDetailData();

  // console.log("数据处理:", incomeTemp);
  incomeData.value = incomeTemp;
};

const achievementRef = ref<any>(null);
provide("achievementRef", achievementRef);

const detailCardRef = ref<any>(null);
provide("detailCardRef", detailCardRef);
</script>

<template>
  <div class="peidi-incomePro-wrapper">
    <div>
      <Header />
    </div>
    <div class="mt-3">
      <Dashboard />
    </div>
    <div class="mt-3">
      <Overview />
    </div>
    <!-- <div v-show="false" class="mt-3">
      <Achievement ref="achievementRef" />
    </div> -->
    <div class="mt-3">
      <DetailCard ref="detailCardRef" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-incomePro-wrapper {
  --background: rgb(245 245 245);
  --foreground: rgb(18 18 18);
  --card: rgb(255 255 255);
  --card-foreground: rgb(18 18 18);
  --popover: rgb(255 255 255);
  --popover-foreground: rgb(18 18 18);
  --primary: rgb(0 112 201);
  --primary-foreground: rgb(249 249 249);
  --secondary: rgb(240 240 240);
  --secondary-foreground: rgb(63 63 63);
  --muted: rgb(240 240 240);
  --muted-foreground: rgb(92 92 92);
  --accent: rgb(0 112 201);
  --accent-foreground: rgb(249 249 249);
  --destructive: rgb(176 34 102);
  --destructive-foreground: rgb(240 240 240);
  --border: rgb(225 225 225);
  --input: rgb(240 240 240);
  --ring: rgb(0 112 201);
  --chart-1: rgb(0 112 201);
  --chart-2: rgb(70 150 0);
  --chart-3: rgb(255 165 0);
  --chart-4: rgb(220 38 38);
  --chart-5: rgb(99 102 241);
  --sidebar: rgb(245 245 245);
  --sidebar-foreground: rgb(18 18 18);
  --sidebar-primary: rgb(0 112 201);
  --sidebar-primary-foreground: rgb(249 249 249);
  --sidebar-accent: rgb(240 240 240);
  --sidebar-accent-foreground: rgb(63 63 63);
  --sidebar-border: rgb(225 225 225);
  --sidebar-ring: rgb(0 112 201);
  --dash-bg: rgb(245 245 245);
  --dash-surface: rgb(255 255 255);
  --dash-surface-hover: rgb(249 249 249);
  --dash-border: rgb(225 225 225);
  --dash-border-strong: rgb(210 210 210);
  --dash-text-primary: rgb(18 18 18);
  --dash-text-secondary: rgb(92 92 92);
  --dash-text-dim: rgb(137 137 137);
  --dash-blue: rgb(0 112 201);
  --dash-blue-light: rgb(59 130 246);
  --dash-blue-dim: rgb(219 234 254);
  --dash-orange: rgb(255 140 0);
  --dash-green: rgb(0 176 80);
  --dash-red: rgb(220 38 38);
  --dash-teal: rgb(20 184 166);
  --dash-bar-bg: rgb(231 231 231);
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

// ::v-deep(.el-card__body) {
//   padding: 10px;
// }
</style>
