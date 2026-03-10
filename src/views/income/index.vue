<script setup lang="ts">
import Header from "./components/header/index.vue";
import OverView from "./components/overview/index.vue";
import Achievement from "./components/achievement/index.vue";
import MonthlyData from "./components/monthlyData/index.vue";
</script>

<template>
  <div>
    <div>
      <Header />
    </div>
    <div class="mt-4">
      <OverView />
    </div>
    <div class="mt-4">
      <Achievement />
    </div>
    <div class="mt-4">
      <MonthlyData />
    </div>
  </div>
</template>
