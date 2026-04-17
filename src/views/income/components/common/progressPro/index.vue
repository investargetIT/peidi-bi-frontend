<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  // 标题
  title: {
    type: String,
    default: ""
  },
  // 百分比值 (可以超过 100)
  percentage: {
    type: Number,
    default: 0
  },
  // 百分比文字颜色
  percentageColor: {
    type: String,
    default: "#409EFF"
  },
  // 进度条渐变色数组 [起始颜色，结束颜色]
  gradientColors: {
    type: Array as PropType<string[]>,
    default: () => ["#409EFF", "#67C23A"]
  },
  // 是否启用动画
  animated: {
    type: Boolean,
    default: false
  },
  // 进度条高度
  height: {
    type: String,
    default: "12px"
  },
  // 是否显示百分比文字
  showPercentage: {
    type: Boolean,
    default: true
  }
});

// 计算渐变色样式
const gradientStyle = computed(() => {
  if (props.gradientColors.length >= 2) {
    return {
      background: `linear-gradient(to right, ${props.gradientColors[0]}, ${props.gradientColors[1]})`
    };
  }
  return {
    background: props.gradientColors[0] || "#409EFF"
  };
});

// 限制进度条宽度在 0-100 之间
const progressBarWidth = computed(() => {
  return Math.max(0, Math.min(100, props.percentage));
});
</script>

<template>
  <div class="progress-pro-container">
    <!-- 第一层：标题和百分比 -->
    <div class="progress-header">
      <div v-if="title" class="progress-title">{{ title }}</div>
      <div
        v-if="showPercentage"
        class="progress-percentage"
        :style="{ color: percentageColor }"
      >
        {{ percentage }} %
      </div>
    </div>

    <!-- 第二层：进度条 -->
    <div class="progress-bar-wrapper" :style="{ height: props.height }">
      <!-- 底部空条（灰色渐变） -->
      <div class="progress-bar-bg"></div>

      <!-- 上层进度条 -->
      <div
        class="progress-bar-fill"
        :style="[gradientStyle, { width: `${progressBarWidth}%` }]"
      >
        <!-- 白色闪烁动画效果 -->
        <div v-if="animated" class="progress-bar-shine"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.progress-pro-container {
  width: 100%;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .progress-title {
      font-size: 12px;
      font-weight: 700;
      color: #595c5e;
      line-height: 1;
    }

    .progress-percentage {
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
    }
  }

  .progress-bar-wrapper {
    position: relative;
    width: 100%;
    border-radius: 6px;
    overflow: hidden;

    .progress-bar-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to right,
        #ebeef5 0%,
        #dcdfe6 50%,
        #ebeef5 100%
      );
      border-radius: 6px;
    }

    .progress-bar-fill {
      position: relative;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 6px;
      transition: width 0.3s ease;
      overflow: hidden;

      .progress-bar-shine {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shine 1.5s infinite;
      }
    }
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
