<script setup lang="ts">
import DailyPerformance from "./components/dailyPerformance/index.vue";
import ShortVideo from "./components/shortVideo/index.vue";
import BusinessRelatedExpert from "./components/businessRelatedExpert/index.vue";
import ProductID from "./components/productID/index.vue";
</script>

<template>
  <div class="peidi-douyin">
    <el-tabs type="border-card">
      <el-tab-pane label="每日业绩数据" lazy>
        <DailyPerformance />
      </el-tab-pane>
      <el-tab-pane label="短视频数据" lazy>
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
