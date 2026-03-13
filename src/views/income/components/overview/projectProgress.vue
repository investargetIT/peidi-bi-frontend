<script setup lang="ts">
import Progress from "../progress/index.vue";
import LightCircle from "../lightCircle/index.vue";
import { ref, watch } from "vue";
import {
  getWarningLightStatus,
  divide,
  getWeekOfMonth
} from "@/views/income/utils/calc";
import dayjs from "dayjs";
import _ from "lodash";
import { all } from "axios";

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

const dataList: any = ref([
  {
    name: "全渠道",
    status: "success",
    income: 0,
    target: 0,
    expect: 0,
    allIncome: 0
  },
  {
    name: "线上",
    status: "success",
    income: 0,
    target: 0,
    expect: 0,
    allIncome: 0
  },
  {
    name: "线下",
    status: "success",
    income: 0,
    target: 0,
    expect: 0,
    allIncome: 0
  }
]);

watch(
  () => [
    props.incomeTargetData,
    props.incomeMonthData,
    props.incomeWeekData,
    props.timeType
  ],
  ([incomeTargetData, incomeMonthData, incomeWeekData, timeType]) => {
    if (
      !incomeTargetData?.length ||
      !incomeMonthData?.length ||
      !incomeWeekData?.length
    )
      return;

    const temp = [
      {
        name: "全渠道",
        status: "success",
        income: 0,
        target: 0,
        expect: 0,
        allIncome: 0
      },
      {
        name: "线上",
        status: "success",
        income: 0,
        target: 0,
        expect: 0,
        allIncome: 0
      },
      {
        name: "线下",
        status: "success",
        income: 0,
        target: 0,
        expect: 0,
        allIncome: 0
      }
    ];

    // console.log(getWeekOfMonth());
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
          // 月数据没有全渠道，只有线上线下
          if (data.channelGroup === item.name) {
            income += Number(data.income || 0);
          }
          if (item.name === "全渠道") {
            income += Number(data.income || 0);
          }
        });
        item.income = Number(income || 0);

        // allIncome
        item.allIncome = income;
      });
    }

    temp.forEach(item => {
      const progress = divide(item.allIncome, item.target) * 100;
      item.status = getWarningLightStatus(progress, item.expect);
    });

    // console.log("进度:", temp);
    dataList.value = temp;
  }
);
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="text-base font-bold text-[var(--dash-text-primary)]">
        {{ props.timeType === "month" ? "本月" : "年" }}进度
      </div>
      <!-- <div class="text-sm text-[var(--dash-text-dim)]">
        <span class="font-semibold text-[var(--dash-blue)]">80% </span>目标进度
      </div> -->
    </div>

    <div v-for="item in dataList" :key="item.name">
      <div class="flex items-center justify-between mt-6 mb-2">
        <div class="flex items-center text-sm">
          <LightCircle :status="item.status" />
          <div class="text-[var(--dash-text-primary)] ml-3 font-medium">
            {{ item.name }}
          </div>
        </div>
        <div class="text-sm text-[var(--dash-text-dim)]">
          <span class="font-semibold text-[var(--dash-blue)]">{{
            _.floor(divide(item.allIncome, item.target) * 100) + "%"
          }}</span>
          <span class="ml-2">{{ item.target.toLocaleString() }}</span>
        </div>
      </div>

      <div>
        <Progress
          :segments="[
            {
              percentage: Math.min(
                divide(item.allIncome, item.target) * 100,
                100
              ),
              status: 'primary',
              text: item.allIncome.toLocaleString()
            }
          ]"
          height="25px"
        />
        <div class="mt-2" :style="{ width: item.expect + '%' }">
          <Progress
            :segments="[
              { percentage: 100, status: 'warning', text: item.expect + '%' }
            ]"
            height="25px"
          />
        </div>
      </div>
    </div>
  </div>
</template>
