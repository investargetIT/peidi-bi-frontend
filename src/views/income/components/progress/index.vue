<script setup lang="ts">
import { computed } from "vue";

interface ProgressSegment {
  percentage: number;
  color: string;
  text?: string;
}

const props = withDefaults(
  defineProps<{
    segments: ProgressSegment[];
    height?: string;
    borderRadius?: string;
  }>(),
  {
    height: "30px",
    borderRadius: "15px"
  }
);

const displaySegments = computed(() => {
  return props.segments.map((segment, index) => {
    const prevPercentage = props.segments
      .slice(0, index)
      .reduce((sum, s) => sum + s.percentage, 0);
    return {
      ...segment,
      left: `${prevPercentage}%`,
      width: `${segment.percentage}%`
    };
  });
});

const getSegmentBorderRadius = (index: number, total: number) => {
  const br = props.borderRadius;
  if (total === 1) {
    return br;
  } else if (index === 0) {
    return `${br} 0 0 ${br}`;
  } else if (index === total - 1) {
    return `0 ${br} ${br} 0`;
  }
  return "0";
};
</script>

<template>
  <div class="peidi-progress-bar" :style="{ height, borderRadius }">
    <div
      v-for="(segment, index) in displaySegments"
      :key="index"
      class="peidi-progress-segment"
      :style="{
        left: segment.left,
        width: segment.width,
        backgroundColor: segment.color,
        borderRadius: getSegmentBorderRadius(index, displaySegments.length)
      }"
    >
      <span v-if="segment.text" class="peidi-segment-text">{{
        segment.text
      }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-progress-bar {
  position: relative;
  width: 100%;
  background-color: #f0f0f0;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.peidi-progress-segment {
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(1.1);
  }

  .peidi-segment-text {
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 4px;
  }
}
</style>
