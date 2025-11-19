<script setup lang="ts">
import TableCard from "./tableCard/index.vue";
import OperationBar from "./operationBar/index.vue";
import UploadDialog from "./uploadDialog/index.vue";

import MynauiUploadSolid from "~icons/mynaui/upload-solid";
import { ref } from "vue";

const uploadDialogRef = ref<typeof UploadDialog>(null);

const handleUploadClick = () => {
  uploadDialogRef.value?.showUploadDialog();
};
</script>

<template>
  <!-- 标题 -->
  <div class="flex justify-between items-center">
    <div class="text-[36px] font-bold text-[#0a0a0a] mb-[20px]">
      Global Pet Food Intelligence
    </div>
    <el-button
      style="width: 200px; margin-left: 12px"
      color="#000"
      :icon="MynauiUploadSolid"
      @click="handleUploadClick"
      >Upload Products</el-button
    >
  </div>

  <!-- 搜索卡片 -->
  <div class="mb-[20px]"><OperationBar /></div>
  <!-- 列表卡片 -->
  <TableCard />

  <!-- 上传弹窗 -->
  <UploadDialog ref="uploadDialogRef" />
</template>
