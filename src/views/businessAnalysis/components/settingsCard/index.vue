<script setup lang="ts">
import { ref } from "vue";
import { ReSegmented } from "@/components/ReSegmented";
import type { OptionsType } from "@/components/ReSegmented/src/type";
import TeamConfig from "./team-config/index.vue";
import TeamIncomeTarget from "./team-income-target/index.vue";

const activeSegment = ref(0);

const options: OptionsType[] = [
  { label: "团队配置", value: "team-config" },
  { label: "团队收入目标", value: "team-income-target" }
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
      <TeamConfig v-if="activeSegment === 0" />
      <TeamIncomeTarget v-if="activeSegment === 1" />
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
