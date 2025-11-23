<script setup lang="ts">
import Dashboard from "./dashboard/index.vue";
import Products from "./products/index.vue";
import Analytics from "./analytics/index.vue";
import Reddit from "./reddit/index.vue";
</script>

<template>
  <el-tabs type="border-card" class="peidi-el-tabs-modern-tabs">
    <el-tab-pane label="Dashboard" lazy>
      <Dashboard />
    </el-tab-pane>
    <el-tab-pane label="Products" lazy>
      <Products />
    </el-tab-pane>
    <el-tab-pane label="Analytics" lazy>
      <Analytics />
    </el-tab-pane>
    <el-tab-pane label="Reddit Insights" lazy>
      <Reddit />
    </el-tab-pane>
  </el-tabs>
</template>
