<script setup lang="ts">
import { ref } from "vue";
import Stars from "./stars.svg";

const dialogVisible = ref(false);

const showUploadDialog = () => {
  dialogVisible.value = true;
};

const closeUploadDialog = () => {
  dialogVisible.value = false;
};
// 暴露方法
defineExpose({
  showUploadDialog,
  closeUploadDialog
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="Upload Products"
    width="700"
    :close-on-click-modal="false"
  >
    <span
      >Upload product images and extract key information automatically. Multiple
      products per image supported.</span
    >
    <el-card shadow="never" style="border-radius: 10px; margin-top: 20px">
      <!-- 标题 -->
      <div class="text-[16px] font-[600] text-[#0a0a0a]">Upload Images</div>
      <span class="text-[#737373]">
        Select product images from e-commerce sites. The system will detect all
        products in each image.</span
      >
      <!-- 上传组件 -->
      <el-upload
        :disabled="true"
        class="upload-demo mt-[20px]"
        drag
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">PNG, JPG, WebP up to 10MB</div>
        </template>
      </el-upload>
      <!-- 上传按钮 -->
      <el-button
        :disabled="true"
        style="width: 100%; margin-top: 20px"
        color="#000"
        type="primary"
        :icon="Stars"
        size="large"
        >Detect & Extract Products</el-button
      >
      <!-- 备注 -->
      <el-card shadow="never" style="border-radius: 5px; margin-top: 20px">
        <div class="text-[14px] font-[600] text-[#737373]">
          Smart Detection:
        </div>
        <div class="text-[12px] font-[400] text-[#737373]">
          The system automatically detects all products in your image and
          creates individual entries for each one.
        </div>
      </el-card>
    </el-card>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          style="width: 100px; margin-left: 12px"
          color="#000"
          type="primary"
          @click="closeUploadDialog"
          >Close</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>
