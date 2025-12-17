<script setup lang="ts">
import { ref } from "vue";
import { getBiRfm, type GetBiRfmParams } from "@/api/rfm";
import SearchBar from "@/views/RFM/components/searchBar/index.vue";
import LoadingCard from "@/views/RFM/components/loadingCard/index.vue";
import DataCard from "@/views/RFM/components/dataCard/index.vue";
import { message } from "@/utils/message";

const loading = ref(false);
const dataList = ref([]);

// 重置数据
const resetData = () => {
  dataList.value = [];
};

//#region 请求逻辑
// 获取rfm模型
const fetchBiRfm = (params: GetBiRfmParams) => {
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
      <!-- 搜索栏 -->
      <SearchBar :submit="fetchBiRfm" :loading="loading" :reset="resetData" />
      <el-divider />
      <!-- 加载动效 -->
      <LoadingCard v-show="loading" />
      <!-- 图表区域 -->
      <DataCard v-show="!loading && dataList.length > 0" :dataList="dataList" />
    </el-card>
  </div>
</template>
