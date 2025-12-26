<script setup lang="ts">
import { ref } from "vue";
import NumCard from "./numCard.vue";
import TextCard from "./textCard.vue";
import {
  COMMIT_ICON,
  TRENDING_UP_ICON,
  TRENDING_DOWN_ICON,
  UP_ICON,
  DOWN_ICON,
  ADVANTAGE_ICON,
  DISADVANTAGE_ICON,
  SUGGESTION_ICON
} from "@/views/taobao/reviewAnalytics/svg/index";

const numCards = ref([
  {
    title: "总评论数",
    content: "12,847",
    iconHTML: COMMIT_ICON,
    changeContent: "+12.5%",
    changeIconHTML: TRENDING_UP_ICON,
    changeStatus: "positive",

    competitorName: "竞争对手A",
    competitorContent: "11,234",
    competitorChangeContent: "1613.0",
    competitorChangeIconHTML: UP_ICON,
    competitorChangeStatus: "positive"
  },
  {
    title: "正面评价",
    content: "87.3%",
    iconHTML: TRENDING_UP_ICON,
    changeContent: "+3.1%",
    changeIconHTML: TRENDING_UP_ICON,
    changeStatus: "positive",

    competitorName: "竞争对手A",
    competitorContent: "81.2%",
    competitorChangeContent: "6.1%",
    competitorChangeIconHTML: UP_ICON,
    competitorChangeStatus: "positive"
  },
  {
    title: "负面评价",
    content: "4.2%",
    iconHTML: TRENDING_DOWN_ICON,
    changeContent: "-1.5%",
    changeIconHTML: TRENDING_DOWN_ICON,
    changeStatus: "negative",

    competitorName: "竞争对手A",
    competitorContent: "6.8%",
    competitorChangeContent: "2.6%",
    competitorChangeIconHTML: DOWN_ICON,
    competitorChangeStatus: "negative"
  }
]);

const textCards = ref([
  {
    title: "竞争优势",
    contents: [
      "物流速度比竞品快 18%",
      "产品质量评分领先 6.1 分",
      "客服响应时间缩短 35%",
      "好评率高出竞品 6.1%"
    ],
    iconHTML: ADVANTAGE_ICON,
    status: "advantage"
  },
  {
    title: "需要改进",
    contents: [
      "用户对商品的评价普遍较高，显示出其质量和价值。",
      "商品的包装设计评分略低 0.3 分"
    ],
    iconHTML: DISADVANTAGE_ICON,
    status: "disadvantage"
  },
  {
    title: "优化建议",
    contents: [
      "建议优化价格策略，提升性价比竞争力",
      "可以加强包装设计的视觉吸引力",
      "继续保持物流和客服优势"
    ],
    iconHTML: SUGGESTION_ICON,
    status: "suggestion"
  }
]);
</script>

<template>
  <div>
    <el-row :gutter="10">
      <el-col
        v-for="item in numCards"
        :key="item.title"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
        :xl="8"
      >
        <NumCard
          class="mt-[20px]"
          :title="item.title"
          :content="item.content"
          :iconHTML="item.iconHTML"
          :changeContent="item.changeContent"
          :changeIconHTML="item.changeIconHTML"
          :changeStatus="item.changeStatus"
          :competitorName="item.competitorName"
          :competitorContent="item.competitorContent"
          :competitorChangeContent="item.competitorChangeContent"
          :competitorChangeIconHTML="item.competitorChangeIconHTML"
          :competitorChangeStatus="item.competitorChangeStatus"
        />
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col
        v-for="item in textCards"
        :key="item.title"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
        :xl="8"
      >
        <TextCard
          class="mt-[20px]"
          :title="item.title"
          :contents="item.contents"
          :iconHTML="item.iconHTML"
          :status="item.status"
        />
      </el-col>
    </el-row>
  </div>
</template>
