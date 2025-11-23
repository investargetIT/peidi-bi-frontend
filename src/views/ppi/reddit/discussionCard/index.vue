<script setup lang="ts">
import IconParkSolidGoodTwo from "~icons/icon-park-solid/good-two";
import HeroiconsSolidChat from "~icons/heroicons-solid/chat";
import type { DiscussionItem } from "@/views/ppi/reddit/index.vue";
import { computed } from "vue";

// props
const props = defineProps({
  list: {
    type: Array as PropType<DiscussionItem[]>,
    required: true
  }
});

// 计算属性 -判断类型标签颜色
const handleTagType = computed(() => (data: string): any => {
  switch (data) {
    case "positive":
      return "success";
    case "neutral":
      return "info";
    case "negative":
      return "danger";
    default:
      return "info";
  }
});
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <div class="text-[16px] font-bold text-[#09090B] pb-[8px]">
      Top Discussions by Engagement
    </div>

    <!-- 讨论列表卡片 -->
    <el-card
      v-for="(item, index) in props.list"
      :key="index"
      shadow="never"
      style=" margin-top: 16px;border-radius: 10px"
    >
      <!-- 标题、类型标签 -->
      <div class="flex justify-between items-center">
        <div class="text-[18px] font-[700] text-[#09090B]">
          {{ item.title }}
        </div>
        <el-tag :type="handleTagType(item.type)">{{ item.type }}</el-tag>
      </div>

      <!-- 描述 -->
      <div class="text-[14px] text-[#71717A] mt-[6px]">
        {{ item.description }}
      </div>

      <!-- 信息 -->
      <div class="text-[14px] text-[#71717A] mt-[6px]">
        <span>{{ item.info.subreddit }}</span>
        <span class="ml-[16px]">{{ item.info.author }}</span>
        <span class="ml-[16px]">{{ item.info.date }}</span>
      </div>

      <!-- 点赞、评论、提及标签 -->
      <div class="flex justify-between items-center mt-[12px]">
        <div class="text-[16px] font-[700] text-[#09090B] flex items-center">
          <div class="flex items-center">
            <IconParkSolidGoodTwo />
            <span class="ml-[8px]">{{ item.likes }}</span>
          </div>
          <div class="flex items-center ml-[16px]">
            <HeroiconsSolidChat />
            <span class="ml-[8px]">{{ item.comments }}</span>
          </div>
        </div>
        <div class="text-[14px] text-[#71717A]">
          <span v-show="item.mentions.length">Mentions: </span>
          <el-space>
            <el-tag
              v-for="mention in item.mentions"
              :key="mention"
              type="primary"
              >{{ mention }}</el-tag
            >
          </el-space>
        </div>
      </div>

      <!-- 关键词标签 -->
      <div class="flex items-center mt-[14px]">
        <el-space>
          <el-tag v-for="keyword in item.keywords" :key="keyword" type="info">{{
            keyword
          }}</el-tag>
        </el-space>
      </div>
    </el-card>
  </el-card>
</template>
