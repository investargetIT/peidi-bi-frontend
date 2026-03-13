<script setup lang="ts">
import { computed } from "vue";

interface ProgressSegment {
  percentage: number;
  status?: string;
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

const getBackground = (status: string) => {
  if (status === "primary") {
    return "linear-gradient(90deg, var(--dash-bar-gradient-start), var(--dash-bar-gradient-mid) 50%, var(--dash-bar-gradient-end))";
  }
  if (status === "warning") {
    return "linear-gradient(90deg, var(--dash-orange-gradient-start), var(--dash-orange-gradient-mid) 50%, var(--dash-orange-gradient-end))";
  }
  if (status === "success") {
    return "linear-gradient(90deg, var(--dash-cyan-gradient-start), var(--dash-cyan-gradient-mid) 50%, var(--dash-cyan-gradient-end))";
  }
  if (status === "week_1") {
    return "linear-gradient(90deg, #2c5aa0 0%, #4a90e2 50%, #6fb8ff)";
  }
  if (status === "week_2") {
    return "linear-gradient(90deg, #2e7d32 0%, #5cb85c 50%, #81c784)";
  }
  if (status === "week_3") {
    return "linear-gradient(90deg, #e65100 0%, #f0ad4e 50%, #ffcc80)";
  }
  if (status === "week_4") {
    return "linear-gradient(90deg, #0277bd 0%, #5bc0de 50%, #81d4fa)";
  }
  if (status === "week_5") {
    return "linear-gradient(90deg, #5c6bc0 0%, #b8daff 50%, #e8eaf6)";
  }
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
        background: getBackground(segment.status),
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
  min-width: 0;

  &:hover {
    filter: brightness(1.1);
  }

  .peidi-segment-text {
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    overflow: visible;
    text-overflow: clip;
    padding: 0 4px;
    max-width: 100%;
  }
}
</style>
