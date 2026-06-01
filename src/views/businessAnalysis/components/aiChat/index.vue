<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { ChatDotRound, Close } from "@element-plus/icons-vue";

const isOpen = ref(false);
const showButton = ref(true);
const buttonPosition = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const hasMoved = ref(false);

onMounted(() => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  buttonPosition.value = {
    x: windowWidth - 80,
    y: windowHeight - 80
  };
  document.addEventListener("keydown", handleKeyDown);
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

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  hasMoved.value = false;
  dragStart.value = {
    x: e.clientX - buttonPosition.value.x,
    y: e.clientY - buttonPosition.value.y
  };
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  e.preventDefault();
  e.stopPropagation();
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  hasMoved.value = true;
  buttonPosition.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  };
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
  const buttonWidth = 60;
  const margin = 20;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let newX = buttonPosition.value.x;
  let newY = buttonPosition.value.y;

  if (newX > windowWidth / 2 - buttonWidth / 2) {
    newX = windowWidth - buttonWidth - margin;
  } else {
    newX = margin;
  }

  newY = Math.max(margin, Math.min(newY, windowHeight - buttonWidth - margin));

  buttonPosition.value = { x: newX, y: newY };
};

const getContainerPosition = () => {
  const windowWidth = window.innerWidth;
  const containerWidth = 420;
  const containerHeight = 600;
  const margin = 20;

  let left = buttonPosition.value.x - containerWidth + 60;
  let top = buttonPosition.value.y - containerHeight - margin;

  if (left < margin) left = margin;
  if (left + containerWidth > windowWidth - margin)
    left = windowWidth - containerWidth - margin;
  if (top < margin) top = margin;

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
  document.removeEventListener("keydown", handleKeyDown);
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
  width: 420px;
  height: 600px;
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
