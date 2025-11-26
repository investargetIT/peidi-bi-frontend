<script setup lang="ts">
import EpDownload from "~icons/ep/download";
import { UploadFilled } from "@element-plus/icons-vue";
import { formatToken, getToken } from "@/utils/auth";
import { ElMessage } from "element-plus";

const handleDownload = () => {
  // 处理下载逻辑 下载/static/抖音模板.xlsx
  // 创建隐藏的下载链接并触发点击
  // 特别注意：项目是放到pms.peidigroup.cn域名下的，文件需要放在/pms/static目录下
  const link = document.createElement("a");
  link.href = "/static/佩蒂BI抖音模板.xlsx";
  link.download = "佩蒂BI抖音模板.xlsx"; // 设置下载的文件名
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const beforeAvatarUpload = (file: File) => {
  const isExcel = file.name.endsWith(".xlsx");
  if (!isExcel) {
    ElMessage.error("上传文件格式错误，请上传xlsx文件");
  }
  return isExcel;
};

const handleAvatarSuccess = (res: any) => {
  if (res.code === 200) {
    ElMessage.success("上传成功");
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
};

const handleAvatarError = (err: any) => {
  ElMessage.error(err.msg || "上传失败");
};
</script>

<template>
  <!-- 模板下载 -->
  <el-button type="primary" :icon="EpDownload" @click="handleDownload"
    >模板下载</el-button
  >

  <el-upload
    class="upload-demo mt-[40px]"
    drag
    action="https://api.peidigroup.cn/oms/bi/douyin-sales/account-upload"
    multiple
    :headers="{ Authorization: formatToken(getToken().accessToken) }"
    :before-upload="beforeAvatarUpload"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :on-error="handleAvatarError"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">拖拽文件 或 <em>点击上传</em></div>
    <template #tip>
      <div class="el-upload__tip">仅支持xlsx文件</div>
    </template>
  </el-upload>
</template>
