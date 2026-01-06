<script setup lang="ts">
import { ref } from "vue";
import Details from "./components/details/index.vue";
import Market from "./components/market/index.vue";

const activeName = ref("details");
</script>

<template>
  <div>
    <el-tabs
      v-model="activeName"
      type="border-card"
      class="peidi-el-tabs-modern-tabs"
    >
      <el-tab-pane label="产品明细" name="details" lazy>
        <Details v-if="activeName === 'details'" />
      </el-tab-pane>
      <el-tab-pane label="市场大盘" name="market" lazy>
        <Market v-if="activeName === 'market'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
