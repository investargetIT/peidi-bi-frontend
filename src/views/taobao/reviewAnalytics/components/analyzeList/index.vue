<script setup lang="ts">
import { inject, ref } from "vue";
import TextCard from "./contentCard.vue";
import { type AnalyzeListItem } from "@/views/taobao/reviewAnalytics/index.vue";

const props = defineProps({
  analyzeLists: {
    type: Array as PropType<AnalyzeListItem[]>,
    required: true
  }
});

const isCompareMode = inject<boolean>("isCompareMode");
</script>

<template>
  <div>
    <el-row :gutter="10">
      <el-col
        v-for="item in analyzeLists"
        :key="item.title"
        :xs="24"
        :sm="24"
        :md="isCompareMode ? 12 : 24"
        :lg="isCompareMode ? 12 : 24"
        :xl="isCompareMode ? 12 : 24"
      >
        <TextCard
          v-if="isCompareMode || item.title.includes('本产品最新评论')"
          class="mt-[20px]"
          :title="item.title"
          :contentList="item.contentList"
        />
      </el-col>
    </el-row>
  </div>
</template>
