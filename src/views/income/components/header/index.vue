<script setup lang="ts"></script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <div>
        <div class="text-[#2673DE] text-xs">销售数据驾驶舱</div>
        <div class="text-[#0a0a0a] text-2xl font-bold">业绩实时监控</div>
      </div>

      <div
        class="text-[#0a0a0a] text-xs border-1 border-gray-30 bg-white p-2 rounded-md flex items-center gap-2"
      >
        <div
          class="blink-dot w-2 h-2 bg-green-700 rounded-full animate-pulse"
        ></div>
        数据实时更新
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.blink-dot {
  animation: blink 5s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
