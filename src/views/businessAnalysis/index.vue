<script setup lang="ts">
import { ref } from "vue";
import IncomePro from "@/views/incomePro/index.vue";
import OperationAnalysis from "@/views/operationAnalysis/index.vue";

const activeName = ref("incomePro");
</script>

<template>
  <div class="p-8">
    <el-tabs
      v-model="activeName"
      type="border-card"
      class="peidi-el-tabs-modern-tabs"
    >
      <el-tab-pane label="业绩实时监控" name="incomePro" lazy>
        <IncomePro v-if="activeName === 'incomePro'" />
      </el-tab-pane>
      <el-tab-pane label="经营分析" name="operationAnalysis" lazy>
        <OperationAnalysis v-if="activeName === 'operationAnalysis'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
