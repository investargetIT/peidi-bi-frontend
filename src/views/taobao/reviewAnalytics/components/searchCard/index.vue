<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import EpSearch from "~icons/ep/search";
import { STAR_ICON } from "@/views/taobao/reviewAnalytics/svg/index";
import { ElMessage } from "element-plus";

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true
  },
  handleSearch: {
    type: Function,
    required: true
  }
});

const TAGS = ["质量问题", "物流速度", "好评趋势", "差评分析"];

const searchInput = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);

const handleClick = () => {
  if (!searchInput.value) {
    ElMessage.warning("请输入搜索关键词");
    return;
  }
  props.handleSearch(searchInput.value);
};

const handleEnterKey = (e: KeyboardEvent) => {
  if (props.isLoading) {
    return;
  }
  handleClick();
};

const handleClickTag = (tag: string) => {
  searchInput.value = tag;
  // 焦点到输入框
  searchInputRef.value?.focus();
};
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
        ref="searchInputRef"
        v-model="searchInput"
        placeholder="输入关键词或问题，例如：质量问题的评论、好评率趋势..."
        :prefix-icon="EpSearch"
        @keyup.enter="handleEnterKey"
      />
      <el-button
        type="primary"
        :icon="EpSearch"
        :loading="isLoading"
        @click="handleClick"
        >搜索</el-button
      >
    </div>

    <div class="flex items-center gap-[10px] mt-[12px]">
      <div
        v-for="tag in TAGS"
        :key="tag"
        class="peidi-taobao-reviewAnalytics-searchCard-tag text-[14px] text-[#0a0a0a]"
        @click="handleClickTag(tag)"
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

:deep(.el-input__inner) {
  color: oklch(15% 0 0deg);
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
  cursor: pointer;
  background-color: #f2f2f2;
  border-radius: 20px;

  &:hover {
    background-color: #e6e6e6;
  }
}
</style>
