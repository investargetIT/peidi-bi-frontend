<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import IncomePro from "@/views/incomePro/index.vue";
import OperationAnalysis from "@/views/operationAnalysis/index.vue";
import IncomeDaily from "@/views/incomeDaily/index.vue";
import SettingsCard from "./components/settingsCard/index.vue";
import { storageLocal } from "@pureadmin/utils";
import NavBar from "./components/navBar/index.vue";

const STORAGE_KEY = "businessAnalysis_activeTab";
const activeName = ref<string>(storageLocal().getItem(STORAGE_KEY) as string || "incomeDaily");

//#region 陀螺仪逻辑
const USER_ID = (storageLocal().getItem("dataSource") as any)?.id;
const TLY = ref({
  x: 0,
  y: 0,
  z: 0
});

const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
  // console.log("Alpha (Z 轴):", event.alpha);
  // console.log("Beta (X 轴):", event.beta);
  // console.log("Gamma (Y 轴):", event.gamma);
  TLY.value.z = event.alpha;
  TLY.value.x = event.beta;
  TLY.value.y = event.gamma;
};
//#endregion

// 开发测试
const IS_DEBUG = computed(() =>
  [
    "1926449443739600965",
    "1850741012504838145",
    "1926449443739601629",
    "1846392647319093250",
    "1874011001523318785" // 王琳
  ].includes(USER_ID)
);

onMounted(() => {
  // if (window.DeviceOrientationEvent) {
  //   window.addEventListener("deviceorientation", handleDeviceOrientation, true);
  // } else {
  //   alert("您的设备不支持陀螺仪功能！");
  // }
});

onUnmounted(() => {
  // window.removeEventListener("deviceorientation", handleDeviceOrientation);
});

// 监听选项卡变化并保存到本地存储
watch(activeName, (newVal) => {
  storageLocal().setItem(STORAGE_KEY, newVal);
});
</script>

<template>
  <div class="p-0">
    <div
      v-if="USER_ID === '1926449443739600965' && false"
      class="peidi-businessAnalysis-debug"
    >
      <p>陀螺仪</p>
      <p>Beta (X 轴): {{ TLY.x.toFixed(2) }}</p>
      <p>Gamma (Y 轴): {{ TLY.y.toFixed(2) }}</p>
      <p>Alpha (Z 轴): {{ TLY.z.toFixed(2) }}</p>
    </div>

    <el-tabs
      v-model="activeName"
      type="border-card"
      class="peidi-el-tabs-modern-tabs"
    >
      <el-tab-pane label="业绩每日监控" name="incomeDaily" lazy>
        <IncomeDaily v-if="activeName === 'incomeDaily'" />
      </el-tab-pane>
      <!-- <el-tab-pane label="业绩每周监控" name="incomePro" lazy>
        <IncomePro v-if="activeName === 'incomePro'" :IS_EVERY_DAY="false" />
      </el-tab-pane> -->
      <el-tab-pane label="经营分析" name="operationAnalysis" lazy>
        <OperationAnalysis v-if="activeName === 'operationAnalysis'" />
      </el-tab-pane>
      <el-tab-pane v-if="IS_DEBUG" label="配置" name="settings" lazy>
        <SettingsCard v-if="activeName === 'settings'" />
      </el-tab-pane>
      <!-- <el-tab-pane
        label="业绩每周监控（日采集内测）"
        name="incomePro_day"
        lazy
        v-if="IS_DEBUG"
      >
        <IncomePro v-if="activeName === 'incomePro_day'" :IS_EVERY_DAY="true" />
      </el-tab-pane> -->
    </el-tabs>

    <NavBar />
  </div>
</template>

<style lang="scss" scoped>
.peidi-businessAnalysis-debug {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  padding: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #fff;
  background: rgb(0 0 0 / 70%);
  border-radius: 5px;
}
</style>
