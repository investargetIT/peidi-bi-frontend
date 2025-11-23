<script setup lang="ts">
import DetailCard from "./detailCard.vue";
import type { ExtractedProduct } from "../uploadDialog/index.vue";
import { UploadFile } from "element-plus";
import { computed, ref, watch } from "vue";

// props
const props = defineProps({
  extractedProducts: {
    type: Array as PropType<ExtractedProduct[]>,
    required: true
  },
  extractedProductImages: {
    type: Array as PropType<UploadFile[]>,
    required: true
  }
});

const extractedProductsCopy = ref<ExtractedProduct[]>([]);
// 计算属性来获取已保存的商品数量
const savedProductsCount = computed(() => {
  return extractedProductsCopy.value.filter(
    product => product.status === "saved"
  ).length;
});
// DetailCard点击关闭按钮后，删除该商品
const deleteProductCopy = (id: string) => {
  extractedProductsCopy.value = extractedProductsCopy.value.filter(
    product => product.id !== id
  );
};
// DetailCard点击保存按钮后，将商品状态改为saved
const saveProductCopy = (id: string) => {
  extractedProductsCopy.value = extractedProductsCopy.value.map(product => {
    if (product.id === id) {
      product.status = "saved";
    }
    return product;
  });
};

// 监听extractedProducts变化 深拷贝一份参数 并且额外为每个商品添加状态属性
watch(
  () => props.extractedProducts,
  (newVal, oldVal) => {
    console.log("监听extractedProducts变化", props.extractedProducts);
    const temp = [...newVal];
    temp.forEach(product => {
      product.status = "extracted";
    });
    extractedProductsCopy.value = temp;
  },
  {
    immediate: true
  }
);
</script>

<template>
  <el-card
    v-show="extractedProductsCopy.length > 0"
    shadow="never"
    style=" margin-top: 20px;border-radius: 10px"
  >
    <div class="text-[16px] font-[600] text-[#0a0a0a]">
      Extracted Products ({{ extractedProductsCopy.length }})
    </div>
    <div class="text-[#737373]">
      Review each product and save individually. Saved:
      {{ savedProductsCount }}/{{ extractedProductsCopy.length }}
    </div>

    <!-- 提取的产品列表卡片 可以并排显示 -->
    <div class="flex flex-row justify-between items-center flex-wrap">
      <DetailCard
        v-for="product in extractedProductsCopy"
        :key="product.id"
        :product="product"
        :image="props.extractedProductImages[0]?.url"
        :close="() => deleteProductCopy(product.id)"
        :save="() => saveProductCopy(product.id)"
      />
    </div>

    <!-- 备注 -->
    <el-card shadow="never" style=" margin-top: 20px;border-radius: 5px">
      <div class="text-[14px] font-[600] text-[#737373]">Progress:</div>
      <div class="text-[12px] font-[400] text-[#737373]">
        {{ savedProductsCount }} of {{ extractedProductsCopy.length }} products
        saved to database.
      </div>
      <div
        v-show="savedProductsCount == extractedProductsCopy.length"
        class="text-[12px] font-[700] text-[#00a63e]"
      >
        All products saved! ✓
      </div>
    </el-card>
  </el-card>
</template>
