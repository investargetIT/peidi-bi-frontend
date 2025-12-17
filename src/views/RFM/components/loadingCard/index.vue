<script setup lang="ts">
import StreamlinePlumpLoadingCircleSolid from "~icons/streamline-plump/loading-circle-solid";
import { onMounted, onUnmounted, ref } from "vue";

const loadingText = ref("...");
const loadingTextTimer = ref<any>(null);

onMounted(() => {
  loadingTextTimer.value = setInterval(() => {
    if (loadingText.value.length > 3) {
      loadingText.value = "";
    }
    loadingText.value += ".";
  }, 1000);
});

onUnmounted(() => {
  clearInterval(loadingTextTimer.value);
});
</script>

<template>
  <div class="peidi-rfm-loading-card">
    <div class="peidi-rfm-loading-card-content">
      <StreamlinePlumpLoadingCircleSolid
        class="peidi-rfm-loading-card-icon-spin"
      />
      <span>数据云端计算中{{ loadingText }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>

@keyframes loading-card-icon-spin {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.peidi-rfm-loading-card-content {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #0a0a0a;
}
// 旋转动画
.peidi-rfm-loading-card-icon-spin {
  font-size: 30px;
  animation: loading-card-icon-spin 1s linear infinite;
}
</style>
