<script setup lang="ts">
import { inject, onMounted, ref, watch, nextTick, computed } from "vue";
import LightCircle from "../common/lightCircle/index.vue";
import Progress from "../common/progress/index.vue";
import ProgressPro from "../common/progressPro/index.vue";
import MonthlyData from "./monthlyData.vue";
import _ from "lodash";
import { divide, generateID, getWeekOfMonth } from "../../utils/calc";

const props = defineProps({
  channel: {
    type: String,
    required: true
  }
});

const DATA_TYPE_CHANNEL = [
  {
    name: "天猫",
    type: "线上"
  },
  {
    name: "京东",
    type: "线上"
  },
  {
    name: "抖音",
    type: "线上"
  },
  {
    name: "哈宠",
    type: "线上"
  },
  {
    name: "跨境电商",
    type: "线上"
  },
  {
    name: "Vivaland",
    type: "线上"
  },
  {
    name: "销售一组",
    type: "线下"
  },
  {
    name: "销售二组",
    type: "线下"
  },
  {
    name: "销售三组",
    type: "线下"
  }
];
const DATA_TYPE_TIMERANGE = ["本月", "年度"];
const DATA_TYPE_INFO = ["目标达成", "进度", "对比信息"];

const dataTypeChannel = ref([]);

const cardList: any = ref([]);

const showAnimation = ref(false);

onMounted(() => {
  nextTick(() => {
    showAnimation.value = true;
  });
});

const incomeData = inject<any>("incomeData");
watch(
  () => incomeData.value,
  newVal => {
    if (
      newVal &&
      newVal.projectProgressDataDetail &&
      newVal.projectProgressDataDetail.length === 2
    ) {
      cardList.value = newVal.projectProgressDataDetail;
    }
  },
  {
    immediate: true
  }
);

const dataMap = computed(() => {
  const map = new Map();
  cardList.value.forEach((rangeData, rangeIndex) => {
    rangeData.forEach(item => {
      map.set(`${rangeIndex}-${item.name}`, item);
    });
  });
  return map;
});

const getDataForCardList = (channel: string, timerange: number) => {
  return dataMap.value.get(`${timerange}-${channel}`) || null;
};

watch(
  () => props.channel,
  newVal => {
    if (newVal === "全渠道") {
      dataTypeChannel.value = DATA_TYPE_CHANNEL;
    } else if (newVal === "线上") {
      dataTypeChannel.value = DATA_TYPE_CHANNEL.filter(
        item => item.type === "线上"
      );
    } else if (newVal === "线下") {
      dataTypeChannel.value = DATA_TYPE_CHANNEL.filter(
        item => item.type === "线下"
      );
    }
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div>
    <div
      v-for="channelItem in dataTypeChannel"
      :key="channelItem.name"
      class="peidi-income-detail-card-card px-1 py-1"
      :class="{ 'slide-in': showAnimation }"
    >
      <div class="flex items-center">
        <div class="text-sm text-[var(--primary-color)] font-bold">
          {{ channelItem.name }}
        </div>
        <el-tag
          class="ml-2"
          :type="channelItem.type === '线上' ? 'primary' : 'warning'"
          size="small"
        >
          {{ channelItem.type }}
        </el-tag>
      </div>

      <div class="px-1 py-2 bg-[#f7f8fa]">
        <div
          v-for="(timerange, timerangeIndex) in DATA_TYPE_TIMERANGE"
          :key="timerange"
        >
          <div class="flex items-center">
            <LightCircle
              :status="
                getDataForCardList(channelItem.name, timerangeIndex)?.status
              "
            />
            <div class="text-xs font-medium text-[var(--primary-color)] ml-2">
              {{ timerange }}
            </div>
          </div>

          <div v-for="info in DATA_TYPE_INFO" :key="info" class="mb-2">
            <div
              v-if="!(info === '对比信息' && timerange === '本月')"
              class="text-xs font-medium text-[var(--secondary-color)]"
            >
              {{ info }}
            </div>

            <div v-if="info === '目标达成'">
              <div>
                <span class="text-sm font-medium text-[var(--primary-color)]">
                  {{
                    _.floor(
                      getDataForCardList(channelItem.name, timerangeIndex)
                        ?.income
                    ).toLocaleString()
                  }}
                </span>
              </div>
              <div v-if="timerange === '本月'" class="mt-1">
                <div class="text-xs font-medium text-[var(--secondary-color)]">
                  *周数据为堆叠图，按比例堆叠
                </div>
                <Progress
                  :segments="
                    getDataForCardList(channelItem.name, timerangeIndex)
                      ?.allIncomeDetail.filter(item => {
                        return item.week < getWeekOfMonth();
                      })
                      .map(item => ({
                        percentage:
                          divide(
                            item.income,
                            getDataForCardList(channelItem.name, timerangeIndex)
                              ?.income
                          ) * 100,
                        status: 'week_' + item.week,
                        text: item.week + '周',
                        value: _.floor(item.income).toLocaleString()
                      }))
                  "
                  height="15px"
                />
              </div>
            </div>

            <div v-if="info === '进度'">
              <div>
                <div>
                  <ProgressPro
                    :title="`达成：${_.floor(
                      getDataForCardList(channelItem.name, timerangeIndex)
                        ?.income
                    ).toLocaleString()}`"
                    :percentage="
                      _.floor(
                        divide(
                          getDataForCardList(channelItem.name, timerangeIndex)
                            ?.income,
                          getDataForCardList(channelItem.name, timerangeIndex)
                            ?.target
                        ) * 100
                      )
                    "
                    :gradient-colors="['#003EA8', '#B4C5FF']"
                    :percentageColor="'#003EA8'"
                    animated
                  />
                </div>

                <div class="mt-1">
                  <ProgressPro
                    :title="`目标：${getDataForCardList(channelItem.name, timerangeIndex)?.target.toLocaleString()}`"
                    :percentage="
                      getDataForCardList(channelItem.name, timerangeIndex)
                        ?.expect
                    "
                    :gradient-colors="['#653E00', '#FFB95F']"
                    :percentageColor="'#653E00'"
                  />
                </div>
              </div>
            </div>

            <div v-if="info === '对比信息' && timerange === '年度'">
              <div
                class="flex items-center text-xs font-medium text-[var(--secondary-color)]"
              >
                <div>
                  <span>同比：</span>
                  <span
                    :class="
                      getDataForCardList(channelItem.name, timerangeIndex)
                        ?.yearOverYearGrowth < 0
                        ? 'text-[var(--dash-red)]'
                        : 'text-[var(--dash-green)]'
                    "
                  >
                    {{
                      getDataForCardList(channelItem.name, timerangeIndex)
                        ?.yearOverYearGrowth
                    }}%</span
                  >
                </div>
                <div v-if="false">
                  <span>环比：</span>
                  <span
                    :class="
                      getDataForCardList(channelItem.name, timerangeIndex)
                        ?.monthOverMonthGrowth < 0
                        ? 'text-[var(--dash-red)]'
                        : 'text-[var(--dash-green)]'
                    "
                  >
                    {{
                      getDataForCardList(channelItem.name, timerangeIndex)
                        ?.monthOverMonthGrowth
                    }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="text-base font-medium text-[var(--dash-text-primary)]">
            整体信息
          </div>

          <div>
            <MonthlyData
              :id="getDataForCardList(channelItem.name, 0)?.name"
              :dataList="
                getDataForCardList(channelItem.name, 0)?.monthIncomeList
              "
              :yearOverYearGrowthList="
                getDataForCardList(channelItem.name, 0)?.yearOverYearGrowthList
              "
              :monthOverMonthGrowthList="
                getDataForCardList(channelItem.name, 0)
                  ?.monthOverMonthGrowthList
              "
            />
          </div>

          <div class="mt-2">
            <div>
              <div>
                <ProgressPro
                  :title="`累计完成：${_.floor(
                    getDataForCardList(channelItem.name, 0)?.yearIncome
                  ).toLocaleString()}`"
                  :percentage="
                    _.floor(
                      divide(
                        getDataForCardList(channelItem.name, 0)?.yearIncome,
                        getDataForCardList(channelItem.name, 0)?.yearTarget
                      ) * 100
                    )
                  "
                  :gradient-colors="['#003EA8', '#B4C5FF']"
                  :percentageColor="'#003EA8'"
                  animated
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.el-card__header) {
  padding-top: 10px;
  padding-bottom: 10px;
}

::v-deep(.el-card__body) {
  padding: 10px 0 0;
}

.peidi-income-detail-card-card {
  background-color: #f5f7fa;
  border-radius: 2px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
  
  &.slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    max-height: 0;
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
  }
  to {
    opacity: 1;
    max-height: 1000px;
    margin-top: 10px;
    margin-bottom: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    overflow: visible;
  }
}
</style>