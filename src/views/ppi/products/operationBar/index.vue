<script setup lang="ts">
import { computed, inject, ref } from "vue";

// props
const props = defineProps({
  searchContent: {
    type: Object,
    default: () => ({
      title: ""
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 从父组件注入fetchProductPage方法
const fetchProductPage = inject("fetchProductPage") as () => void;

const emit = defineEmits(["update:searchContent"]);
const searchContentModel = computed({
  get: () => props.searchContent,
  set: value => emit("update:searchContent", value)
});

// const filterCategory = ref("");
// const brandName = ref("");
// const productName = ref("");
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <!-- 标题 -->
    <div class="text-[16px] font-[600] text-[#0a0a0a] ml-[12px]">Filter</div>
    <!-- 筛选器 -->
    <div class="ml-[12px] mt-[12px] flex items-center">
      <!-- <el-select
        v-model="filterCategory"
        placeholder="Select category"
        style="width: 240px"
      >
        <el-option label="All Categories" value="1"></el-option>
        <el-option label="Dog Treats" value="2"></el-option>
        <el-option label="Bird Treats" value="3"></el-option>
        <el-option label="Small Animal Treats" value="4"></el-option>
      </el-select> -->
      <!-- <el-input
        v-model="brandName"
        style="width: 240px"
        placeholder="Enter brand name"
      /> -->
      <el-input
        v-model="searchContentModel.title"
        style="width: 240px"
        placeholder="Enter product name"
      />
      <el-button
        style="width: 120px; margin-left: 12px"
        color="#000"
        :loading="loading"
        @click="fetchProductPage"
        >Apply</el-button
      >
    </div>
  </el-card>
</template>
