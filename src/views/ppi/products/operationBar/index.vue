<script setup lang="ts">
import { ref } from "vue";

const filterCategory = ref("");
const brandName = ref("");
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <!-- 标题 -->
    <div class="text-[16px] font-[600] text-[#0a0a0a] ml-[12px]">Filter</div>
    <!-- 筛选器 -->
    <div class="ml-[12px] mt-[12px] flex items-center">
      <el-select
        v-model="filterCategory"
        placeholder="Select category"
        style="width: 240px"
      >
        <el-option label="All Categories" value="1"></el-option>
        <el-option label="Dog Treats" value="2"></el-option>
        <el-option label="Bird Treats" value="3"></el-option>
        <el-option label="Small Animal Treats" value="4"></el-option>
      </el-select>
      <el-input
        v-model="brandName"
        style="width: 240px; margin-left: 12px"
        placeholder="Enter brand name"
      />
      <el-button style="width: 120px; margin-left: 12px" color="#000"
        >Apply</el-button
      >
    </div>
  </el-card>
</template>
