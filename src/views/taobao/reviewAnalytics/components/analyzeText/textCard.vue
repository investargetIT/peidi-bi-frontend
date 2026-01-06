<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  contents: {
    type: Array,
    required: true
  },
  iconHTML: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const statusClass = ref({
  bg: "bg-green-50",
  border: "border-green-200",
  title: "text-green-800",
  icon: "bg-green-600",
  content: "text-green-900"
});

watch(
  () => props.status,
  newStatus => {
    if (newStatus === "advantage") {
      statusClass.value = {
        bg: "bg-green-50",
        border: "border-green-200",
        title: "text-green-800",
        icon: "bg-green-600",
        content: "text-green-900"
      };
    } else if (newStatus === "disadvantage") {
      statusClass.value = {
        bg: "bg-red-50",
        border: "border-red-200",
        title: "text-red-800",
        icon: "bg-red-600",
        content: "text-red-900"
      };
    } else if (newStatus === "suggestion") {
      statusClass.value = {
        bg: "bg-blue-50",
        border: "border-blue-200",
        title: "text-blue-800",
        icon: "bg-blue-600",
        content: "text-blue-900"
      };
    }
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div class="peidi-taobao-reviewAnalytics-textCard-container h-full">
    <el-card
      style="height: 100%; background-color: transparent; border-radius: 10px"
    >
      <div
        class="flex flex-col gap-6 rounded-xl border py-6 shadow-sm h-full"
        :class="`${statusClass.bg} ${statusClass.border}`"
      >
        <div
          class="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 [.border-b]:pb-6 pb-3"
        >
          <div
            class="font-semibold text-lg flex items-center gap-2"
            :class="`${statusClass.title}`"
          >
            <div v-html="iconHTML" />
            {{ title }}
          </div>
        </div>
        <div class="px-6 space-y-2">
          <div
            v-for="(item, index) in contents"
            :key="index"
            class="flex items-start gap-2 text-sm"
          >
            <div
              class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              :class="`${statusClass.icon}`"
            />
            <p :class="`${statusClass.content}`">
              {{ item }}
            </p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.peidi-taobao-reviewAnalytics-textCard-container {
  :deep(.el-card__body) {
    padding: 0;
  }
}
</style>
