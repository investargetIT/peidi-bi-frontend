<script setup lang="ts">
import { ref } from "vue";
import EpSearch from "~icons/ep/search";
import { STAR_ICON } from "@/views/taobao/reviewAnalytics/svg/index";

const TAGS = ["质量问题", "物流速度", "好评趋势", "差评分析"];

const searchInput = ref("");
</script>

<template>
  <el-card style="border-radius: 10px">
    <div class="flex items-center h-[24px]">
      <div
        class="lucide lucide-sparkles text-primary w-[24px] h-[24px]"
        v-html="STAR_ICON"
      />
      <div class="font-bold text-[18px] text-[#0a0a0a] ml-[5px]">
        AI智能检索
      </div>
    </div>

    <div class="flex items-center gap-[10px] mt-[20px]">
      <el-input
        v-model="searchInput"
        placeholder="输入关键词或问题，例如：质量问题的评论、好评率趋势..."
        :prefix-icon="EpSearch"
      />
      <el-button type="primary" :icon="EpSearch">搜索</el-button>
    </div>

    <div class="flex items-center gap-[10px] mt-[12px]">
      <div
        v-for="tag in TAGS"
        :key="tag"
        class="peidi-taobao-reviewAnalytics-searchCard-tag text-[14px] text-[#0a0a0a]"
      >
        {{ tag }}
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  background-color: #eee;
}

:deep(.el-input__inner::placeholder) {
  color: oklch(45% 0 0deg);
}

:deep(.el-input__prefix-inner) {
  color: oklch(45% 0 0deg);
}

.peidi-taobao-reviewAnalytics-searchCard-tag {
  padding: 5px 12px;
  color: oklch(15% 0 0deg);
  background-color: #f2f2f2;
  border-radius: 20px;
}
</style>
