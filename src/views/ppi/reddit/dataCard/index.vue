<script setup lang="ts">
import RiDatabase2Line from "~icons/ri/database-2-line";

// props
defineProps({
  title: {
    type: String,
    default: ""
  },
  icon: {
    type: Object || null,
    default: null
  },
  value: {
    type: String,
    default: ""
  },
  text: {
    type: String,
    default: ""
  },
  style: {
    type: Object,
    default: () => ({ width: "300px" })
  }
});
</script>

<template>
  <el-card :style="style" shadow="never">
    <div class="flex items-center justify-between">
      <div class="text-[16px] font-bold text-[#71717a]">{{ title }}</div>
      <div v-if="icon">
        <IconifyIconOffline
          :icon="icon || RiDatabase2Line"
          class="w-[20px] h-[20px] text-[#71717a]"
        />
      </div>
    </div>
    <div class="mt-[30px]">
      <p class="text-[30px] font-bold text-[#09090B]">
        {{ value }}
      </p>
    </div>
    <div>
      <p class="text-[14px] text-[#71717a]">{{ text }}</p>
    </div>
  </el-card>
</template>
