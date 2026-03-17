<script setup lang="ts">
import { computed } from "vue";

interface ProgressSegment {
  percentage: number;
  status?: string;
  text?: string;
  value?: number | string;
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

const hasProgress = computed(() => {
  return props.segments.some(segment => segment.percentage > 0);
});

const isSingleSegmentNotFull = computed(() => {
  return props.segments.length === 1 && props.segments[0].percentage < 100;
});

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
    <template v-if="hasProgress">
      <div
        v-for="(segment, index) in displaySegments"
        :key="index"
        class="peidi-progress-segment"
        :class="{ 'is-single-not-full': isSingleSegmentNotFull }"
        :style="{
          left: segment.left,
          width: segment.width,
          background: getBackground(segment.status),
          borderRadius: getSegmentBorderRadius(index, displaySegments.length)
        }"
      >
        <div
          v-if="segment.value !== undefined && segment.value !== null"
          class="peidi-segment-value"
        >
          {{ segment.value }}
        </div>
        <span v-if="segment.text" class="peidi-segment-text">{{
          segment.text
        }}</span>
      </div>
    </template>
    <template v-else>
      <span class="no-data-text">暂无进度</span>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.peidi-progress-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(to right, #777, #e8e8e8);
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 10%);
}

.peidi-progress-segment {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(1.1);
  }

  &.is-single-not-full {
    &::after {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: "";
      background: linear-gradient(
        90deg,
        rgb(255 255 255 / 0%) 0%,
        rgb(255 255 255 / 30%) 50%,
        rgb(255 255 255 / 0%) 100%
      );
      background-size: 200% 100%;
      border-radius: inherit;
      animation: shimmer 1.5s infinite;
    }
  }

  .peidi-segment-value {
    z-index: 999;
    // overflow: hidden;
    // text-overflow: ellipsis;
    max-width: 100%;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgb(0 0 0 / 30%);
  }

  .peidi-segment-text {
    z-index: 999;
    max-width: 100%;
    padding: 0 4px;
    overflow: visible;
    // text-overflow: clip;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgb(0 0 0 / 30%);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.no-data-text {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}
</style>
