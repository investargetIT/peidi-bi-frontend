<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import IncomePro from "@/views/incomePro/index.vue";
import OperationAnalysis from "@/views/operationAnalysis/index.vue";
import { storageLocal } from "@pureadmin/utils";

const activeName = ref("incomePro");

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
      <el-tab-pane label="业绩实时监控" name="incomePro" lazy>
        <IncomePro v-if="activeName === 'incomePro'" />
      </el-tab-pane>
      <el-tab-pane label="经营分析" name="operationAnalysis" lazy>
        <OperationAnalysis v-if="activeName === 'operationAnalysis'" />
      </el-tab-pane>
    </el-tabs>
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
