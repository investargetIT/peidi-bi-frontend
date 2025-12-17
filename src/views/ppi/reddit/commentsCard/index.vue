<script setup lang="ts">
import IconParkSolidGoodTwo from "~icons/icon-park-solid/good-two";
import IconParkSolidBadTwo from "~icons/icon-park-solid/bad-two";
import HeroiconsSolidChat from "~icons/heroicons-solid/chat";
import type { CommentItem } from "./types";
import { computed, nextTick, ref } from "vue";
import { fa } from "element-plus/es/locale/index.mjs";

// props
const props = withDefaults(
  defineProps<{
    list: CommentItem[];
    title?: string;
    maxHeight?: string;
    showStats?: boolean;
  }>(),
  {
    title: "Comments Analysis",
    maxHeight: "600px",
    showStats: true
  }
);

// Drawer可见性控制
const drawerVisible = ref(false);

// 展开/收起状态
const expandedComments = ref<Set<number>>(new Set());

// 计算属性 - 统计数据
const stats = computed(() => {
  const totalComments = props.list.length;
  const totalUpvotes = props.list.reduce((sum, item) => sum + item.ups, 0);
  const totalDownvotes = props.list.reduce((sum, item) => sum + item.downs, 0);
  const avgSentiment =
    totalComments > 0 ? (totalUpvotes - totalDownvotes) / totalComments : 0;

  return {
    totalComments,
    totalUpvotes,
    totalDownvotes,
    avgSentiment
  };
});

// 计算属性 - 根据点赞数判断热度
const getHeatLevel = computed(() => (ups: number): string => {
  if (ups >= 10) return "high";
  if (ups >= 5) return "medium";
  return "low";
});

// 计算属性 - 热度对应的颜色
const getHeatColor = computed(() => (heat: string): string => {
  switch (heat) {
    case "high":
      return "#EF4444"; // 红色
    case "medium":
      return "#F59E0B"; // 橙色
    case "low":
      return "#10B981"; // 绿色
    default:
      return "#6B7280"; // 灰色
  }
});

// 计算属性 - 判断是否长评论
const isLongComment = (body: string): boolean => {
  return body.length > 200;
};

// 切换评论展开状态
const toggleComment = (index: number) => {
  if (expandedComments.value.has(index)) {
    expandedComments.value.delete(index);
  } else {
    expandedComments.value.add(index);
  }
};

// 格式化评论内容
const formatComment = (body: string, index: number): string => {
  if (!isLongComment(body) || expandedComments.value.has(index)) {
    return body;
  }
  return body.substring(0, 200) + "...";
};

// 打开drawer的方法（供父组件调用）
const openDrawer = (isResetScroll: boolean = false) => {
  drawerVisible.value = true;
  // 判断是否重置滚动条
  if (isResetScroll) {
    // 重置滚动条位置
    const drawerContent = document.querySelector(
      ".peidi-ppi-reedit-commentsCard-drawer .el-drawer__body .peidi-ppi-reedit-commentsCard-drawer-content"
    );
    if (drawerContent) {
      nextTick(() => {
        drawerContent.scrollTop = 0;
      });
    }
  }
};

// 关闭drawer的方法
const closeDrawer = () => {
  drawerVisible.value = false;
};

// 暴露方法给父组件
defineExpose({
  openDrawer,
  closeDrawer
});
</script>

<template>
  <!-- Drawer组件 -->
  <el-drawer
    v-model="drawerVisible"
    :modal="false"
    modal-penetrable
    direction="rtl"
    size="50%"
    class="peidi-ppi-reedit-commentsCard-drawer"
  >
    <!-- Drawer标题 -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="text-[18px] font-bold text-[#09090B]">
          {{ title }}
        </div>

        <!-- 统计信息 -->
        <div
          v-if="showStats"
          class="flex items-center space-x-6 text-sm text-[#71717A]"
        >
          <div class="flex items-center">
            <HeroiconsSolidChat class="w-4 h-4 mr-1 text-black" />
            <span>{{ stats.totalComments }} comments</span>
          </div>
          <div class="flex items-center">
            <IconParkSolidGoodTwo class="w-4 h-4 mr-1 text-green-500" />
            <span>{{ stats.totalUpvotes }} upvotes</span>
          </div>
          <div class="flex items-center">
            <IconParkSolidBadTwo class="w-4 h-4 mr-1 text-black-500" />
            <span>{{ stats.totalDownvotes }} downvotes</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Drawer内容区域 -->
    <div class="h-full flex flex-col">
      <!-- 评论列表容器 -->
      <div
        class="peidi-ppi-reedit-commentsCard-drawer-content flex-1 space-y-4 overflow-y-auto"
        :style="{ maxHeight: 'calc(100vh - 200px)' }"
      >
        <!-- 评论卡片 -->
        <el-card
          v-for="(item, index) in props.list"
          :key="index"
          shadow="never"
          style="
            margin-right: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          "
          class="hover:shadow-md transition-shadow"
        >
          <!-- 评论内容 -->
          <div class="flex">
            <!-- 热度指示器 -->
            <div
              class="w-1 rounded-l mr-4"
              :style="{ backgroundColor: getHeatColor(getHeatLevel(item.ups)) }"
            />

            <!-- 评论主体 -->
            <div class="flex-1">
              <!-- 评论正文 -->
              <div class="text-[14px] text-[#374151] leading-relaxed">
                {{ formatComment(item.body, index) }}
              </div>

              <!-- 展开/收起按钮 -->
              <div v-if="isLongComment(item.body)" class="mt-2">
                <el-button
                  text
                  size="small"
                  class="text-[#3B82F6] hover:text-[#2563EB]"
                  @click="toggleComment(index)"
                >
                  {{ expandedComments.has(index) ? "Show less" : "Show more" }}
                </el-button>
              </div>

              <!-- 点赞/点踩统计 -->
              <div
                class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
              >
                <div
                  class="flex items-center space-x-4 text-[12px] text-[#6B7280]"
                >
                  <div class="flex items-center">
                    <IconParkSolidGoodTwo class="w-3 h-3 mr-1 text-green-500" />
                    <span>{{ item.ups }}</span>
                  </div>
                  <div class="flex items-center">
                    <IconParkSolidBadTwo class="w-3 h-3 mr-1 text-black-500" />
                    <span>{{ item.downs }}</span>
                  </div>
                  <div class="flex items-center">
                    <div
                      class="w-2 h-2 rounded-full mr-1"
                      :style="{
                        backgroundColor: getHeatColor(getHeatLevel(item.ups))
                      }"
                    />
                    <span>{{ getHeatLevel(item.ups) }} engagement</span>
                  </div>
                </div>

                <!-- 情感标签 -->
                <el-tag
                  v-if="item.sentiment"
                  :type="
                    item.sentiment === 'positive'
                      ? 'success'
                      : item.sentiment === 'negative'
                        ? 'danger'
                        : 'info'
                  "
                  size="small"
                  round
                >
                  {{ item.sentiment }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <div
        v-if="props.list.length === 0"
        class="text-center py-8 text-[#6B7280] flex-1 flex items-center justify-center"
      >
        <div>
          <HeroiconsSolidChat class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No comments available</p>
        </div>
      </div>
    </div>

    <!-- Drawer底部 -->
    <template #footer>
      <div class="drawer-footer flex justify-end space-x-3">
        <el-button @click="drawerVisible = false">Close</el-button>
        <!-- <el-button type="primary" @click="drawerVisible = false">
          Confirm
        </el-button> -->
      </div>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.peidi-ppi-reedit-commentsCard-drawer {
  /* 自定义Drawer样式 */
}

.peidi-ppi-reedit-commentsCard-drawer :deep(.el-drawer__header) {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.peidi-ppi-reedit-commentsCard-drawer :deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
  padding: 0 20px;
}

.peidi-ppi-reedit-commentsCard-drawer :deep(.el-drawer__footer) {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
