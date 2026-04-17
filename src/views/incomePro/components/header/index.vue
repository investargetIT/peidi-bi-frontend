<script setup lang="ts">
import { getLastSunday } from "../../utils/config";
import LightCircle from "../common/lightCircle/index.vue";

const props = defineProps({
  // 默认日期
  DEFAULT_DATE: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="peidi-incomePro-header-accent">
        <div
          class="text-[var(--dash-blue)] text-[10px] font-semibold uppercase tracking-[0.2em]"
        >
          SALES ANALYTICS COMMAND CENTER
        </div>
        <div class="text-[var(--dash-text-primary)] text-3xl font-bold">
          业绩每周监控
        </div>
      </div>

      <div
        class="text-[var(--dash-text-secondary)] text-xs border-1 border-gray-30 bg-white p-2 rounded-xl flex items-center gap-2 px-4 py-2.5 ml-auto"
      >
        <LightCircle status="success" />
        更新数据截止：{{ props.DEFAULT_DATE }}
        <!-- 更新数据截止：{{ getLastSunday() }} -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-incomePro-header-accent {
  position: relative;

  &::after {
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 40px;
    height: 2px;
    content: "";
    background: linear-gradient(90deg, #06b6d4, #0000);
    border-radius: 1px;
  }
}
</style>
