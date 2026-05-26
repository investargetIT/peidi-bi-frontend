<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import ChartCard from "@/components/PdChart/index.vue";
import {
  getTeamIncomeTargetList,
  type BiTeamIncomeTarget
} from "@/api/businessAnalysis";
import dayjs from "dayjs";

const props = defineProps({
  sizeConfig: {
    type: Object,
    required: true
  }
});

const tableData = ref<BiTeamIncomeTarget[]>([]);
const loading = ref(false);

// 渠道名称映射
const channelMap: Record<string, string> = {
  哈宠: "哈宠团队",
  天猫: "天猫团队",
  京东: "京东拼多多团队",
  抖音: "抖音团队",
  销售一组: "线下分销",
  销售二组: "EKA",
  销售三组: "商超",
  跨境电商: "跨境电商",
  Vivaland: "Vivaland"
};

// X轴数据顺序
const xAxisData = [
  "哈宠团队",
  "天猫团队",
  "京东拼多多团队",
  "抖音团队",
  "线下分销",
  "EKA",
  "商超",
  "跨境电商",
  "Vivaland"
];

// 计算百分比
const calcAchievementStatus = (current: number, target: number) => {
  if (!current || !target) return 0;
  return Math.round((current / target) * 100);
};

const calcYearOnYear = (current: number, lastYear: number) => {
  if (!current || !lastYear) return 0;
  return Math.round(((current - lastYear) / lastYear) * 100);
};

const calcProgress = (current: number, annual: number) => {
  if (!current || !annual) return 0;
  return Math.round((current / annual) * 100);
};

// 生成数据期间字符串
const generateDataTime = (data: BiTeamIncomeTarget[]) => {
  let minMonth = "";
  let maxMonth = "";

  for (const item of data) {
    if (
      item.biFinancialIncomeMonths &&
      item.biFinancialIncomeMonths.length > 0
    ) {
      for (const monthItem of item.biFinancialIncomeMonths) {
        const monthStr = `${monthItem.year}.${String(monthItem.month).padStart(2, "0")}`;
        if (!minMonth || monthStr < minMonth) minMonth = monthStr;
        if (!maxMonth || monthStr > maxMonth) maxMonth = monthStr;
      }
    }
  }

  if (minMonth && maxMonth) {
    return `${minMonth}~${maxMonth}`;
  }
  return "";
};

const dataTime = computed(() => generateDataTime(tableData.value));

// 按X轴顺序生成系列数据
const generateSeriesData = () => {
  // 用映射后的名称做key
  const dataMap: Record<string, BiTeamIncomeTarget> = {};
  for (const item of tableData.value) {
    const mappedName = channelMap[item.channel || ""];
    if (mappedName) {
      dataMap[mappedName] = item;
    }
  }

  const currentIncomeData: number[] = [];
  const lastYearIncomeData: number[] = [];
  const achievementStatusData: number[] = [];
  const progressData: number[] = [];

  for (const name of xAxisData) {
    const item = dataMap[name];
    if (item) {
      // 元转万元
      const current = item.currentIncome ? item.currentIncome / 10000 : 0;
      const lastYear = item.lastYearIncome ? item.lastYearIncome / 10000 : 0;
      const target = item.targetAmount ? item.targetAmount / 10000 : 0;
      const annual = item.annualTarget ? item.annualTarget / 10000 : 0;

      currentIncomeData.push(Math.round(current));
      lastYearIncomeData.push(Math.round(lastYear));
      achievementStatusData.push(calcAchievementStatus(current, target));
      progressData.push(calcProgress(current, annual));
    } else {
      currentIncomeData.push(0);
      lastYearIncomeData.push(0);
      achievementStatusData.push(0);
      progressData.push(0);
    }
  }

  return [
    {
      name: "本期累计",
      type: "bar" as const,
      color: "#12239E",
      data: currentIncomeData
    },
    {
      name: "去年同期",
      type: "bar" as const,
      color: "#118DFF",
      data: lastYearIncomeData
    },
    {
      name: "达成情况",
      type: "line" as const,
      yAxisIndex: 1,
      color: "#E66C37",
      data: achievementStatusData
    },
    {
      name: "达成进度",
      type: "line" as const,
      yAxisIndex: 1,
      color: "#E044A7",
      data: progressData
    }
  ];
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await getTeamIncomeTargetList({ year: dayjs().year() });
    if (res.success) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 团队指标达成
const generateSeries = () => {
  const baseLabelConfig = {
    show: true,
    position: "top",
    fontSize: props.sizeConfig.fontSizeL2,
    fontWeight: props.sizeConfig.fontWeight,
    color: "#666",
    fontFamily: "sans-serif"
  };

  const lineLabelConfig = {
    ...baseLabelConfig,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: [4, 6],
    borderRadius: 3,
    formatter: (params: any) => `${params.value}%`
  };

  return generateSeriesData().map(item => ({
    name: item.name,
    type: item.type,
    data: item.data,
    yAxisIndex: item.yAxisIndex || 0,
    itemStyle: {
      color: item.color
    },
    label: item.type === "line" ? lineLabelConfig : baseLabelConfig,
    emphasis: {
      focus: "series"
    }
  }));
};

const teamCard = computed(() => ({
  name: "teamCard",
  title: "",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: (params: any) => {
        let result = `<div style="font-weight: bold">${params[0].name}</div>`;
        params.forEach((param: any) => {
          const seriesName = param.seriesName;
          const value = param.value;
          // 对于使用第二个 Y 轴的系列（达成情况和达成进度），添加百分号
          if (param.seriesIndex === 2 || param.seriesIndex === 3) {
            result += `<div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${param.marker} ${seriesName}</span>
              <span style="margin-left: 10px; font-weight: bold;">${value}%</span>
            </div>`;
          } else {
            result += `<div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${param.marker} ${seriesName}</span>
              <span style="margin-left: 10px; font-weight: bold;">${value}</span>
            </div>`;
          }
        });
        return result;
      }
    },
    legend: {
      show: true,
      orient: "horizontal",
      left: "left",
      icon: "circle",
      itemWidth: 16, // 图标宽度
      itemHeight: 16, // 图标高度
      itemGap: 10, // 图例项之间的间距
      textStyle: {
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif"
      }
    },
    dataZoom: [
      {
        show: props.sizeConfig.name === "XS",
        type: "inside",
        start: 0,
        end: props.sizeConfig.name === "XS" ? 40 : 100
      },
      {
        show: props.sizeConfig.name === "XS",
        type: "slider",
        start: 0,
        end: props.sizeConfig.name === "XS" ? 40 : 100
      }
    ],
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        fontSize: props.sizeConfig.fontSize,
        fontWeight: props.sizeConfig.fontWeight,
        color: "#666",
        fontFamily: "sans-serif",
        interval: 0,
        rotate: props.sizeConfig.rotate
      }
    },
    yAxis: [
      {
        type: "value",
        axisLabel: {
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          color: "#666",
          fontFamily: "sans-serif"
        }
      },
      {
        type: "value",
        axisLabel: {
          fontSize: props.sizeConfig.fontSizeL2,
          fontWeight: props.sizeConfig.fontWeight,
          color: "#666",
          fontFamily: "sans-serif",
          formatter: (value: number) => `${value}%`
        }
      }
    ],
    series: generateSeries()
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
}));

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div v-loading="loading">
    <div class="text-[#0a0a0a] text-base md:text-xl">
      团队指标达成
      <span class="text-[#666] text-xs md:text-sm">
        (数据期间: {{ dataTime }})
      </span>
    </div>
    <ChartCard
      :name="teamCard.name"
      :title="teamCard.title"
      :text="teamCard.text"
      :option="teamCard.option"
      :style="teamCard?.style"
      :clacHeight="0"
      :showCard="false"
    />
  </div>
</template>
