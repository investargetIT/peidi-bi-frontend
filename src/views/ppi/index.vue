<script setup lang="ts">
import Dashboard from "./dashboard/index.vue";
import Products from "./products/index.vue";
</script>

<template>
  <el-tabs type="border-card">
    <el-tab-pane label="Dashboard" lazy>
      <Dashboard />
    </el-tab-pane>
    <el-tab-pane label="Products" lazy>
      <Products />
    </el-tab-pane>
    <el-tab-pane label="Analytics">Analytics</el-tab-pane>
    <el-tab-pane label="Reddit Insights">Reddit Insights</el-tab-pane>
  </el-tabs>
</template>
