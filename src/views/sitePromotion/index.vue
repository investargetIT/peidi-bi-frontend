<script setup lang="ts">
import { ref } from "vue";
import Dashboard from "./dashboard/index.vue";
import Maintenance from "./maintenance/index.vue";

const activeName = ref("dashboard");
</script>

<template>
  <div>
    <el-tabs
      v-model="activeName"
      type="border-card"
      class="peidi-el-tabs-modern-tabs"
    >
      <el-tab-pane label="站内付费BI看板" name="dashboard" lazy>
        <Dashboard v-if="activeName === 'dashboard'" />
      </el-tab-pane>
      <el-tab-pane label="数据维护" name="maintenance" lazy>
        <Maintenance v-if="activeName === 'maintenance'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
