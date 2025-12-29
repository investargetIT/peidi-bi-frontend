<script setup lang="ts">
import { ref } from "vue";
import { type AnalyzeListContentItem } from "@/views/taobao/reviewAnalytics/index.vue";

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  contentList: {
    type: Array as PropType<AnalyzeListContentItem[]>,
    required: true
  }
});
</script>

<template>
  <el-card style="border-radius: 10px">
    <div class="font-semibold text-[#0b0b0b]">{{ props.title }}</div>
    <el-table
      :data="props.contentList"
      style="width: 100%; margin-top: 20px"
      :header-cell-style="{ color: '#555', fontWeight: 'normal' }"
      :cell-style="{ color: '#0b0b0b' }"
    >
      <el-table-column prop="customerName" label="用户" width="100" />
      <!-- <el-table-column prop="score" label="评分" width="180">
        <template #default="{ row }">
          <el-rate
            :model-value="Number(row.score) || 0"
            disabled
            :colors="['#F10000', '#F10000', '#F10000']"
          />
        </template>
      </el-table-column> -->
      <el-table-column prop="sentiment" label="情感" width="100">
        <template #default="{ row }">
          <el-tag
            v-if="row.sentiment === 'positive'"
            effect="dark"
            color="#31B39B"
            >正面</el-tag
          >
          <el-tag
            v-else-if="row.sentiment === 'negative'"
            effect="dark"
            color="#DF0000"
            >负面</el-tag
          >
          <el-tag v-else effect="dark" color="#7E78E5">中性</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="goodsReview"
        label="评论内容"
        show-overflow-tooltip
      />
      <el-table-column prop="reviewDate" label="日期" width="100" />
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.el-tag {
  border: 0;
}
</style>
