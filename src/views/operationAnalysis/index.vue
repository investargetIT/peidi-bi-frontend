<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import E1 from "./components/echartCard/e1.vue";
import E2 from "./components/echartCard/e2.vue";
import E3 from "./components/echartCard/e3.vue";
import E4 from "./components/echartCard/e4.vue";
import { loadExcelFile, type SheetData } from "./utils/excelLoader";
import { ElMessage } from "element-plus";
import { SIZE_CONFIG, DATA_FORMAT } from "./utils/config";
import {
  getBusinessAnalysisOverviewList,
  getBusinessAnalysisGroupList,
  getBusinessAnalysisProductList,
  getBusinessAnalysisCostList
} from "@/api/operationAnalysis";
import dayjs from "dayjs";

// 源数据
const sourceData = ref<any>({});
const excelData = ref<any>({});
const loading = ref(false);
const sizeConfig = ref(SIZE_CONFIG.XS);
const dataTime = ref("");

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
const handleResize = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => {
    if (window.innerWidth >= 992) {
      sizeConfig.value = SIZE_CONFIG.MD;
    } else {
      sizeConfig.value = SIZE_CONFIG.XS;
    }
    console.log(window.innerWidth);
  }, 200);
};

//#region 工具函数
// 从"2.36%"或"-2.36%"中提取2.36或-2.36，如果是数字则直接返回
const extractNumber = (str: string | number) => {
  if (typeof str === "number") {
    return str;
  }

  const regex = /(-?\d+(\.\d+)?)/g;
  const matches = str.match(regex);
  if (matches) {
    return parseFloat(matches[0]);
  }
  return 0;
};

// 保留指定位数的小数 可以选择不保留小数位
const roundNumber = (num: number, precision: number = 0) => {
  if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
    return 0;
  }

  if (precision < 0) {
    precision = 0;
  }

  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
};
//#endregion
const loadExcelData = async () => {
  // excelData.value = DATA_FORMAT;
  const { E1, E2, E3, E4 } = DATA_FORMAT;
  //#region E1
  if (sourceData.value?.overviewList?.data?.length > 0) {
    const sOverview = sourceData.value.overviewList.data;
    for (const item of E1.income_pie) {
      item.value = roundNumber(
        sOverview.find(x => x.type === item.name)?.currentPeriodActual || 0
      );
    }
    E1.income_bar.xAxisData.forEach((item, index) => {
      const temp = sOverview.find(x => x.type === item);
      E1.income_bar.series[0].data[index] = roundNumber(
        extractNumber(temp?.completionRate || 0)
      );
      E1.income_bar.series[1].data[index] = roundNumber(
        extractNumber(temp?.annualProgress || 0)
      );
      E1.income_bar.series[2].data[index] = roundNumber(
        extractNumber(temp?.growthRate || 0)
      );
    });
    const overview_lirun = sOverview.find(x => x.type === "利润");
    E1.profit_flag = overview_lirun?.currentPeriodActual < 0 ? -1 : 1;
    E1.profit_pie[0].value = roundNumber(
      Math.abs(overview_lirun?.currentPeriodActual || 0)
    );
    E1.profit_bar.series[0].data[0] = roundNumber(
      extractNumber(overview_lirun?.completionRate || 0)
    );
    E1.profit_bar.series[1].data[0] = roundNumber(
      extractNumber(overview_lirun?.annualProgress || 0)
    );
    E1.profit_bar.series[2].data[0] = roundNumber(
      extractNumber(overview_lirun?.growthRate || 0)
    );
  }
  //#endregion
  //#region E2
  if (sourceData.value?.groupList?.data?.length > 0) {
    const sGroup = sourceData.value.groupList.data;
    E2.indicators_bar.xAxisData.forEach((item, index) => {
      const temp = sGroup.find(x => x.biGroup === item);
      E2.indicators_bar.series[0].data[index] = roundNumber(
        extractNumber(temp?.periodCumulativeActual || 0)
      );
      E2.indicators_bar.series[1].data[index] = roundNumber(
        extractNumber(temp?.priorYearActual || 0)
      );
      E2.indicators_bar.series[2].data[index] = roundNumber(
        extractNumber(temp?.achievementStatus || 0)
      );
      E2.indicators_bar.series[3].data[index] = roundNumber(
        extractNumber(temp?.achievementProgress || 0)
      );
    });
  }
  //#endregion
  //#region E3
  if (sourceData.value?.productList?.data?.length > 0) {
    const sProduct = sourceData.value.productList.data;
    // pie
    for (const item of E3.pd_pie) {
      item.value = roundNumber(
        sProduct.find(x => x.product === item.name)?.periodCumulativeRevenue ||
          0
      );
    }
    for (const item of E3.meatyway_pie) {
      item.value = roundNumber(
        sProduct.find(x => x.product === item.name)?.periodCumulativeRevenue ||
          0
      );
    }
    for (const item of E3.healthy_pie) {
      item.value = roundNumber(
        sProduct.find(x => x.product === item.name)?.periodCumulativeRevenue ||
          0
      );
    }
    // bar
    E3.pd_bar.xAxisData.forEach((item, index) => {
      const temp = sProduct.find(x => x.product === item);
      E3.pd_bar.series[0].data[index] = roundNumber(
        extractNumber(temp?.achievementProgress || 0)
      );
      E3.pd_bar.series[1].data[index] = roundNumber(
        extractNumber(temp?.yoyChangeRate || 0)
      );
    });
    E3.meatyway_bar.xAxisData.forEach((item, index) => {
      const temp = sProduct.find(x => x.product === item);
      E3.meatyway_bar.series[0].data[index] = roundNumber(
        extractNumber(temp?.achievementProgress || 0)
      );
      E3.meatyway_bar.series[1].data[index] = roundNumber(
        extractNumber(temp?.yoyChangeRate || 0)
      );
      E3.meatyway_bar.series[2].data[index] = roundNumber(
        extractNumber(temp?.grossProfitMargin || 0)
      );
    });
    E3.healthy_bar.xAxisData.forEach((item, index) => {
      const temp = sProduct.find(x => x.product === item);
      E3.healthy_bar.series[0].data[index] = roundNumber(
        extractNumber(temp?.achievementProgress || 0)
      );
      E3.healthy_bar.series[1].data[index] = roundNumber(
        extractNumber(temp?.yoyChangeRate || 0)
      );
      E3.healthy_bar.series[2].data[index] = roundNumber(
        extractNumber(temp?.grossProfitMargin || 0)
      );
    });
  }
  //#endregion
  //#region E4
  if (sourceData.value?.costList?.data?.length > 0) {
    const sCost = sourceData.value.costList.data;
    E4.eliminating_walmart_info[0] = sCost.find(
      x => x.type === "去除沃尔玛后毛利率"
    )?.periodCumulativeCost;
    E4.eliminating_walmart_info[1] = sCost.find(
      x => x.type === "去除沃尔玛后毛利率"
    )?.yoyChangeRate;
    E4.eliminating_walmart_info[2] = sCost.find(
      x => x.type === "去除沃尔玛后营销费率"
    )?.periodCumulativeCost;
    E4.eliminating_walmart_info[3] = sCost.find(
      x => x.type === "去除沃尔玛后营销费率"
    )?.yoyChangeRate;
    E4.cost_structure_bar.xAxisData.forEach((item, index) => {
      const temp = sCost.find(x => x.type === item);
      E4.cost_structure_bar.series[index] = roundNumber(
        extractNumber(temp?.periodCumulativeCost || 0),
        1
      );
    });
    E4.synchronous_change_bar.xAxisData.forEach((item, index) => {
      const temp = sCost.find(x => x.type === item);
      E4.synchronous_change_bar.series[index] = roundNumber(
        extractNumber(temp?.yoyChangeRate || 0),
        2
      );
    });
  }
  //#endregion
  excelData.value = { E1, E2, E3, E4 };

  return;
};

const loadBusinessAnalysisData = async () => {
  try {
    loading.value = true;

    let targetDate = dayjs().format("YYYY-MM-01");

    let [overviewList, groupList, productList, costList]: any[] =
      await Promise.all([
        getBusinessAnalysisOverviewList({ date: targetDate }),
        getBusinessAnalysisGroupList({ date: targetDate }),
        getBusinessAnalysisProductList({ date: targetDate }),
        getBusinessAnalysisCostList({ date: targetDate })
      ]);

    console.log("overviewList", overviewList);

    if (overviewList?.code === 200 && overviewList?.data?.length === 0) {
      targetDate = dayjs().subtract(1, "month").format("YYYY-MM-01");

      [overviewList, groupList, productList, costList] = await Promise.all([
        getBusinessAnalysisOverviewList({ date: targetDate }),
        getBusinessAnalysisGroupList({ date: targetDate }),
        getBusinessAnalysisProductList({ date: targetDate }),
        getBusinessAnalysisCostList({ date: targetDate })
      ]);
    }

    // console.log("核心指标:", overviewList);
    // console.log("团队指标:", groupList);
    // console.log("产品结构:", productList);
    // console.log("成本结构:", costList);

    const startDate = dayjs().format("YYYY.01");
    const endDate = dayjs((overviewList as any)?.data?.[0]?.date || "")
      .subtract(1, "month")
      .format("YYYY.MM");
    // console.log("起始日期:", startDate, "结束日期:", endDate);
    dataTime.value = `${startDate}~${endDate}`;

    sourceData.value = {
      overviewList,
      groupList,
      productList,
      costList
    };

    // ElMessage.success("数据加载成功");
  } catch (error) {
    console.error("数据加载失败:", error);
    ElMessage.error("数据加载失败");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadBusinessAnalysisData();

  await loadExcelData();

  if (window.innerWidth >= 992) {
    sizeConfig.value = SIZE_CONFIG.MD;
  } else {
    sizeConfig.value = SIZE_CONFIG.XS;
  }
  console.log(window.innerWidth);
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div v-loading="loading">
    <div>
      <E1
        :excelData="excelData"
        :sizeConfig="sizeConfig"
        :dataTime="dataTime"
      />
    </div>
    <div class="mt-4">
      <E2
        :excelData="excelData"
        :sizeConfig="sizeConfig"
        :dataTime="dataTime"
      />
    </div>
    <div class="mt-4">
      <E3
        :excelData="excelData"
        :sizeConfig="sizeConfig"
        :dataTime="dataTime"
      />
    </div>
    <div class="mt-4">
      <E4
        :excelData="excelData"
        :sizeConfig="sizeConfig"
        :dataTime="dataTime"
      />
    </div>
  </div>
</template>
