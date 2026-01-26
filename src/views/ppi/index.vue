<script setup lang="ts">
import { ref } from "vue";
import Dashboard from "./dashboard/index.vue";
import Products from "./products/index.vue";
import Analytics from "./analytics/index.vue";
import Reddit from "./reddit/index.vue";
import Chewy from "./chewy/index.vue";

const activeTab = ref("Dashboard");

const dashboardRef = ref<typeof Dashboard>(null);
const productsRef = ref<typeof Products>(null);
const analyticsRef = ref<typeof Analytics>(null);

const handleTabClick = (tab: any) => {
  // console.log("点击了", tab);
  if (tab.props.label === activeTab.value) return;
  activeTab.value = tab.props.label;

  if (tab.props.label === "Dashboard") {
    dashboardRef.value?.initComponent();
  } else if (tab.props.label === "Products") {
    productsRef.value?.initComponent();
  } else if (tab.props.label === "Analytics") {
    analyticsRef.value?.initComponent();
  }
};
</script>

<template>
  <el-tabs
    v-model="activeTab"
    type="border-card"
    class="peidi-el-tabs-modern-tabs"
    @tab-click="tab => handleTabClick(tab)"
  >
    <el-tab-pane label="Dashboard" name="Dashboard" lazy>
      <Dashboard ref="dashboardRef" />
    </el-tab-pane>
    <el-tab-pane label="Products" name="Products" lazy>
      <Products ref="productsRef" />
    </el-tab-pane>
    <el-tab-pane label="Analytics" name="Analytics" lazy>
      <Analytics ref="analyticsRef" />
    </el-tab-pane>
    <el-tab-pane label="Reddit Insights" name="Reddit" lazy>
      <Reddit />
    </el-tab-pane>
    <el-tab-pane label="Chewy Market" name="Chewy" lazy>
      <Chewy />
    </el-tab-pane>
  </el-tabs>
</template>
