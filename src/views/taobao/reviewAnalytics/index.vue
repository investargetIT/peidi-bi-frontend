<script setup lang="ts">
import SearchCard from "./components/searchCard/index.vue";
import ProductSelectCard from "./components/productSelectCard/index.vue";
import AnalyzeText from "./components/analyzeText/index.vue";
</script>

<template>
  <div>
    <div>
      <SearchCard />
    </div>
    <div class="mt-[20px]">
      <ProductSelectCard />
    </div>
    <div>
      <AnalyzeText />
    </div>
  </div>
</template>
