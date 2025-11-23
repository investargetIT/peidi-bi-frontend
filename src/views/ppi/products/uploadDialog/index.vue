<script setup lang="ts">
import { ref } from "vue";
import Stars from "./stars.svg";
import { UploadFilled } from "@element-plus/icons-vue";
import ExtractedProductsCard from "../extractedProductsCard/index.vue";
import { commonUrlApi } from "@/api/ppi";
import { formatToken, getToken } from "@/utils/auth";
import { UploadFile, UploadInstance } from "element-plus";
import ApiConfig from "./apiConfig";
import { message } from "@/utils/message";
import { normalizeToArray } from "./utils";

export interface ExtractedProduct {
  id: string;
  title: string;
  star: number;
  reviewCnt: number;
  amount: number;
  longAmount: number;
  status?: "extracted" | "saved";
}

// 提取后的信息
const extractedProducts = ref<ExtractedProduct[]>([]);
// 提取后展示的图片
const extractedProductImages = ref<UploadFile[]>([]);

//#region 上传图片逻辑
const uploadLoading = ref(false);
const uploadRef = ref<UploadInstance>(null);
// 上传图片 文件列表
const uploadFileList = ref<UploadFile[]>([]);
// 上传图片 成功回调
const handleUploadSuccess = (res: any, file: UploadFile) => {
  console.log("上传图片 成功回调", res, file);
  uploadLoading.value = false;
  if (res?.code === 200) {
    message("Extracted successfully", { type: "success" });
    extractedProducts.value = normalizeToArray(res?.data || "");
    // 提取后展示的图片
    extractedProductImages.value = uploadFileList.value;
    // 清空文件列表
    uploadFileList.value = [];
    console.log("提取后展示的图片", extractedProductImages.value);
  } else {
    message(res.msg || "上传图片失败", { type: "error" });
  }
};
// 上传图片 错误回调
const handleUploadError = (err: any, file: UploadFile) => {
  uploadLoading.value = false;
  console.log("上传图片 错误回调", err);
  message("上传图片失败", { type: "error" });
};
// 上传图片 改变回调
const handleUploadChange = (file: UploadFile, fileList: UploadFile[]) => {
  console.log("上传图片 改变回调", file, fileList);
};
// 上传图片触发提交
const handleUploadClick = () => {
  uploadLoading.value = true;
  uploadRef.value?.submit();
};
//#endregion

const dialogVisible = ref(false);

const showUploadDialog = () => {
  dialogVisible.value = true;
};

const closeUploadDialog = () => {
  // 清空提取后的信息
  extractedProducts.value = [];
  // 清空提取后展示的图片
  extractedProductImages.value = [];
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
    :before-close="closeUploadDialog"
  >
    <span
      >Upload product images and extract key information automatically. Multiple
      products per image supported.</span
    >
    <el-card shadow="never" style=" margin-top: 20px;border-radius: 10px">
      <!-- 标题 -->
      <div class="text-[16px] font-[600] text-[#0a0a0a]">Upload Images</div>
      <span class="text-[#737373]">
        Select product images from e-commerce sites. The system will detect all
        products in each image.</span
      >
      <!-- 上传组件 -->
      <el-upload
        ref="uploadRef"
        v-model:file-list="uploadFileList"
        class="upload-demo mt-[20px]"
        drag
        accept=".png,.jpg,.jpeg,.webp"
        list-type="picture"
        :action="commonUrlApi('/ai/chewy/new')"
        :data="{
          prompt: JSON.stringify(ApiConfig.PROMPT_)
        }"
        :headers="{
          Authorization: formatToken(getToken().accessToken)
        }"
        :auto-upload="false"
        :limit="1"
        :multiple="false"
        :disabled="false"
        :on-success="handleUploadSuccess"
        :on-change="handleUploadChange"
        :on-error="handleUploadError"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            PNG, JPG, WebP up to 10MB.
            <em class="font-[600] text-[#000]">One image per upload.</em>
          </div>
        </template>
      </el-upload>
      <!-- 上传按钮 -->
      <el-button
        :loading="uploadLoading"
        :disabled="uploadFileList.length === 0"
        style="width: 100%; margin-top: 20px"
        color="#000"
        type="primary"
        :icon="Stars"
        size="large"
        @click="handleUploadClick"
        >Detect & Extract Products</el-button
      >
      <!-- 备注 -->
      <el-card shadow="never" style=" margin-top: 20px;border-radius: 5px">
        <div class="text-[14px] font-[600] text-[#737373]">
          Smart Detection:
        </div>
        <div class="text-[12px] font-[400] text-[#737373]">
          The system automatically detects all products in your image and
          creates individual entries for each one.
        </div>
      </el-card>
    </el-card>

    <!-- 提取产品卡片 -->
    <ExtractedProductsCard
      :extractedProducts="extractedProducts"
      :extractedProductImages="extractedProductImages"
    />

    <!-- 底部按钮 -->
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
