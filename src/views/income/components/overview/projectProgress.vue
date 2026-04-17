<script setup lang="ts">
import Progress from "../common/progress/index.vue";
import ProgressPro from "../common/progressPro/index.vue";
import LightCircle from "../common/lightCircle/index.vue";
import { computed, inject, ref, watch } from "vue";
import { divide } from "@/views/incomePro/utils/calc";
import { MoreFilled } from "@element-plus/icons-vue";
import _, { set } from "lodash";
import MdiInternet from "~icons/mdi/internet";
import IcOutlineCloud from "~icons/ic/outline-cloud";
import MdiShopOutline from "~icons/mdi/shop-outline";
import DetailCard from "../detailCard/index.vue";

const selectedChannel = ref(null);

const DATA_TYPE_CHANNEL = ["全渠道", "线上", "线下"];
const CHANNEL_ICON = {
  全渠道: {
    icon: MdiInternet,
    iconColor: "#475569",
    bgColor: "#F1F5F9"
  },
  线上: {
    icon: IcOutlineCloud,
    iconColor: "#0050D4",
    bgColor: "#EFF6FF"
  },
  线下: {
    icon: MdiShopOutline,
    iconColor: "#815100",
    bgColor: "#FFF7ED"
  }
};
const DATA_TYPE_TIMERANGE = ["本月", "年度"];
const dataList: any = ref([
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
]);

// 获取数据
const incomeData = inject<any>("incomeData");
// 监听赋值
watch(
  () => incomeData.value,
  () => {
    if (
      incomeData.value &&
      incomeData.value.projectProgressData &&
      incomeData.value.projectProgressData.length === 2
    ) {
      dataList.value = incomeData.value.projectProgressData;
    }
  }
);

const dataMap = computed(() => {
  const map = new Map();
  dataList.value.forEach((rangeData: any[], rangeIndex: number) => {
    rangeData.forEach(item => {
      map.set(`${rangeIndex}-${item.name}`, item);
    });
  });
  return map;
});

const getChannelData = (channel: string, timerange: number) => {
  return dataMap.value.get(`${timerange}-${channel}`) || null;
};

// 打开详情卡片
const initDetailCard = (channel: string) => {
  // console.log("点击详情卡片");
  event.stopPropagation();

  if (selectedChannel.value === channel) {
    selectedChannel.value = null;
    return;
  }

  selectedChannel.value = channel;

  setTimeout(() => {
    document
      .getElementById("project-progress-section" + channel)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  }, 300);
};
</script>

<template>
  <div>
    <div v-for="channel in DATA_TYPE_CHANNEL" :key="channel" class="mb-4">
      <div
        class="peidi-income-overview-project-progress-card"
        :id="'project-progress-section' + channel"
      >
        <div @click="initDetailCard(channel)">
          <!-- 内容区域 -->
          <div class="flex items-center mb-2">
            <div>
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center"
                :style="{ backgroundColor: CHANNEL_ICON[channel].bgColor }"
              >
                <IconifyIconOffline
                  :icon="CHANNEL_ICON[channel].icon"
                  width="18"
                  height="18"
                  :color="CHANNEL_ICON[channel].iconColor"
                />
              </div>
            </div>
            <div class="text-sm font-bold text-[var(--primary-color)] ml-1">
              {{ channel }}
            </div>
          </div>

          <div
            v-for="(timerange, index) in DATA_TYPE_TIMERANGE"
            :key="timerange"
            @click="initDetailCard(channel)"
          >
            <div class="flex items-center justify-between ml-2">
              <div class="flex items-center">
                <LightCircle :status="getChannelData(channel, index)?.status" />
                <div
                  class="text-sm font-medium text-[var(--dash-text-secondary)] ml-2"
                >
                  {{ timerange }}
                </div>
              </div>
              <!-- <div class="text-sm text-[var(--dash-text-dim)]">
              <span class="font-semibold text-[var(--dash-blue)]">
                {{
                  _.floor(
                    divide(
                      getChannelData(channel, index)?.income,
                      getChannelData(channel, index)?.target
                    ) * 100
                  )
                }}%
              </span>
              <span class="ml-2">
                {{ getChannelData(channel, index)?.target.toLocaleString() }}
              </span>
            </div> -->
            </div>

            <div class="ml-2 mb-2">
              <!-- <Progress
              :segments="[
                {
                  percentage: Math.min(
                    divide(
                      getChannelData(channel, index)?.income,
                      getChannelData(channel, index)?.target
                    ) * 100,
                    100
                  ),
                  status: 'primary',
                  text: _.floor(
                    getChannelData(channel, index)?.income
                  ).toLocaleString()
                }
              ]"
              height="25px"
            /> -->
              <div class="mt-2">
                <ProgressPro
                  :title="`达成：${_.floor(
                    getChannelData(channel, index)?.income
                  ).toLocaleString()}`"
                  :percentage="
                    _.floor(
                      divide(
                        getChannelData(channel, index)?.income,
                        getChannelData(channel, index)?.target
                      ) * 100
                    )
                  "
                  :gradient-colors="['#003EA8', '#B4C5FF']"
                  :percentageColor="'#003EA8'"
                  animated
                />
              </div>
              <!-- <div
              class="mt-2"
              :style="{
                width: getChannelData(channel, index)?.expect + '%'
              }"
            >
              <Progress
                :segments="[
                  {
                    percentage: 100,
                    status: 'warning',
                    text: getChannelData(channel, index)?.expect + '%'
                  }
                ]"
                height="25px"
              />
            </div> -->
              <div class="mt-2">
                <ProgressPro
                  :title="`目标：${getChannelData(channel, index)?.target.toLocaleString()}`"
                  :percentage="getChannelData(channel, index)?.expect"
                  :gradient-colors="['#653E00', '#FFB95F']"
                  :percentageColor="'#653E00'"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- 详情区域 -->
        <div>
          <DetailCard v-if="selectedChannel === channel" :channel="channel" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-income-overview-project-progress-card {
  background-color: transparent;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  border-top-color: #e8e8e8;
  border-right-color: #e8e8e8;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.01),
    0 2px 4px -1px rgba(0, 0, 0, 0.05);

  padding: 12px;
}
</style>
