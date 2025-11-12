<script setup lang="ts">
import { ref } from "vue";

const tableData = ref([
  {
    // 行政区划信息
    firstLevelRegion: "",
    secondLevelRegion: "",
    customerLevel: "",

    // 时间相关字段
    firstPurchaseTime: "",
    lastPurchaseTime: "",

    // 金额相关字段 (M - Monetary)
    totalPurchaseAmount: "",
    yearlyPurchaseAmount: "",
    lastPurchaseAmount: "",

    // 频次相关字段 (F - Frequency)
    totalPurchaseFrequency: "",
    yearlyPurchaseFrequency: ""
  }
]);
</script>

<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%; color: #09090b"
      :header-cell-style="{ color: '#09090b' }"
      highlight-current-row
    >
      <el-table-column prop="firstLevelRegion" label="一级行政区" />
      <el-table-column prop="secondLevelRegion" label="二级行政区" />
      <el-table-column prop="customerLevel" label="等级" />
      <el-table-column prop="firstPurchaseTime" label="首次消费时间" />
      <el-table-column prop="lastPurchaseTime" label="最近一次消费时间" />
      <el-table-column prop="totalPurchaseAmount" label="累计消费金额" />
      <el-table-column prop="yearlyPurchaseAmount" label="近一年消费金额" />
      <el-table-column prop="lastPurchaseAmount" label="最近一次消费金额" />
      <el-table-column prop="totalPurchaseFrequency" label="累计消费频次" />
      <el-table-column prop="yearlyPurchaseFrequency" label="近一年消费频次" />
    </el-table>
  </div>
</template>
