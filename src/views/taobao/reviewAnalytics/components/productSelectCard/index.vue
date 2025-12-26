<script setup lang="ts">
import { ref } from "vue";

// 竞品对比模式
const isCompareMode = ref(false);

// 本产品
const product = ref("");
const productOptions = ref([
  {
    value: "1",
    label: "产品1"
  },
  {
    value: "2",
    label: "产品2"
  }
]);
// 竞品
const competitor = ref("");
const competitorOptions = ref([
  {
    value: "1",
    label: "竞品1"
  },
  {
    value: "2",
    label: "竞品2"
  }
]);
</script>

<template>
  <el-card style="border-radius: 10px">
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <span class="text-[16px] font-bold text-[#0b0b0b]"> 竞品对比模式 </span>
        <span class="text-[14px] text-[#555555]">
          开启后显示并排对比数据和差异分析
        </span>
      </div>
      <div>
        <el-switch v-model="isCompareMode" />
      </div>
    </div>
  </el-card>
  <div class="mt-[20px]" />
  <el-card style="border-radius: 10px">
    <div class="flex flex-col">
      <span class="text-[16px] font-bold text-[#0b0b0b]"> 产品对比选择 </span>
      <span class="text-[14px] text-[#555555]"> 选择要对比分析的产品 </span>
    </div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="mt-[16px]">
          <div class="text-[14px] text-[#0b0b0b]">本产品</div>
          <el-select v-model="product" placeholder="请选择本产品">
            <el-option
              v-for="item in productOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="mt-[16px]">
          <div class="text-[14px] text-[#0b0b0b]">竞品</div>
          <el-select v-model="competitor" placeholder="请选择竞品">
            <el-option
              v-for="item in competitorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-select__selected-item span) {
  color: oklch(15% 0 0deg);
}

:deep(.is-transparent span) {
  color: oklch(45% 0 0deg);
}
</style>
