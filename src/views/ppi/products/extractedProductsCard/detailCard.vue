<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ExtractedProduct } from "../uploadDialog/index.vue";
import MdiTickCircleOutline from "~icons/mdi/tick-circle-outline";
import RiCloseLargeLine from "~icons/ri/close-large-line";
import BasilStarSolid from "~icons/basil/star-solid";
import MaterialSymbolsComment from "~icons/material-symbols/comment";
import OiDollar from "~icons/oi/dollar";
import LineiconsDollar from "~icons/lineicons/dollar";

// props
const props = defineProps({
  product: {
    type: Object as PropType<ExtractedProduct>,
    required: true
  },
  image: {
    type: String as PropType<string>,
    required: true
  },
  close: {
    type: Function as PropType<(id: string) => void>,
    required: true
  },
  save: {
    type: Function as PropType<(id: string) => void>,
    required: true
  }
});

// 信息卡片数据 赋值一份props.product的属性
const productForm = ref<ExtractedProduct>({
  ...props.product
});

// 商品卡片状态 extracted 提取中 saved 已保存
// 状态虽然在props.product中 但是为了更方便地在模板中使用 所以这里额外定义一个ref
const productStatus = ref<"extracted" | "saved">("extracted");
watch(
  () => props.product.status,
  (newVal, oldVal) => {
    productStatus.value = newVal;
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <el-card
    :style="{
      borderRadius: '10px',
      marginTop: '20px',
      width: '300px',
      backgroundColor: productStatus === 'extracted' ? '#fff' : '#F7FEF9',
      border:
        productStatus === 'extracted'
          ? '1px solid #D9D9D9'
          : '1px solid #00A63E'
    }"
  >
    <!-- 头部 -->
    <div class="flex justify-center items-center relative">
      <el-image
        :src="props.image"
        style="width: 100%; height: 160px; border-radius: 5px"
        fit="cover"
      />
      <el-tag
        v-show="productStatus === 'extracted'"
        class="absolute left-[10px] top-[10px]"
        effect="dark"
        color="#000"
        >Extracted</el-tag
      >
      <el-tag
        v-show="productStatus === 'saved'"
        class="absolute left-[10px] top-[10px]"
        effect="dark"
        color="#00A63E"
        >Saved ✓</el-tag
      >
      <el-button
        v-show="productStatus === 'extracted'"
        class="absolute right-[10px] top-[10px]"
        style="width: 15px; height: 15px; padding: 10px; background-color: red"
        type="danger"
        :icon="RiCloseLargeLine"
        @click="props.close(productForm.id)"
      />
    </div>
    <!-- 内容展示 -->
    <div class="peidi-ppi-extractedProductsCard-detailCard-form mt-[12px]">
      <el-form :disabled="productStatus === 'saved'" :model="productForm">
        <el-form-item>
          <el-input v-model="productForm.title" style="width: 100%" />
        </el-form-item>

        <el-form-item>
          <el-input v-model="productForm.star" style="width: 100%">
            <template #prepend>
              <BasilStarSolid style="width: 15px; height: 15px" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input v-model="productForm.reviewCnt" style="width: 100%">
            <template #prepend>
              <MaterialSymbolsComment style="width: 15px; height: 15px" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input v-model="productForm.amount" style="width: 100%">
            <template #prepend>
              <OiDollar style="width: 15px; height: 15px" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input v-model="productForm.longAmount" style="width: 100%">
            <template #prepend>
              <LineiconsDollar style="width: 15px; height: 15px" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <!-- 保存按钮 -->
    <el-button
      :disabled="productStatus === 'saved'"
      type="primary"
      style="width: 100%"
      color="#000"
      :icon="MdiTickCircleOutline"
      @click="props.save(productForm.id)"
      >Save to Database</el-button
    >
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-tag) {
  border: 0;
}

.peidi-ppi-extractedProductsCard-detailCard-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
