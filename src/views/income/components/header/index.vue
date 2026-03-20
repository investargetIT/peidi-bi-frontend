<script setup lang="ts">
import LightCircle from "../common/lightCircle/index.vue";
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <div>
        <div class="text-xl font-bold text-[var(--primary-color)]">
          业绩实时监控
        </div>
        <div class="text-xs text-[var(--secondary-color)]">
          Performance Real-time Monitoring
        </div>
      </div>

      <div>
        <div class="rounded-full bg-[#C9F3E3] px-3 py-2 flex items-center">
          <LightCircle status="success" />
          <div class="text-xs font-bold text-[#00593C] ml-2 tracking-wider">LIVE</div>
        </div>
      </div>
    </div>
  </div>
</template>
