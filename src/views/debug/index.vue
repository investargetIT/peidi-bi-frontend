<script setup lang="ts">
import { ref } from "vue";
import Markdown from "@/views/debug/markdown/index.vue";

const activeName = ref("debug-1");
</script>

<template>
  <div class="peidi-debug">
    <el-tabs v-model="activeName" type="border-card" class="demo-tabs">
      <el-tab-pane label="Markdown" name="debug-1">
        <Markdown />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
