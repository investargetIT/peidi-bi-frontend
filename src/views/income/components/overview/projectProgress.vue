<script setup lang="ts">
import Progress from "../progress/index.vue";

const dataList = [
  {
    name: "全渠道"
  },
  {
    name: "线上"
  },
  {
    name: "线下"
  }
];
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="text-base font-bold">本月进度</div>
      <div class="text-sm">
        <span class="font-semibold text-[#2673DE]">80% </span>目标进度
      </div>
    </div>

    <div v-for="item in dataList" :key="item.name">
      <div class="flex items-center justify-between mt-6 mb-2">
        <div class="flex items-center text-sm">
          <div class="w-3 h-3 rounded-full bg-green-600 mr-1"></div>
          <div>{{ item.name }}</div>
        </div>
        <div class="text-sm">
          <span class="font-semibold text-[#2673DE]">80% </span>438
        </div>
      </div>

      <div>
        <Progress
          :segments="[{ percentage: 50, color: '#4472C4', text: '350' }]"
          height="25px"
        />
        <div class="w-[80%] mt-2">
          <Progress
            :segments="[{ percentage: 100, color: '#ED7D31', text: '80%' }]"
            height="25px"
          />
        </div>
      </div>
    </div>
  </div>
</template>
