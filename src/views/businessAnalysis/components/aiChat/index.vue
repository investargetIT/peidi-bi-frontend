<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { ChatDotRound, Close } from "@element-plus/icons-vue";

const isOpen = ref(false);
const showButton = ref(true);
const buttonPosition = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const hasMoved = ref(false);

const BUTTON_SIZE = 60;
const BUTTON_MARGIN = 20;
const DESKTOP_CHAT_WIDTH = 420;
const DESKTOP_CHAT_HEIGHT = 600;
const MOBILE_BREAKPOINT = 768;
const MOBILE_MARGIN = 12;

const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

const clampButtonPosition = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  buttonPosition.value = {
    x: Math.max(
      BUTTON_MARGIN,
      Math.min(
        buttonPosition.value.x,
        windowWidth - BUTTON_SIZE - BUTTON_MARGIN
      )
    ),
    y: Math.max(
      BUTTON_MARGIN,
      Math.min(
        buttonPosition.value.y,
        windowHeight - BUTTON_SIZE - BUTTON_MARGIN
      )
    )
  };
};

onMounted(() => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  buttonPosition.value = {
    x: windowWidth - BUTTON_SIZE - BUTTON_MARGIN,
    y: windowHeight - BUTTON_SIZE - BUTTON_MARGIN
  };
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", clampButtonPosition);
});

const toggleChat = (e?: MouseEvent) => {
  if (hasMoved.value) return;
  showButton.value = false;
  nextTick(() => {
    isOpen.value = !isOpen.value;
  });
};

const closeChat = () => {
  isOpen.value = false;
  setTimeout(() => {
    showButton.value = true;
  }, 300);
};

const startDrag = (clientX: number, clientY: number) => {
  isDragging.value = true;
  hasMoved.value = false;
  dragStart.value = {
    x: clientX - buttonPosition.value.x,
    y: clientY - buttonPosition.value.y
  };
};

const updateDragPosition = (clientX: number, clientY: number) => {
  if (!isDragging.value) return;
  hasMoved.value = true;
  buttonPosition.value = {
    x: clientX - dragStart.value.x,
    y: clientY - dragStart.value.y
  };
};

const handleMouseDown = (e: MouseEvent) => {
  startDrag(e.clientX, e.clientY);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  e.preventDefault();
  e.stopPropagation();
};

const handleMouseMove = (e: MouseEvent) => {
  updateDragPosition(e.clientX, e.clientY);
};

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;
  startDrag(touch.clientX, touch.clientY);
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
};

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;
  updateDragPosition(touch.clientX, touch.clientY);
  e.preventDefault();
};

const handleTouchEnd = () => {
  handleMouseUp();
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);
};

const handleMouseUp = () => {
  if (isDragging.value && hasMoved.value) {
    snapToEdge();
  }
  isDragging.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  setTimeout(() => {
    hasMoved.value = false;
  }, 0);
};

const snapToEdge = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let newX = buttonPosition.value.x;
  let newY = buttonPosition.value.y;

  if (newX > windowWidth / 2 - BUTTON_SIZE / 2) {
    newX = windowWidth - BUTTON_SIZE - BUTTON_MARGIN;
  } else {
    newX = BUTTON_MARGIN;
  }

  newY = Math.max(
    BUTTON_MARGIN,
    Math.min(newY, windowHeight - BUTTON_SIZE - BUTTON_MARGIN)
  );

  buttonPosition.value = { x: newX, y: newY };
};

const getContainerPosition = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (isMobileViewport()) {
    return { left: MOBILE_MARGIN, top: MOBILE_MARGIN };
  }

  const margin = BUTTON_MARGIN;
  const containerWidth = Math.min(DESKTOP_CHAT_WIDTH, windowWidth - margin * 2);
  const containerHeight = Math.min(
    DESKTOP_CHAT_HEIGHT,
    windowHeight - margin * 2
  );

  let left = buttonPosition.value.x - containerWidth + BUTTON_SIZE;
  let top = buttonPosition.value.y - containerHeight - margin;

  if (left < margin) left = margin;
  if (left + containerWidth > windowWidth - margin)
    left = windowWidth - containerWidth - margin;
  if (top < margin) top = margin;
  if (top + containerHeight > windowHeight - margin)
    top = windowHeight - containerHeight - margin;

  return { left, top };
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isOpen.value) {
    closeChat();
  }
};

onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);
  document.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("resize", clampButtonPosition);
});
</script>

<template>
  <div class="ai-chat-wrapper">
    <!-- 悬浮按钮 -->
    <transition name="button-fade">
      <div
        v-if="showButton && !isOpen"
        class="ai-chat-button"
        :class="{ dragging: isDragging }"
        :style="{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`
        }"
        @click="toggleChat"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
      >
        <el-icon :size="32"><ChatDotRound /></el-icon>
      </div>
    </transition>

    <!-- 对话框 -->
    <transition name="chat-fade" @after-leave="showButton = true">
      <div
        v-if="isOpen"
        class="ai-chat-container"
        :style="{
          left: `${getContainerPosition().left}px`,
          top: `${getContainerPosition().top}px`
        }"
      >
        <!-- 头部 -->
        <div class="ai-chat-header">
          <div class="ai-chat-title">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI 智能助手</span>
          </div>
          <div class="ai-chat-actions">
            <el-icon @click="closeChat"><Close /></el-icon>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="ai-chat-body">
          <iframe
            src="https://chat.peidigroup.cn"
            class="ai-chat-iframe"
            frameborder="0"
            title="AI Assistant"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.ai-chat-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.ai-chat-button {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  color: white;
  pointer-events: auto;
  cursor: pointer;
  background: linear-gradient(135deg, #0070c9 0%, #00a0e9 100%);
  border-radius: 50%;
  box-shadow: 0 4px 15px rgb(0 112 201 / 40%);
  transition: box-shadow 0.3s ease;

  &:hover:not(.dragging) {
    box-shadow: 0 6px 20px rgb(0 112 201 / 50%);
  }

  &.dragging {
    cursor: grabbing;
  }
}

.ai-chat-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: min(420px, calc(100vw - 24px));
  height: min(600px, calc(100vh - 24px));
  overflow: hidden;
  pointer-events: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgb(0 0 0 / 15%);
}

.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: all 0.3s ease;
}

.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.button-fade-enter-active,
.button-fade-leave-active {
  transition: all 0.2s ease;
}

.button-fade-enter-from,
.button-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.ai-chat-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  color: white;
  background: linear-gradient(135deg, #0070c9 0%, #00a0e9 100%);
}

.ai-chat-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.ai-chat-actions {
  display: flex;
  gap: 12px;
  align-items: center;

  .el-icon {
    font-size: 18px;
    cursor: pointer;
  }
}

.ai-chat-body {
  flex: 1;
  overflow: hidden;
}

.ai-chat-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
