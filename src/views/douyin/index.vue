<script setup lang="ts">
import DailyPerformance from "./components/dailyPerformance/index.vue";
import ShortVideo from "./components/shortVideo/index.vue";
import BusinessRelatedExpert from "./components/businessRelatedExpert/index.vue";
import ProductID from "./components/productID/index.vue";
import HeroiconsQuestionMarkCircle20Solid from "~icons/heroicons/question-mark-circle-20-solid";
</script>

<template>
  <div class="peidi-douyin">
    <el-tabs type="border-card" class="peidi-el-tabs-modern-tabs">
      <el-tab-pane lazy>
        <template #label>
          <div class="flex items-center justify-center">
            每日业绩数据
            <el-tooltip
              class="box-item"
              effect="dark"
              content="每天上午10点之前更新数据（节假日除外）"
              placement="top"
            >
              <HeroiconsQuestionMarkCircle20Solid />
            </el-tooltip>
          </div>
        </template>
        <DailyPerformance />
      </el-tab-pane>
      <el-tab-pane lazy>
        <template #label>
          <div class="flex items-center justify-center">
            短视频数据
            <el-tooltip
              class="box-item"
              effect="dark"
              content="每天下午2点左右更新数据（节假日除外）"
              placement="top"
            >
              <HeroiconsQuestionMarkCircle20Solid />
            </el-tooltip>
          </div>
        </template>
        <ShortVideo />
      </el-tab-pane>
      <el-tab-pane label="商务对应达人文档" lazy>
        <BusinessRelatedExpert />
      </el-tab-pane>
      <el-tab-pane label="短视频带货商品ID" lazy>
        <ProductID />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
