<script setup lang="ts">
import { ref } from "vue";
import PieChart from "./pieChart.vue";
import ProjectProgress from "./projectProgress.vue";

const activeName = ref("month");
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="本月" name="month"></el-tab-pane>
          <el-tab-pane label="年度" name="year"></el-tab-pane>
        </el-tabs>
      </div>
      <div>
        <el-row :gutter="10">
          <el-col :xs="24" :md="12">
            <PieChart />
          </el-col>
          <el-col :xs="24" :md="12">
            <ProjectProgress />
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>
