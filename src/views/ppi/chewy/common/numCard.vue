<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  num: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <div class="leading-none font-semibold flex items-center gap-2 mb-2">
      <span v-if="num" class="text-2xl">{{ num }}</span>
      {{ title }}
    </div>

    <p class="text-sm text-[#71717a]">
      {{ desc }}
    </p>

    <slot />
  </el-card>
</template>
