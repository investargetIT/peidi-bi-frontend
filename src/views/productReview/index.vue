<script setup lang="ts">
import { ref, watch } from "vue";
import GoodsEvaluation from "./goodsEvaluation/index.vue";
import TaobaoQA from "./taobaoQA/index.vue";
const activeName = ref("goodsEvaluation");
const goodsEvaluationRef = ref<typeof GoodsEvaluation>();
const taobaoQARef = ref<typeof TaobaoQA>();

watch(
  () => activeName.value,
  newActiveName => {
    if (newActiveName === "goodsEvaluation") {
      goodsEvaluationRef.value?.fetchGoodsEvaluation();
    } else if (newActiveName === "taobaoQA") {
      taobaoQARef.value?.fetchTaobaoAnswers();
    }
  }
);
</script>

<template>
  <el-tabs
    v-model="activeName"
    type="border-card"
    class="peidi-el-tabs-modern-tabs"
  >
    <el-tab-pane label="产品评价数据系统" name="goodsEvaluation" lazy>
      <GoodsEvaluation ref="goodsEvaluationRef" />
    </el-tab-pane>
    <el-tab-pane label="淘宝问答" name="taobaoQA" lazy>
      <TaobaoQA ref="taobaoQARef" />
    </el-tab-pane>
  </el-tabs>
</template>
