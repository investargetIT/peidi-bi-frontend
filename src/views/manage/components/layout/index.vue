<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import MaterialSymbolsFullscreenRounded from "~icons/material-symbols/fullscreen-rounded";

const rightLoading = ref(true);
const rightLoadingTimer = ref();

onMounted(() => {
  // 来解决右侧内容区加载时的闪烁问题
  rightLoadingTimer.value = setTimeout(() => {
    rightLoading.value = false;
  }, 1000);
});

onUnmounted(() => {
  clearTimeout(rightLoadingTimer.value);
});

const isFullscreen = ref(false);
// 宽度切换事件 将右侧内容区宽度切换为100%
const handleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};
</script>

<template>
  <div class="peidi-manage-layout-container">
    <!-- 左侧内容区 -->
    <div v-show="!isFullscreen" class="peidi-manage-layout-left">
      <slot name="left" />
    </div>
    <!-- 右侧内容区 -->
    <div
      v-if="false"
      :class="[
        'peidi-manage-layout-right',
        { 'w-[25%]': !isFullscreen, 'w-[85%]': isFullscreen }
      ]"
    >
      <!-- 右侧内容区加载中 -->
      <div
        v-if="rightLoading"
        v-loading="rightLoading"
        class="h-[100px]"
        element-loading-background="transparent"
      />
      <!-- 右侧内容区加载完成 -->
      <div v-if="!rightLoading" class="peidi-manage-layout-right-content">
        <el-card shadow="never" class="h-[90vh]">
          <el-scrollbar height="100%">
            <slot name="right" />
          </el-scrollbar>
          <MaterialSymbolsFullscreenRounded
            class="absolute top-[8px] right-[16px] w-[24px] h-[24px] cursor-pointer"
            @click="handleFullscreen"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-manage-layout-container {
  display: flex;

  .peidi-manage-layout-left {
    // width: 70%; // 暂不展示右侧，左侧内容区占满整个宽度
    width: 100%;
    height: 100%;
  }

  .peidi-manage-layout-right {
    position: relative;
    // width: 25%;
    // width: 85%;
    height: 100%;
    padding-left: 20px;

    .peidi-manage-layout-right-content {
      position: fixed;
      width: inherit;
    }
  }
}
</style>
