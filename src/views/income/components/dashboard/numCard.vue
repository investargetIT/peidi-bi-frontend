<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  text: {
    type: String,
    default: ""
  },
  titleColor: {
    type: String,
    default: "#000"
  }
});
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div class="px-2">
        <div class="text-xs font-bold" :style="{ color: titleColor }">
          {{ title }}
        </div>
        <div class="text-base font-bold">{{ text }}</div>
      </div>
    </el-card>
  </div>
</template>
