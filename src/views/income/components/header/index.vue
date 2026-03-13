<script setup lang="ts">
import LightCircle from "../lightCircle/index.vue";
</script>

<template>
  <div>
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="peidi-income-header-accent">
        <div
          class="text-[var(--dash-blue)] text-[10px] font-semibold uppercase tracking-[0.2em]"
        >
          SALES ANALYTICS COMMAND CENTER
        </div>
        <div class="text-[var(--dash-text-primary)] text-3xl font-bold">
          业绩实时监控
        </div>
      </div>

      <div
        class="text-[var(--dash-text-secondary)] text-xs border-1 border-gray-30 bg-white p-2 rounded-xl flex items-center gap-2 px-4 py-2.5"
      >
        <LightCircle status="success" />
        数据实时更新
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-income-header-accent {
  position: relative;

  &::after {
    content: "";
    background: linear-gradient(90deg, #06b6d4, #0000);
    border-radius: 1px;
    width: 40px;
    height: 2px;
    position: absolute;
    bottom: -5px;
    left: 0;
  }
}
</style>
