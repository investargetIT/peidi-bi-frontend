<script setup lang="ts">
import { ref } from "vue";
import { getBiRfm, type GetBiRfmParams } from "@/api/rfm";
import SearchBar from "@/views/RFM/components/searchBar/index.vue";
import LoadingCard from "@/views/RFM/components/loadingCard/index.vue";
import DataCard from "@/views/RFM/components/dataCard/index.vue";
import { message } from "@/utils/message";
// import response_debug from "./response_debug.json";

const isFirstLoad = ref(true);
const loading = ref(false);
const dataList = ref<Record<string, any>>({});

// 重置数据
const resetData = () => {
  isFirstLoad.value = true;
  dataList.value = {};
};

//#region 请求逻辑
// 获取rfm模型
const fetchBiRfm = (params: GetBiRfmParams) => {
  isFirstLoad.value = false;
  // dataList.value = response_debug.data;

  loading.value = true;
  getBiRfm(params)
    .then((res: any) => {
      // console.log("获取rfm模型", res);
      if (res.code === 200) {
        dataList.value = res.data;
      } else {
        message(res.msg || "获取rfm模型失败", { type: "error" });
      }
    })
    .catch(err => {
      message(err.message || "获取rfm模型失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};
//#endregion
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px">
      <!-- 样本说明 -->
      <el-alert
        title="样本说明：订单数据来自数云系统，用户聚合也是通过数云系统"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 10px; color: #606266"
      />
      <!-- 搜索栏 -->
      <SearchBar :submit="fetchBiRfm" :loading="loading" :reset="resetData" />
      <el-divider />
      <!-- 加载动效 -->
      <LoadingCard v-show="loading" />
      <!-- 图表区域 -->
      <DataCard v-show="!loading && !isFirstLoad" :dataList="dataList" />
    </el-card>
  </div>
</template>
