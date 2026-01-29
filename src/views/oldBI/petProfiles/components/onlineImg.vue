<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { imageCache } from "../utils/imageCache";
import {
  Download,
  Refresh,
  RefreshLeft,
  ZoomIn,
  ZoomOut
} from "@element-plus/icons-vue";

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: "120px"
  }
});

const imageUrl = ref("");
const loading = ref(true);

/**
 * 将图片URL转换为base64格式
 * @param imageUrl 图片URL
 * @returns Promise<string> base64数据
 */
const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // 允许跨域

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);

      try {
        const base64 = canvas.toDataURL("image/jpeg", 1.0); // 质量设为1.0，不压缩
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };

    img.src = imageUrl;
  });
};

/**
 * 加载并缓存图片
 */
const loadAndCacheImage = async (url: string) => {
  try {
    // 检查缓存中是否已有该图片
    const cachedImage = await imageCache.getImage(url, "originalBlob");

    if (cachedImage) {
      // 从缓存中获取
      imageUrl.value = cachedImage;
      loading.value = false;
    } else {
      // 缓存中没有，从网络加载并缓存
      const base64Data = await imageUrlToBase64(url);

      // 存储到缓存（原图和压缩图使用相同数据，不压缩）
      await imageCache.storeImage(url, base64Data, base64Data);

      imageUrl.value = base64Data;
      loading.value = false;
    }
  } catch (error) {
    console.error("图片加载失败:", error);
    ElMessage.error("图片加载失败");
    loading.value = false;
  }
};

// 监听url变化
watch(
  () => props.url,
  async newVal => {
    imageUrl.value = "";
    loading.value = true;

    if (!newVal) {
      loading.value = false;
      return;
    }

    await loadAndCacheImage(newVal);
  },
  {
    immediate: true
  }
);

// 下载图片
const handleDownload = async () => {
  const message = ElMessage({
    message: "下载中...",
    duration: 0
  });

  try {
    // 从缓存获取图片数据
    const imageData = await imageCache.getImage(props.url, "originalBlob");

    if (imageData) {
      // 将base64转换为blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const filename = `image_${Date.now()}.jpg`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.close();
      ElMessage.success("下载完成");
    } else {
      message.close();
      ElMessage.error("图片数据不存在");
    }
  } catch (error) {
    message.close();
    ElMessage.error("下载失败");
    console.error("下载失败:", error);
  }
};
</script>

<template>
  <el-skeleton
    :style="{ width: props.size, height: props.size }"
    :loading="loading"
    animated
  >
    <template #template>
      <el-skeleton-item
        variant="image"
        :style="{ width: props.size, height: props.size }"
      />
    </template>
    <template #default>
      <el-image
        :src="imageUrl"
        fit="contain"
        preview-teleported
        :previewSrcList="[imageUrl]"
        :style="{ width: props.size, height: props.size }"
      >
        <template
          #toolbar="{ actions, prev, next, reset, activeIndex, setActiveItem }"
        >
          <el-icon @click="actions('zoomOut')">
            <ZoomOut />
          </el-icon>
          <el-icon
            @click="
              actions('zoomIn', {
                enableTransition: false,
                zoomRate: 2
              })
            "
          >
            <ZoomIn />
          </el-icon>
          <el-icon @click="actions('anticlockwise')">
            <RefreshLeft />
          </el-icon>
          <el-icon @click="reset">
            <Refresh />
          </el-icon>
          <el-icon @click="handleDownload">
            <Download />
          </el-icon>
        </template>
      </el-image>
    </template>
  </el-skeleton>
</template>
