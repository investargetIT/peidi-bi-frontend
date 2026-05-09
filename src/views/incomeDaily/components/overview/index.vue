<script setup lang="ts">
import ProjectProgress from "./projectProgress.vue";
import PieChart from "./pieChart.vue";
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <template #header>
        <div class="text-[#0a0a0a] text-sm">进度</div>
      </template>
      <el-row :gutter="10">
        <el-col :xs="24" :md="24">
          <ProjectProgress />
        </el-col>
        <!-- <el-col :xs="24" :md="12">
          <PieChart />
        </el-col> -->
      </el-row>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.el-card__header) {
  padding-top: 10px;
  padding-bottom: 10px;
}

::v-deep(.el-card__body) {
  padding-top: 10px;
  padding-bottom: 0;
}
</style>
