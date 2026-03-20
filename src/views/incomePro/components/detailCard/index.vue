<script setup lang="ts">
import { inject, onMounted, ref, watch, nextTick, computed } from "vue";
import LightCircle from "../common/lightCircle/index.vue";
import Progress from "../common/progress/index.vue";
import MonthlyData from "../achievement/monthlyData.vue";
import _ from "lodash";
import { divide, formatIncomeNumber } from "../../utils/calc";

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

const showStatus = ref(false);
const detailCardRef = ref<HTMLElement | null>(null);

const dataTypeChannelType = ref("");
const dataTypeChannel = ref([]);

const cardList: any = ref([]);

// 获取数据
const incomeData = inject<any>("incomeData");
// 监听赋值
watch(
  () => incomeData.value,
  () => {
    if (
      incomeData.value &&
      incomeData.value.projectProgressDataDetail &&
      incomeData.value.projectProgressDataDetail.length === 2
    ) {
      cardList.value = incomeData.value.projectProgressDataDetail;
    }
  }
);

const dataMap = computed(() => {
  const map = new Map();
  // 预先建立索引：key = "timerange-channelName"
  cardList.value.forEach((rangeData, rangeIndex) => {
    rangeData.forEach(item => {
      map.set(`${rangeIndex}-${item.name}`, item);
    });
  });
  return map;
});

// 在数据中获取想要的值
const getDataForCardList = (channel: string, timerange: number) => {
  return dataMap.value.get(`${timerange}-${channel}`) || null;
};

// 通用格式化函数，支持任意字段
const formatField = (channel: string, timerange: number, field: string) => {
  const data = getDataForCardList(channel, timerange);
  if (!data || data[field] === null || data[field] === undefined) {
    return "";
  }
  return formatIncomeNumber(data[field]);
};

const initDetailCard = (type: string) => {
  dataTypeChannelType.value = type;
  if (type === "全渠道") {
    dataTypeChannel.value = DATA_TYPE_CHANNEL;
  } else if (type === "线上") {
    dataTypeChannel.value = DATA_TYPE_CHANNEL.filter(
      item => item.type === "线上"
    );
  } else if (type === "线下") {
    dataTypeChannel.value = DATA_TYPE_CHANNEL.filter(
      item => item.type === "线下"
    );
  }
  showStatus.value = true;

  nextTick(() => {
    setTimeout(() => {
      detailCardRef.value?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  });
};

defineExpose({
  initDetailCard
});
</script>

<template>
  <div ref="detailCardRef">
    <el-card v-if="showStatus" shadow="never" style="border-radius: 10px">
      <div class="text-[#0a0a0a] text-sm px-4 mb-2">
        {{ dataTypeChannelType }}
      </div>

      <el-collapse>
        <el-collapse-item
          v-for="channelItem in dataTypeChannel"
          :key="channelItem.name"
          :name="channelItem.name"
        >
          <template #title>
            <div class="flex justify-between items-center px-4">
              <div class="text-[#0a0a0a] font-bold">{{ channelItem.name }}</div>
              <el-tag
                :type="channelItem.type === '线上' ? 'primary' : 'warning'"
                size="small"
              >
                {{ channelItem.type }}
              </el-tag>
            </div>
          </template>

          <div class="px-4 py-2 bg-[#f7f8fa]">
            <!-- 月份年度信息 -->
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
                <div
                  class="text-base font-medium text-[var(--dash-text-primary)] ml-2"
                >
                  {{ timerange }}
                </div>
              </div>

              <!-- ### 需求：本月没有对比信息 ### -->
              <div v-for="info in DATA_TYPE_INFO" :key="info" class="mb-2">
                <div
                  v-if="!(info === '对比信息' && timerange === '本月')"
                  class="text-sm font-medium text-[var(--dash-text-secondary)] ml-2"
                >
                  {{ info }}
                </div>

                <!-- 目标达成 -->
                <div v-if="info === '目标达成'" class="ml-2">
                  <div>
                    <Progress
                      :segments="[
                        {
                          percentage: 100,
                          status: 'primary',
                          text: formatField(
                            channelItem.name,
                            timerangeIndex,
                            'income'
                          )
                        }
                      ]"
                      height="25px"
                    />
                  </div>
                  <div v-if="timerange === '本月'" class="mt-2">
                    <div
                      class="text-xs font-medium text-[var(--dash-text-secondary)] mt-3"
                    >
                      *周数据为堆叠图，按比例堆叠
                    </div>
                    <Progress
                      :segments="
                        getDataForCardList(
                          channelItem.name,
                          timerangeIndex
                        )?.allIncomeDetail.map(item => ({
                          percentage:
                            divide(
                              item.income,
                              getDataForCardList(
                                channelItem.name,
                                timerangeIndex
                              )?.income
                            ) * 100,
                          status: 'week_' + item.week,
                          text: item.week + '周',
                          value: formatIncomeNumber(item.income)
                        }))
                      "
                      height="40px"
                    />
                  </div>
                </div>

                <!-- 进度 -->
                <div v-if="info === '进度'" class="ml-2">
                  <div>
                    <Progress
                      :segments="[
                        {
                          percentage: _.floor(
                            divide(
                              getDataForCardList(
                                channelItem.name,
                                timerangeIndex
                              )?.income,
                              getDataForCardList(
                                channelItem.name,
                                timerangeIndex
                              )?.target
                            ) * 100
                          ),
                          status: 'primary',
                          text:
                            _.floor(
                              divide(
                                getDataForCardList(
                                  channelItem.name,
                                  timerangeIndex
                                )?.income,
                                getDataForCardList(
                                  channelItem.name,
                                  timerangeIndex
                                )?.target
                              ) * 100
                            ) + '%'
                        }
                      ]"
                      height="25px"
                    />
                    <div
                      class="mt-2"
                      :style="{
                        width:
                          getDataForCardList(channelItem.name, timerangeIndex)
                            ?.expect + '%'
                      }"
                    >
                      <Progress
                        :segments="[
                          {
                            percentage: 100,
                            status: 'warning',
                            text:
                              getDataForCardList(
                                channelItem.name,
                                timerangeIndex
                              )?.expect + '%'
                          }
                        ]"
                        height="25px"
                      />
                    </div>
                  </div>

                  <!--  -->
                </div>

                <!-- 对比 -->
                <div
                  v-if="info === '对比信息' && timerange === '年度'"
                  class="ml-2"
                >
                  <div
                    class="flex items-center text-sm font-medium text-[var(--dash-text-secondary)]"
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

            <!-- 整体信息 -->
            <div>
              <div
                class="text-base font-medium text-[var(--dash-text-primary)]"
              >
                整体信息
              </div>

              <!-- 图表 -->
              <div class="ml-2">
                <MonthlyData
                  :id="getDataForCardList(channelItem.name, 0)?.name"
                  :dataList="
                    getDataForCardList(channelItem.name, 0)?.monthIncomeList
                  "
                  :yearOverYearGrowthList="
                    getDataForCardList(channelItem.name, 0)
                      ?.yearOverYearGrowthList
                  "
                  :monthOverMonthGrowthList="
                    getDataForCardList(channelItem.name, 0)
                      ?.monthOverMonthGrowthList
                  "
                />
              </div>

              <div>
                <div
                  class="text-sm font-medium text-[var(--dash-text-secondary)] ml-2"
                >
                  <span>累计完成：</span>
                  <span class="text-[var(--dash-green)]"
                    >{{
                      _.floor(
                        divide(
                          getDataForCardList(channelItem.name, 0)?.yearIncome,
                          getDataForCardList(channelItem.name, 0)?.yearTarget
                        ) * 100
                      )
                    }}%
                  </span>
                </div>

                <div class="ml-2">
                  <div>
                    <Progress
                      :segments="[
                        {
                          percentage:
                            divide(
                              getDataForCardList(channelItem.name, 0)
                                ?.yearIncome,
                              getDataForCardList(channelItem.name, 0)
                                ?.yearTarget
                            ) * 100,
                          status: 'success',
                          text: formatField(channelItem.name, 0, 'yearIncome')
                        }
                      ]"
                      height="25px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
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
</style>
