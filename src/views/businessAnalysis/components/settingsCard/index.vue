<script setup lang="ts">
import { ref } from "vue";
import { ReSegmented } from "@/components/ReSegmented";
import type { OptionsType } from "@/components/ReSegmented/src/type";
import TeamIndicators from "./team-indicators/index.vue";
import ProductCategoryTree from "./product-category-tree/index.vue";
import CostCategoryGroup from "./cost-category-group/index.vue";
import CoreIndicators from "./core-indicators/index.vue";

const activeSegment = ref(0);

const options: OptionsType[] = [
  { label: "核心指标达成", value: "core-indicators" },
  { label: "团队指标达成", value: "team-indicators" },
  { label: "产品结构", value: "product-category-tree" },
  { label: "成本结构", value: "cost-category-group" }
];

const handleSegmentChange = ({ index, option }) => {
  console.log("切换到:", option.label);
};
</script>

<template>
  <div class="settings-card-wrapper">
    <div class="settings-card-header">
      <ReSegmented
        v-model="activeSegment"
        :options="options"
        block
        @change="handleSegmentChange"
      />
    </div>
    <div class="settings-card-content">
      <CoreIndicators v-if="activeSegment === 0" />
      <TeamIndicators v-if="activeSegment === 1" />
      <ProductCategoryTree v-if="activeSegment === 2" />
      <CostCategoryGroup v-if="activeSegment === 3" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-card-wrapper {
  width: 100%;

  .settings-card-header {
    margin-bottom: 20px;
  }
}
</style>
