<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps({
  isCompareMode: {
    type: Boolean,
    required: true
  },
  // 本产品
  product: {
    type: String,
    required: true
  },
  // 竞品
  competitor: {
    type: String,
    required: true
  },
  // 本产品评论时间范围
  productTimeRange: {
    type: Array<string>,
    required: true
  },
  // 竞品评论时间范围
  competitorTimeRange: {
    type: Array<string>,
    required: true
  },
  productOptions: {
    type: Array<{
      value: string;
      label: string;
    }>,
    required: true
  },
  competitorOptions: {
    type: Array<{
      value: string;
      label: string;
    }>,
    required: true
  }
});

const emit = defineEmits([
  "update:isCompareMode",
  "update:product",
  "update:competitor",
  "update:productTimeRange",
  "update:competitorTimeRange"
]);

// 使用计算属性实现双向绑定
const isCompareModeModel = computed({
  get: () => props.isCompareMode,
  set: value => emit("update:isCompareMode", value)
});
const productModel = computed({
  get: () => props.product,
  set: value => emit("update:product", value)
});
const competitorModel = computed({
  get: () => props.competitor,
  set: value => emit("update:competitor", value)
});
const productTimeRangeModel = computed({
  get: () => props.productTimeRange,
  set: value => emit("update:productTimeRange", value)
});
const competitorTimeRangeModel = computed({
  get: () => props.competitorTimeRange,
  set: value => emit("update:competitorTimeRange", value)
});

// 竞品对比模式
// const isCompareMode = ref(false);

// 本产品
// const product = ref("");
// const productOptions = ref([
//   {
//     value: "1",
//     label: "产品1"
//   },
//   {
//     value: "2",
//     label: "产品2"
//   }
// ]);
// 竞品
// const competitor = ref("");
// const competitorOptions = ref([
//   {
//     value: "1",
//     label: "竞品1"
//   },
//   {
//     value: "2",
//     label: "竞品2"
//   }
// ]);
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
        <el-switch v-model="isCompareModeModel" />
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
          <div>
            <div class="text-[14px] text-[#0b0b0b]">
              本产品评论时间范围（可选）
            </div>
            <el-date-picker
              v-model="productTimeRangeModel"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </div>
          <div>
            <div class="text-[14px] text-[#0b0b0b] mt-[10px]">本产品</div>
            <el-select
              v-model="productModel"
              placeholder="请选择本产品"
              filterable
            >
              <el-option
                v-for="item in props.productOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="mt-[16px]">
          <div>
            <div class="text-[14px] text-[#0b0b0b]">
              竞品评论时间范围（可选）
            </div>
            <el-date-picker
              v-model="competitorTimeRangeModel"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </div>
          <div>
            <div class="text-[14px] text-[#0b0b0b] mt-[10px]">竞品</div>
            <el-select
              v-model="competitorModel"
              placeholder="请选择竞品"
              filterable
            >
              <el-option
                v-for="item in props.competitorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
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
