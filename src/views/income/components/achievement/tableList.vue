<script setup lang="ts">
import { ref, watch } from "vue";
import Progress from "../progress/index.vue";
import LightCircle from "../lightCircle/index.vue";
import MonthlyData from "../monthlyData/index.vue";
import {
  divide,
  getWarningLightStatus,
  getWeekOfMonth
} from "../../utils/calc";
import dayjs from "dayjs";
import _ from "lodash";

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

const tableData = ref([
  {
    name: "天猫"
  }
]);

watch(
  () => [
    props.incomeTargetData,
    props.incomeMonthData,
    props.incomeWeekData,
    props.timeType,
    props.incomeLastYearData
  ],
  ([
    incomeTargetData,
    incomeMonthData,
    incomeWeekData,
    timeType,
    incomeLastYearData
  ]) => {
    if (
      !incomeTargetData?.length ||
      !incomeMonthData?.length ||
      !incomeWeekData?.length ||
      !incomeLastYearData?.length
    )
      return;

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
        allIncome: 0,

        allIncomeDetail: [], // 本月专用
        monthIncomeList: [], // 本月专用
        yearTarget: 0, // 本月专用
        yearIncome: 0, // 本月专用

        yearOverYearGrowth: 0, // 同比 本月专用
        monthOverMonthGrowth: 0, // 环比

        yearOverYearGrowthList: [], // 同比 本月专用
        monthOverMonthGrowthList: [] // 环比
      });
    });

    if (timeType === "month") {
      temp.forEach(item => {
        // expect 在周数据里去找到该周的期望值
        const expect = incomeWeekData.find(
          data => data.week === getWeekOfMonth() && data.channel === item.name
        )?.monthExpectation;
        item.expect = Number((expect * 100).toFixed(0));

        // target
        const target = incomeTargetData.find(
          data =>
            data.month === dayjs().month() + 1 && data.channel === item.name
        )?.target;
        item.target = Number(target || 0);

        // income 本月 取前一周的数据 如果是第一周 就为0
        if (getWeekOfMonth() === 1) {
          item.income = 0;
        } else {
          const income = incomeWeekData.find(
            data =>
              data.week === getWeekOfMonth() - 1 && data.channel === item.name
          )?.income;
          item.income = Number(income || 0);
        }

        // allIncome incomeWeekData全部income加起来
        item.allIncome = incomeWeekData
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.income || 0), 0);

        // allIncomeDetail 所有周的income
        item.allIncomeDetail = incomeWeekData
          .filter(data => data.channel === item.name)
          .map(data => ({
            week: data.week,
            income: Number(data.income || 0)
          }));

        // monthIncomeList 所有月的income
        item.monthIncomeList = incomeMonthData
          .filter(data => data.channel === item.name)
          .map(data => ({
            month: data.month,
            income: Number(data.income || 0)
          }));
        item.monthIncomeList.push({
          month: dayjs().month() + 1,
          income: item.allIncome
        });

        // yearTarget 本年的target   // target 算总和
        const yearTarget = incomeTargetData
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.target || 0), 0);
        item.yearTarget = Number(yearTarget || 0);

        // yearIncome 如果是本年的，就把本周 和月数据 加起来
        let yearIncome = 0;
        incomeWeekData.forEach(data => {
          if (data.channel === item.name) {
            yearIncome += Number(data.income || 0);
          }
        });
        incomeMonthData.forEach(data => {
          if (data.channel === item.name) {
            yearIncome += Number(data.income || 0);
          }
        });
        item.yearIncome = Number(yearIncome || 0);

        // yearOverYearGrowth 同比
        const lastYearIncome = incomeLastYearData.find(
          data =>
            data.month === dayjs().month() + 1 && data.channel === item.name
        )?.income;
        item.yearOverYearGrowth = _.floor(
          divide(
            Number(item.allIncome) - Number(lastYearIncome),
            lastYearIncome
          ) * 100
        );
        // monthOverMonthGrowth 环比
        function getMonthOverMonthGrowth() {
          let lastMonthIncome = 0;
          // 如果是1月份，需要特殊处理
          if (dayjs().month() + 1 === 1) {
            // 1月份去去年的12月
            lastMonthIncome = incomeLastYearData.find(
              data => data.month === 12 && data.channel === item.name
            )?.income;
          } else {
            // 去月数据里找到上个月的income
            lastMonthIncome = incomeMonthData.find(
              data =>
                data.month === dayjs().month() && data.channel === item.name
            )?.income;
          }
          return _.floor(
            divide(
              Number(item.allIncome) - Number(lastMonthIncome),
              lastMonthIncome
            ) * 100
          );
        }
        item.monthOverMonthGrowth = getMonthOverMonthGrowth();

        // yearOverYearGrowthList 同比曲线
        function getYearOverYearGrowthList() {
          const result = [];
          const currentMonth = dayjs().month() + 1;

          // 遍历 1-12 月
          for (let month = 1; month <= 12; month++) {
            let lastYearIncome = 0;
            let currentYearIncome = 0;

            // 获取去年该月的收入
            const lastYearData = incomeLastYearData.find(
              data => data.month === month && data.channel === item.name
            );
            lastYearIncome = Number(lastYearData?.income || 0);

            // 获取今年该月的收入
            if (month < currentMonth) {
              // 过去的月份，从 incomeMonthData 中取
              const currentMonthData = incomeMonthData.find(
                data => data.month === month && data.channel === item.name
              );
              currentYearIncome = Number(currentMonthData?.income || 0);
            } else if (month === currentMonth) {
              // 当前月份，使用累计收入
              currentYearIncome = Number(item.allIncome || 0);
            } else {
              // 未来的月份，暂时为 0 或者可以使用 target
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

        // monthOverMonthGrowthList 环比曲线
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
              const currentMonthData = incomeMonthData.find(
                data => data.month === month && data.channel === item.name
              );
              currentMonthIncome = Number(currentMonthData?.income || 0);
            } else if (month === currentMonth) {
              // 当前月份，使用累计收入
              currentMonthIncome = Number(item.allIncome || 0);
            } else {
              // 未来的月份，暂时为 0
              currentMonthIncome = 0;
            }

            // 获取上月收入
            if (month === 1) {
              // 1 月份，需要取去年 12 月的数据
              const lastYearDecData = incomeLastYearData.find(
                data => data.month === 12 && data.channel === item.name
              );
              lastMonthIncome = Number(lastYearDecData?.income || 0);
            } else {
              // 其他月份，取今年的上月数据
              const lastMonth = month - 1;
              const lastMonthData = incomeMonthData.find(
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
      });
    }
    if (timeType === "year") {
      temp.forEach(item => {
        // expect 在周数据里去找到该周的期望值
        const expect = incomeWeekData.find(
          data => data.week === getWeekOfMonth() && data.channel === item.name
        )?.yearExpectation;
        item.expect = Number((expect * 100).toFixed(0));

        // target 算总和
        const target = incomeTargetData
          .filter(data => data.channel === item.name)
          .reduce((acc, cur) => acc + Number(cur.target || 0), 0);
        item.target = Number(target || 0);

        // income 如果是本年的，就把本周 和月数据 加起来
        let income = 0;
        incomeWeekData.forEach(data => {
          if (data.channel === item.name) {
            income += Number(data.income || 0);
          }
        });
        incomeMonthData.forEach(data => {
          if (data.channel === item.name) {
            income += Number(data.income || 0);
          }
        });
        item.income = Number(income || 0);

        // allIncome
        item.allIncome = income;

        // monthOverMonthGrowth 环比
        function getMonthOverMonthGrowth() {
          // 去年数据里面找到当前name的所有数据，并且income求和
          const lastYearIncome = incomeLastYearData
            .filter(data => data.channel === item.name)
            .reduce((acc, cur) => acc + Number(cur.income || 0), 0);
          return _.floor(
            divide(
              Number(item.allIncome) - Number(lastYearIncome),
              lastYearIncome
            ) * 100
          );
        }
        item.monthOverMonthGrowth = getMonthOverMonthGrowth();
      });
    }

    temp.forEach(item => {
      const progress = divide(item.income, item.target) * 100;
      item.status = getWarningLightStatus(progress, item.expect);
    });

    console.log("详情汇总", temp);
    tableData.value = temp;
  }
);
</script>

<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%"
      :header-row-style="{ color: 'text-[var(--dash-text-dim)]' }"
      :preserve-expanded-content="false"
    >
      <el-table-column v-if="timeType === 'month'" type="expand">
        <template #default="scope">
          <div class="px-10">
            <div>
              <div class="mt-2">
                <Progress
                  :segments="
                    scope.row.allIncomeDetail.map(item => ({
                      percentage:
                        divide(item.income, scope.row.allIncome) * 100,
                      status: 'week_' + item.week,
                      text:
                        item.week +
                        '周： ' +
                        _.floor(item.income).toLocaleString()
                    }))
                  "
                  height="25px"
                />
              </div>
            </div>
            <div class="text-sm font-medium text-[#eab308] mt-3">
              "周数据为堆叠图，按比例堆叠"
            </div>
            <div class="mt-3">
              <MonthlyData
                :id="scope.row.name"
                :dataList="scope.row.monthIncomeList"
                :yearOverYearGrowthList="scope.row.yearOverYearGrowthList"
                :monthOverMonthGrowthList="scope.row.monthOverMonthGrowthList"
              />
            </div>
            <div class="flex items-center justify-between">
              <div
                class="text-[var(--dash-text-primary)] text-xs font-semibold flex-1"
              >
                累计完成
              </div>
              <div class="flex-6 mt-3">
                <Progress
                  :segments="[
                    {
                      percentage:
                        divide(scope.row.yearIncome, scope.row.yearTarget) *
                        100,
                      status: 'success',
                      text: _.floor(scope.row.yearIncome).toLocaleString()
                    }
                  ]"
                  height="25px"
                />
              </div>
              <div
                class="text-xs font-bold text-[var(--dash-green)] text-right flex-1"
              >
                {{
                  _.floor(
                    divide(scope.row.yearIncome, scope.row.yearTarget) * 100
                  )
                }}
                %
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="渠道" width="150">
        <template #default="scope">
          <div class="flex items-center text-sm h-[32px]">
            <LightCircle :status="scope.row.status" />
            <div class="font-bold text-[var(--dash-text-primary)] ml-3">
              {{ scope.row.name }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="targetAchievement"
        label="目标达成"
        min-width="150"
      >
        <template #default="scope">
          <div>
            <Progress
              :segments="[
                {
                  percentage: 100,
                  status: 'primary',
                  text: _.floor(scope.row.allIncome).toLocaleString()
                }
              ]"
              height="25px"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="进度" min-width="150">
        <template #default="scope">
          <div>
            <Progress
              :segments="[
                {
                  percentage: _.floor(
                    divide(scope.row.allIncome, scope.row.target) * 100
                  ),
                  status: 'primary',
                  text:
                    _.floor(
                      divide(scope.row.allIncome, scope.row.target) * 100
                    ) + '%'
                }
              ]"
              height="25px"
            />
            <div class="mt-2" :style="{ width: scope.row.expect + '%' }">
              <Progress
                :segments="[
                  {
                    percentage: 100,
                    status: 'warning',
                    text: scope.row.expect + '%'
                  }
                ]"
                height="25px"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="props.timeType === 'month'"
        prop="yearOverYearGrowth"
        label="同比"
        width="80"
      >
        <template #default="scope">
          <span class="text-center text-sm font-bold text-[var(--dash-green)]">
            {{ scope.row.yearOverYearGrowth }}%
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="monthOverMonthGrowth" label="环比" width="80">
        <template #default="scope">
          <span class="text-center text-sm font-bold text-[var(--dash-green)]">
            {{ scope.row.monthOverMonthGrowth }}%
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
