<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  dashboardData: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <el-card shadow="never">
    <div class="text-[24px] font-bold text-[#09090B]">{{ props.title }}</div>
    <div class="text-[16px] text-[#52525B] mt-[10px]">
      {{ props.text }}
    </div>
    <el-divider />
    <div class="flex items-center flex-wrap">
      <div class="w-[33%]">
        <div class="text-[14px] text-[#52525B]">创建时间:</div>
        <!-- <div class="text-[14px] text-[#09090B]">2023年10月15日 16:00</div> -->
        <div class="text-[14px] text-[#09090B]">--</div>
      </div>
      <div class="w-[33%]">
        <div class="text-[14px] text-[#52525B]">更新时间:</div>
        <!-- <div class="text-[14px] text-[#09090B]">2023年11月20日 22:30</div> -->
        <div class="text-[14px] text-[#09090B]">
          {{ props.dashboardData?.lastUpdateTime || "--" }}
        </div>
      </div>
      <div class="w-[33%]">
        <div class="text-[14px] text-[#52525B]">数据量:</div>
        <!-- <div class="text-[14px] text-[#09090B]">156 条</div> -->
        <div class="text-[14px] text-[#09090B]">
          {{
            Number(props.dashboardData?.totalDataCount || 0).toLocaleString() ||
            "--"
          }}
        </div>
      </div>
    </div>
  </el-card>
</template>
