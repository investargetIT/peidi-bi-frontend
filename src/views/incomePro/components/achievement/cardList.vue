<script setup lang="ts">
import { inject, onMounted, ref, watch, nextTick } from "vue";
import LightCircle from "../common/lightCircle/index.vue";
import Progress from "../common/progress/index.vue";
import MonthlyData from "./monthlyData.vue";
import _ from "lodash";
import { divide } from "../../utils/calc";

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
  },
  {
    deep: true,
    immediate: true
  }
);

// 在数据中获取想要的值
const getDataForCardList = (channel: string, timerange: number) => {
  if (cardList.value[timerange]) {
    return cardList.value[timerange].find(item => item.name === channel);
  }
  return null;
};

//#region 锚点相关
const anchorRef = ref(null);
const containerRef = ref(null);
const handleAnchorClick = (e: MouseEvent) => {
  e.preventDefault();
};
// 更新位置
const updateAnchorPosition = (href: string) => {
  anchorRef.value?.scrollTo(href);
};
//#endregion

defineExpose({ updateAnchorPosition });

// onMounted(() => {
//   setTimeout(() => {
//     anchorRef.value?.scrollTo(`#哈宠`);
//   }, 1000);
// });
</script>

<template>
  <div>
    <div class="mb-2">
      <el-scrollbar>
        <el-anchor
          ref="anchorRef"
          :container="containerRef"
          direction="horizontal"
          type="default"
          :offset="30"
          style="
            display: flex;
            width: fit-content;
            padding: 3px 10px;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
            border: 1px solid #dfe3e8;
            border-radius: 10px;
          "
          @click="handleAnchorClick"
        >
          <el-anchor-link
            v-for="channelItem in DATA_TYPE_CHANNEL"
            :key="channelItem.name"
            :href="`#${channelItem.name}`"
            :title="channelItem.name"
          />
        </el-anchor>
      </el-scrollbar>
    </div>

    <div
      ref="containerRef"
      style="height: calc(100vh - 90px); overflow-y: auto"
      class="peidi-incomePro-achievement-scrollCard"
    >
      <div
        v-for="channelItem in DATA_TYPE_CHANNEL"
        :id="channelItem.name"
        :key="channelItem.name"
        class="mb-4"
      >
        <el-card shadow="never" style="border-radius: 10px">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="text-[#0a0a0a] font-bold">{{ channelItem.name }}</div>
              <el-tag
                :type="channelItem.type === '线上' ? 'primary' : 'warning'"
                size="small"
              >
                {{ channelItem.type }}
              </el-tag>
            </div>
          </template>

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

            <div v-for="info in DATA_TYPE_INFO" :key="info" class="mb-2">
              <div
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
                        text: _.floor(
                          getDataForCardList(channelItem.name, timerangeIndex)
                            ?.income
                        ).toLocaleString()
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
                            getDataForCardList(channelItem.name, timerangeIndex)
                              ?.income
                          ) * 100,
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

              <!-- 进度 -->
              <div v-if="info === '进度'" class="ml-2">
                <div>
                  <Progress
                    :segments="[
                      {
                        percentage: _.floor(
                          divide(
                            getDataForCardList(channelItem.name, timerangeIndex)
                              ?.income,
                            getDataForCardList(channelItem.name, timerangeIndex)
                              ?.target
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
                            getDataForCardList(channelItem.name, timerangeIndex)
                              ?.expect + '%'
                        }
                      ]"
                      height="25px"
                    />
                  </div>
                </div>

                <!--  -->
              </div>

              <!-- 对比 -->
              <div v-if="info === '对比信息'" class="ml-2">
                <div
                  class="flex items-center text-sm font-medium text-[var(--dash-text-secondary)]"
                >
                  <div v-if="timerange === '本月'" class="mr-2">
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
                  <div>
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
                            getDataForCardList(channelItem.name, 0)?.yearIncome,
                            getDataForCardList(channelItem.name, 0)?.yearTarget
                          ) * 100,
                        status: 'success',
                        text: _.floor(
                          getDataForCardList(channelItem.name, 0)?.yearIncome
                        ).toLocaleString()
                      }
                    ]"
                    height="25px"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.el-card__header) {
  padding-top: 10px;
  padding-bottom: 10px;
}

::v-deep(.el-scrollbar__bar.is-horizontal > div) {
  width: 0;
  height: 0;
}

.peidi-incomePro-achievement-scrollCard {
  scrollbar-color: rgb(0 0 0 / 20%) transparent;

  /* Firefox */
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(0 0 0 / 20%);
    border-radius: 3px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgb(0 0 0 / 30%);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
}
</style>
