<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import ChartCard from "@/components/PdChart/index.vue";

const COLOR_CHANNEL_LIST = {
  抖音: "#000", // 抖音标志性的粉红色
  京东: "#E60012", // 京东经典的红色
  微盟: "#00AEEF", // 微盟品牌蓝色
  淘宝: "#FF4400" // 淘宝橙色
};
const COLOR_CITY_LIST = {
  1: "#FF6B6B", // 一线城市 - 鲜艳的珊瑚红，代表最高级别
  2: "#4ECDC4", // 二线城市 - 清新的青绿色，中等级别
  3: "#45B7D1", // 三线城市 - 稳重的蓝色，基础级别
  其他: "#95A5A6" // 其他城市 - 中性的灰色，低调但清晰
};
const COLOR_CUSTOMER_LEVEL_LIST = {
  核心客户: "#FF6B35", // 一级客户 - 温暖的橙色，代表最高价值和活跃度
  高价值客户: "#4A90E2", // 二级客户 - 专业的蓝色，代表稳定价值
  一般价值客户: "#7ED321", // 三级客户 - 活力的绿色，代表成长潜力
  低价值客户: "#8E8E93" // 其他客户 - 柔和的灰色，保持低调
};
const COLOR_BAR_LIST = {
  NORMAL: "#5C7BD9",
  GOOD: "#10B981", // 翠绿色，更柔和
  BAD: "#EF4444" // 珊瑚红色，更温暖
};

// props
const props = defineProps({
  dataList: {
    type: Object,
    required: true
  }
});

// watch dataList
watch(
  () => props.dataList,
  (newVal, oldVal) => {
    //#region 环形图模块
    // 客户渠道占比（客户数量）
    initChannelDistributionByCustomerCountCards();
    function initChannelDistributionByCustomerCountCards() {
      const temp = [];
      if (newVal["客户渠道占比（客户数量）"]) {
        for (const item of sortArrayByKey(
          newVal["客户渠道占比（客户数量）"],
          "channel"
        )) {
          temp.push({
            value: item.cnt,
            name: item.channel,
            itemStyle: { color: COLOR_CHANNEL_LIST[item.channel] }
          });
        }
      }
      channelDistributionByCustomerCountCards.value.option.series[0].data =
        temp;
    }

    // 客户渠道占比（累计消费金额）
    initChannelDistributionByTotalAmountCards();
    function initChannelDistributionByTotalAmountCards() {
      const temp = [];
      if (newVal["客户渠道占比（累计消费金额）"]) {
        for (const item of sortArrayByKey(
          newVal["客户渠道占比（累计消费金额）"],
          "channel"
        )) {
          temp.push({
            value: item.total_amount,
            name: item.channel,
            itemStyle: { color: COLOR_CHANNEL_LIST[item.channel] }
          });
        }
      }
      channelDistributionByTotalAmountCards.value.option.series[0].data = temp;
    }

    // 客户城市等级占比（客户数量）
    initCityLevelDistributionByCustomerCountCards();
    function initCityLevelDistributionByCustomerCountCards() {
      const temp = [];
      if (newVal["客户城市等级占比（客户数量）"]) {
        for (const item of sortArrayByKey(
          newVal["客户城市等级占比（客户数量）"],
          "level"
        )) {
          if (!item.level) {
            continue;
          }
          temp.push({
            value: item.cnt,
            name: item.level,
            itemStyle: { color: COLOR_CITY_LIST[item.level] }
          });
        }
      }
      cityLevelDistributionByCustomerCountCards.value.option.series[0].data =
        temp;
    }

    // 客户城市等级占比（累计消费金额）
    initCityLevelDistributionByTotalAmountCards();
    function initCityLevelDistributionByTotalAmountCards() {
      const temp = [];
      if (newVal["客户城市等级占比（累计消费金额）"]) {
        for (const item of sortArrayByKey(
          newVal["客户城市等级占比（累计消费金额）"],
          "level"
        )) {
          if (!item.level) {
            continue;
          }
          temp.push({
            value: item.total_amount,
            name: item.level,
            itemStyle: { color: COLOR_CITY_LIST[item.level] }
          });
        }
      }
      cityLevelDistributionByTotalAmountCards.value.option.series[0].data =
        temp;
    }

    // 客户类别占比（客户数量）
    initCategoryDistributionByCustomerCountCards();
    function initCategoryDistributionByCustomerCountCards() {
      const temp = [
        {
          value: 0,
          name: "核心客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["核心客户"] }
        },
        {
          value: 0,
          name: "高价值客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["高价值客户"] }
        },
        {
          value: 0,
          name: "一般价值客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["一般价值客户"] }
        },
        {
          value: 0,
          name: "低价值客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["低价值客户"] }
        }
      ];
      if (newVal["客户类别占比（客户数量）"]) {
        for (const item of newVal["客户类别占比（客户数量）"]) {
          if (item.rfm_type) {
            temp.find(t => t.name === item.rfm_type).value = item.cnt;
          }
        }
      }
      categoryDistributionByCustomerCountCards.value.option.series[0].data =
        temp;
    }

    // 客户类别占比（累计消费金额）
    initCategoryDistributionByTotalAmountCards();
    function initCategoryDistributionByTotalAmountCards() {
      const temp = [
        {
          value: 0,
          name: "核心客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["核心客户"] }
        },
        {
          value: 0,
          name: "高价值客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["高价值客户"] }
        },
        {
          value: 0,
          name: "一般价值客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["一般价值客户"] }
        },
        {
          value: 0,
          name: "低价值客户",
          itemStyle: { color: COLOR_CUSTOMER_LEVEL_LIST["低价值客户"] }
        }
      ];
      if (newVal["客户类别占比（累计消费金额）"]) {
        for (const item of newVal["客户类别占比（累计消费金额）"]) {
          if (item.rfm_type) {
            temp.find(t => t.name === item.rfm_type).value = item.total_amount;
          }
        }
      }
      categoryDistributionByTotalAmountCards.value.option.series[0].data = temp;
    }
    //#endregion

    //#region 柱状图模块
    // 每类客户每月复购率
    initRepurchaseRateByMonth();
    function initRepurchaseRateByMonth() {
      const generalTemp = [];
      const lowTemp = [];
      const coreTemp = [];
      const hightTemp = [];
      if (newVal["每类客户每月复购率"]) {
        for (const item of newVal["每类客户每月复购率"]) {
          if (item.rfm_type === "一般价值客户") {
            generalTemp[item.order_month - 1] = item.repurchase_rate_percent;
          } else if (item.rfm_type === "低价值客户") {
            lowTemp[item.order_month - 1] = item.repurchase_rate_percent;
          } else if (item.rfm_type === "核心客户") {
            coreTemp[item.order_month - 1] = item.repurchase_rate_percent;
          } else if (item.rfm_type === "高价值客户") {
            hightTemp[item.order_month - 1] = item.repurchase_rate_percent;
          }
        }
      }
      repurchaseRateByMonthGeneralValueCards.value.option.series[0].data =
        generalTemp;
      repurchaseRateByMonthLowValueCards.value.option.series[0].data = lowTemp;
      repurchaseRateByMonthCoreValueCards.value.option.series[0].data =
        coreTemp;
      repurchaseRateByMonthHighValueCards.value.option.series[0].data =
        hightTemp;
    }
    // 总客户复购率每月复购率
    initTotalRepurchaseRateByMonth();
    function initTotalRepurchaseRateByMonth() {
      const rebuy_customers_temp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const total_customers_temp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      if (newVal["每类客户每月复购率"]) {
        for (const item of newVal["每类客户每月复购率"]) {
          rebuy_customers_temp[item.order_month - 1] = item.rebuy_customers;
          total_customers_temp[item.order_month - 1] = item.total_customers;
        }
      }
      const temp = rebuy_customers_temp.map((item, index) => {
        return ((item / total_customers_temp[index]) * 100).toFixed(2);
      });
      totalRepurchaseRateByMonthCards.value.option.series[0].data = temp;
    }

    // 每月新客/挽回/流失数量
    initNewOrRetainOrLoseByMonth();
    function initNewOrRetainOrLoseByMonth() {
      const new_customers_temp = [];
      const retain_customers_temp = [];
      const lose_customers_temp = [];
      if (newVal["每月新客数量"]) {
        for (const item of newVal["每月新客数量"]) {
          new_customers_temp[item.order_month - 1] = item.new_customer_cnt;
        }
      }
      if (newVal["每月挽回数量"]) {
        for (const item of newVal["每月挽回数量"]) {
          retain_customers_temp[item.order_month - 1] = item.back_customer_cnt;
        }
      }
      if (newVal["每月流失数量"]) {
        for (const item of newVal["每月流失数量"]) {
          lose_customers_temp[item.month - 1] = item.lossing_customer_cnt;
        }
      }
      newOrRetainOrLoseByMonthCards.value = {
        ...newOrRetainOrLoseByMonthCards.value,
        option: {
          ...newOrRetainOrLoseByMonthCards.value.option,
          legend: {
            data: ["新客数量", "挽回数量", "流失数量"],
            selected: {
              新客数量: true,
              挽回数量: false,
              流失数量: false
            }
          },
          series: [
            {
              name: "新客数量",
              type: "bar",
              data: new_customers_temp
            },
            {
              name: "挽回数量",
              type: "bar",
              data: retain_customers_temp
            },
            {
              name: "流失数量",
              type: "bar",
              data: lose_customers_temp
            }
          ]
        }
      };
    }
    //#endregion
  }
);

//#region 环形图模块
// 客户渠道占比（客户数量）
const channelDistributionByCustomerCountCards = ref({
  name: "channelDistributionByCustomerCountCards",
  title: "客户渠道占比（客户数量）",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}: ${formatToWan(params.value)} (${params.percent}%)`;
      }
    },
    series: [
      {
        minAngle: 5, // 最小的扇区角度（0~360），用于防止某个值过小导致扇区太小影响交互
        type: "pie",
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "inner",
          // alignTo: "edge", // 标签对齐到边缘，防止标签重叠
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)} (${params.percent}%)`;
          },
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          // length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          // length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
// 客户渠道占比（累计消费金额）
const channelDistributionByTotalAmountCards = ref({
  name: "channelDistributionByTotalAmountCards",
  title: "客户渠道占比（累计消费金额）",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}: ${formatToWan(params.value)} (${params.percent}%)`;
      }
    },
    series: [
      {
        minAngle: 5, // 最小的扇区角度（0~360），用于防止某个值过小导致扇区太小影响交互
        type: "pie",
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "inner",
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)} (${params.percent}%)`;
          },
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          // length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          // length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

// 客户城市等级占比（客户数量）
const cityLevelDistributionByCustomerCountCards = ref({
  name: "cityLevelDistributionByCustomerCountCards",
  title: "客户城市等级占比（客户数量）",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}: ${formatToWan(params.value)} (${params.percent}%)`;
      }
    },
    series: [
      {
        minAngle: 5,
        avoidLabelOverlap: false,
        type: "pie",
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "inner",
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)} (${params.percent}%)`;
          },
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          // length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          // length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
// 客户城市等级占比（累计消费金额）
const cityLevelDistributionByTotalAmountCards = ref({
  name: "cityLevelDistributionByTotalAmountCards",
  title: "客户城市等级占比（累计消费金额）",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}: ${formatToWan(params.value)} (${params.percent}%)`;
      }
    },
    series: [
      {
        minAngle: 5,
        avoidLabelOverlap: false,
        type: "pie",
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "inner",
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)} (${params.percent}%)`;
          },
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          // length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          // length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

// 客户类别占比（客户数量）
const categoryDistributionByCustomerCountCards = ref({
  name: "categoryDistributionByCustomerCountCards",
  title: "客户类别占比（客户数量）",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}: ${formatToWan(params.value)} (${params.percent}%)`;
      }
    },
    series: [
      {
        minAngle: 5,
        avoidLabelOverlap: false,
        type: "pie",
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "inner",
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)} (${params.percent}%)`;
          },
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          // length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          // length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
// 客户类别占比（累计消费金额）
const categoryDistributionByTotalAmountCards = ref({
  name: "categoryDistributionByTotalAmountCards",
  title: "客户类别占比（累计消费金额）",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}: ${formatToWan(params.value)} (${params.percent}%)`;
      }
    },
    series: [
      {
        minAngle: 5,
        avoidLabelOverlap: false,
        type: "pie",
        radius: ["35%", "60%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          // { value: 1048, name: "Search Engine" },
          // { value: 735, name: "Direct" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          position: "inner",
          formatter: (params: any) => {
            return `${params.name}\n${formatToWan(params.value)} (${params.percent}%)`;
          },
          fontSize: 12,
          rich: {
            b: {
              fontWeight: "bold"
            }
          }
        },
        labelLine: {
          smooth: true,
          minTurnAngle: 90,
          // length: 55, // 增加第一段线长度，让引导线垂直延伸更远
          // length2: 30, // 增加第二段线长度，控制弯曲后的水平距离
          lineStyle: {
            width: 1,
            type: "solid"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
//#endregion

//#region 柱状图模块
// 客户每月复购率 一般价值客户
const repurchaseRateByMonthGeneralValueCards = ref({
  name: "repurchaseRateByMonthGeneralValueCards",
  title: "客户每月复购率 一般价值客户",
  text: "",
  option: {
    color: [COLOR_BAR_LIST.NORMAL],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "复购率",
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: "复购率",
        type: "bar",
        barWidth: "60%",
        data: [
          // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        ]
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
// 客户每月复购率  低价值客户
const repurchaseRateByMonthLowValueCards = ref({
  name: "repurchaseRateByMonthLowValueCards",
  title: "客户每月复购率 低价值客户",
  text: "",
  option: {
    color: [COLOR_BAR_LIST.NORMAL],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "复购率",
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: "复购率",
        type: "bar",
        barWidth: "60%",
        data: [
          // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        ]
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
// 客户每月复购率  核心客户
const repurchaseRateByMonthCoreValueCards = ref({
  name: "repurchaseRateByMonthCoreValueCards",
  title: "客户每月复购率 核心客户",
  text: "",
  option: {
    color: [COLOR_BAR_LIST.NORMAL],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "复购率",
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: "复购率",
        type: "bar",
        barWidth: "60%",
        data: [
          // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        ]
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});
// 客户每月复购率 高价值客户
const repurchaseRateByMonthHighValueCards = ref({
  name: "repurchaseRateByMonthHighValueCards",
  title: "客户每月复购率 高价值客户",
  text: "",
  option: {
    color: [COLOR_BAR_LIST.NORMAL],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "复购率",
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: "复购率",
        type: "bar",
        barWidth: "60%",
        data: [
          // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        ]
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

// 总客户每月复购率
const totalRepurchaseRateByMonthCards = ref({
  name: "totalRepurchaseRateByMonthCards",
  title: "总客户每月复购率",
  text: "",
  option: {
    color: [COLOR_BAR_LIST.NORMAL],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "复购率",
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: "复购率",
        type: "bar",
        barWidth: "60%",
        data: [
          // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        ]
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

// 每月新客数量 每月挽回数量 每月流失数量
const newOrRetainOrLoseByMonthCards = ref({
  name: "newOrRetainOrLoseByMonthCards",
  title: "每月新客/挽回/流失数量",
  text: "",
  option: {
    color: [COLOR_BAR_LIST.NORMAL, COLOR_BAR_LIST.GOOD, COLOR_BAR_LIST.BAD],
    legend: {},
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "数量",
        axisLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: "新客数量",
        type: "bar",
        data: []
      },
      {
        name: "挽回数量",
        type: "bar",
        data: []
      },
      {
        name: "流失数量",
        type: "bar",
        data: []
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

//#endregion

// 格式化数字为万单位
const formatToWan = (value: number) => {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + "万";
  }
  return value.toString();
};
// 将对象数组里的对象根据提供的key排序，支持中文排序
const sortArrayByKey = (arr: any, key: string) => {
  return arr.sort((a: any, b: any) => {
    return a[key].localeCompare(b[key]);
  });
};
</script>

<template>
  <div class="overflow-x-hidden">
    <el-row :gutter="30">
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="channelDistributionByCustomerCountCards.name"
          :title="channelDistributionByCustomerCountCards.title"
          :text="channelDistributionByCustomerCountCards.text"
          :option="channelDistributionByCustomerCountCards.option"
          :style="channelDistributionByCustomerCountCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="channelDistributionByTotalAmountCards.name"
          :title="channelDistributionByTotalAmountCards.title"
          :text="channelDistributionByTotalAmountCards.text"
          :option="channelDistributionByTotalAmountCards.option"
          :style="channelDistributionByTotalAmountCards?.style"
        />
      </el-col>
    </el-row>

    <el-row :gutter="30">
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="cityLevelDistributionByCustomerCountCards.name"
          :title="cityLevelDistributionByCustomerCountCards.title"
          :text="cityLevelDistributionByCustomerCountCards.text"
          :option="cityLevelDistributionByCustomerCountCards.option"
          :style="cityLevelDistributionByCustomerCountCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="cityLevelDistributionByTotalAmountCards.name"
          :title="cityLevelDistributionByTotalAmountCards.title"
          :text="cityLevelDistributionByTotalAmountCards.text"
          :option="cityLevelDistributionByTotalAmountCards.option"
          :style="cityLevelDistributionByTotalAmountCards?.style"
        />
      </el-col>
    </el-row>

    <el-row :gutter="30">
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="categoryDistributionByCustomerCountCards.name"
          :title="categoryDistributionByCustomerCountCards.title"
          :text="categoryDistributionByCustomerCountCards.text"
          :option="categoryDistributionByCustomerCountCards.option"
          :style="categoryDistributionByCustomerCountCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="categoryDistributionByTotalAmountCards.name"
          :title="categoryDistributionByTotalAmountCards.title"
          :text="categoryDistributionByTotalAmountCards.text"
          :option="categoryDistributionByTotalAmountCards.option"
          :style="categoryDistributionByTotalAmountCards?.style"
        />
      </el-col>
    </el-row>

    <el-row :gutter="30">
      <el-col :sm="24" :lg="6" class="mb-[20px]">
        <ChartCard
          class="mb-[20px]"
          :name="repurchaseRateByMonthCoreValueCards.name"
          :title="repurchaseRateByMonthCoreValueCards.title"
          :text="repurchaseRateByMonthCoreValueCards.text"
          :option="repurchaseRateByMonthCoreValueCards.option"
          :style="repurchaseRateByMonthCoreValueCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="6" class="mb-[20px]">
        <ChartCard
          class="mb-[20px]"
          :name="repurchaseRateByMonthHighValueCards.name"
          :title="repurchaseRateByMonthHighValueCards.title"
          :text="repurchaseRateByMonthHighValueCards.text"
          :option="repurchaseRateByMonthHighValueCards.option"
          :style="repurchaseRateByMonthHighValueCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="6" class="mb-[20px]">
        <ChartCard
          class="mb-[20px]"
          :name="repurchaseRateByMonthGeneralValueCards.name"
          :title="repurchaseRateByMonthGeneralValueCards.title"
          :text="repurchaseRateByMonthGeneralValueCards.text"
          :option="repurchaseRateByMonthGeneralValueCards.option"
          :style="repurchaseRateByMonthGeneralValueCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="6" class="mb-[20px]">
        <ChartCard
          class="mb-[20px]"
          :name="repurchaseRateByMonthLowValueCards.name"
          :title="repurchaseRateByMonthLowValueCards.title"
          :text="repurchaseRateByMonthLowValueCards.text"
          :option="repurchaseRateByMonthLowValueCards.option"
          :style="repurchaseRateByMonthLowValueCards?.style"
        />
      </el-col>
    </el-row>

    <el-row :gutter="30">
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="totalRepurchaseRateByMonthCards.name"
          :title="totalRepurchaseRateByMonthCards.title"
          :text="totalRepurchaseRateByMonthCards.text"
          :option="totalRepurchaseRateByMonthCards.option"
          :style="totalRepurchaseRateByMonthCards?.style"
        />
      </el-col>
      <el-col :sm="24" :lg="12">
        <ChartCard
          class="mb-[20px]"
          :name="newOrRetainOrLoseByMonthCards.name"
          :title="newOrRetainOrLoseByMonthCards.title"
          :text="newOrRetainOrLoseByMonthCards.text"
          :option="newOrRetainOrLoseByMonthCards.option"
          :style="newOrRetainOrLoseByMonthCards?.style"
        />
      </el-col>
    </el-row>
  </div>
</template>
