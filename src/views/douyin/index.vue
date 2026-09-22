<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import DouyinReport from "./components/douyinReport/index.vue";
import InfluencerProfit from "./components/influencerProfit/index.vue";
import ExpertContract from "./components/expertContract/index.vue";
import QianChuan from "./components/qianChuan/index.vue";
import WeeklyConfig from "./components/weeklyConfig/index.vue";
// 旧模块暂时隐藏
// import DailyPerformance from "./components/dailyPerformance/index.vue";
// import ShortVideo from "./components/shortVideo/index.vue";
// import BusinessRelatedExpert from "./components/businessRelatedExpert/index.vue";
// import ProductID from "./components/productID/index.vue";
// import HeroiconsQuestionMarkCircle20Solid from "~icons/heroicons/question-mark-circle-20-solid";

const STORAGE_KEY = "douyin-active-tab";
const tabs = [
  "抖音周报",
  "利润表",
  "达人合同",
  "千川投流",
  "费用配置"
] as const;
const activeTab = ref<string>(tabs[0]);

// 初始化时从本地存储获取tab
const initFromStorage = () => {
  const savedTab = localStorage.getItem(STORAGE_KEY);
  if (savedTab && tabs.includes(savedTab as any)) {
    activeTab.value = savedTab;
  } else {
    activeTab.value = tabs[0];
  }
};

// 监听tab变化，保存到本地存储
watch(activeTab, newTab => {
  localStorage.setItem(STORAGE_KEY, newTab);
});

// 组件挂载时初始化
onMounted(() => {
  initFromStorage();
});
</script>

<template>
  <div class="peidi-douyin">
    <el-tabs
      v-model="activeTab"
      type="border-card"
      class="peidi-el-tabs-modern-tabs"
    >
      <el-tab-pane label="抖音周报" name="抖音周报">
        <DouyinReport v-if="activeTab === '抖音周报'" />
      </el-tab-pane>
      <el-tab-pane label="利润表" name="利润表">
        <InfluencerProfit v-if="activeTab === '利润表'" />
      </el-tab-pane>
      <el-tab-pane label="达人合同" name="达人合同">
        <ExpertContract v-if="activeTab === '达人合同'" />
      </el-tab-pane>
      <el-tab-pane label="千川投流" name="千川投流">
        <QianChuan v-if="activeTab === '千川投流'" />
      </el-tab-pane>
      <el-tab-pane label="费用配置" name="费用配置">
        <WeeklyConfig v-if="activeTab === '费用配置'" />
      </el-tab-pane>
      <!-- 旧模块暂时隐藏
      <el-tab-pane lazy>
        <template #label>
          <div class="flex items-center justify-center">
            每日业绩数据
            <el-tooltip
              class="box-item"
              effect="dark"
              content="每天上午10点之前更新数据（节假日除外）"
              placement="top"
            >
              <HeroiconsQuestionMarkCircle20Solid />
            </el-tooltip>
          </div>
        </template>
        <DailyPerformance />
      </el-tab-pane>
      <el-tab-pane lazy>
        <template #label>
          <div class="flex items-center justify-center">
            短视频数据
            <el-tooltip
              class="box-item"
              effect="dark"
              content="每天下午2点左右更新数据（节假日除外）"
              placement="top"
            >
              <HeroiconsQuestionMarkCircle20Solid />
            </el-tooltip>
          </div>
        </template>
        <ShortVideo />
      </el-tab-pane>
      <el-tab-pane label="商务对应达人文档" lazy>
        <BusinessRelatedExpert />
      </el-tab-pane>
      <el-tab-pane label="短视频带货商品ID" lazy>
        <ProductID />
      </el-tab-pane>
      -->
    </el-tabs>
  </div>
</template>
