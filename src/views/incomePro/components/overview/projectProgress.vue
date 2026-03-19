<script setup lang="ts">
import Progress from "../common/progress/index.vue";
import LightCircle from "../common/lightCircle/index.vue";
import { computed, inject, ref, watch } from "vue";
import { divide } from "@/views/incomePro/utils/calc";
import { MoreFilled } from "@element-plus/icons-vue";
import _ from "lodash";

const DATA_TYPE_CHANNEL = ["全渠道", "线上", "线下"];
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

// 在数据中获取想要的值
const getDataForDataList = (channel: string, timerange: number) => {
  if (dataList.value[timerange]) {
    return dataList.value[timerange].find(item => item.name === channel);
  }
  return null;
};

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

// 详情页
const achievementRef = inject<any>("achievementRef");
// 打开详情页
const handleOpenDetail = (channel: string) => {
  let href = null;
  if (channel === "全渠道") {
    href = "#天猫";
  } else if (channel === "线上") {
    href = "#天猫";
  } else if (channel === "线下") {
    href = "#销售一组";
  }

  if (achievementRef.value) {
    if (href) {
      achievementRef.value?.openDrawer(href);
    } else {
      achievementRef.value?.openDrawer();
    }
  }
};

// 详情卡片
const detailCardRef = inject<any>("detailCardRef");
// 打开详情卡片
const initDetailCard = (type: string) => {
  detailCardRef.value?.initDetailCard(type);
};
</script>

<template>
  <div>
    <div v-for="channel in DATA_TYPE_CHANNEL" :key="channel">
      <div class="flex items-center justify-between mb-1">
        <div class="text-sm font-bold text-[var(--dash-text-primary)]">
          {{ channel }}
        </div>
        <el-button
          v-show="false"
          type="primary"
          size="small"
          :icon="MoreFilled"
          text
          @click="handleOpenDetail(channel)"
        />
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
          <div class="text-sm text-[var(--dash-text-dim)]">
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
          </div>
        </div>

        <div class="ml-2 mb-2">
          <Progress
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
          />
          <div
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
