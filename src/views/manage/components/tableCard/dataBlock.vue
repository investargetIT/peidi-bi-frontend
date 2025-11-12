<script setup lang="ts">
import { defineProps } from "vue";

//props
const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  value: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "#000"
  },
  style: {
    type: Object,
    default: () => ({ width: "150px" })
  }
});
</script>

<template>
  <el-card
    shadow="never"
    :body-style="{ backgroundColor: '#f9fafb' }"
    :style="{ ...style, border: '0px' }"
  >
    <div class="text-[24px] font-bold" :style="`color: ${color}`">
      {{ value }}
    </div>
    <div class="text-[14px] text-[#71717a]">{{ title }}</div>
  </el-card>
</template>
