<script setup lang="ts">
import {
  getBiDouyinVideoType,
  postBiDouyinVideoTypeUpdateType
} from "@/api/douyin";
import { computed, onMounted, ref } from "vue";
import EpPlus from "~icons/ep/plus";
import EpSearch from "~icons/ep/search";
import DetailDialog from "./detailDialog.vue";
import { log } from "console";
import { ElMessage } from "element-plus";

// 商品信息类型定义
export interface ProductInfo {
  id: number;
  productId: string;
  productName: string;
  salesType: string;
}
// 详情弹窗引用
const detailDialogRef = ref<typeof DetailDialog>();

// 抖音商品类别列表 -源数据
const productIDList = ref<ProductInfo[]>([]);
const filteredProductIDList = computed(() => {
  if (!searchValue.value) {
    return productIDList.value;
  }
  return productIDList.value.filter(item => {
    item.productName.includes(searchValue.value) ||
      item.salesType.includes(searchValue.value) ||
      item.productId.includes(searchValue.value);
  });
});
const searchValue = ref<string>("");

//#region 请求逻辑
// 获取所有抖音商品类别
const fetchDouyinVideoType = async () => {
  const res: any = await getBiDouyinVideoType();
  if (res.code === 200) {
    console.log("抖音商品类别:", res.data || []);
    productIDList.value = res.data || [];
  }
};
// 更新抖音商品类别对应关系
const fetchDouyinVideoTypeUpdateType = async (
  data: ProductInfo,
  callback: () => void, // 成功回调函数
  errorCallback: () => void // 失败回调函数
) => {
  try {
    const res: any = await postBiDouyinVideoTypeUpdateType(data);
    if (res.code === 200) {
      console.log("更新抖音商品类别对应关系:", res.data || []);
      // 执行回调函数
      callback();
      detailDialogRef.value.closeUploadDialog();
      // 刷新列表
      fetchDouyinVideoType();
    } else {
      throw new Error(res.message || "操作失败");
    }
  } catch (error) {
    // 执行失败回调函数
    errorCallback();
    ElMessage({
      message: error.message || "操作失败",
      type: "error"
    });
  }
};
//#endregion

onMounted(() => {
  fetchDouyinVideoType();
});

const handleAddProduct = () => {
  // 打开新增商品弹窗
  detailDialogRef.value.showUploadDialog("add");
};

// 处理编辑商品
const handleEditProduct = (row: ProductInfo) => {
  console.log("编辑商品:", row);
  // 打开编辑商品弹窗
  detailDialogRef.value.showUploadDialog("edit");
  // 必须等待弹窗显示后再初始化数据 不然resetFields达到预期效果
  // 初始化弹窗数据
  detailDialogRef.value.initUploadDialog(row);
};
</script>

<template>
  <!-- 操作栏 -->
  <div class="flex items-center justify-between">
    <el-input
      v-model="searchValue"
      style="width: 480px"
      placeholder="搜索商品ID、商品名称、销售类型..."
      class="mr-[20px]"
      :prefix-icon="EpSearch"
      clearable
    />
    <el-button type="primary" :icon="EpPlus" @click="handleAddProduct"
      >新增商品</el-button
    >
  </div>

  <!-- 列表 -->
  <el-table
    style="margin-top: 20px"
    :data="filteredProductIDList"
    :header-row-style="{ color: '#09090b' }"
    size="small"
    border
    height="720"
  >
    <el-table-column prop="productId" label="商品ID" width="180" />
    <el-table-column prop="productName" label="商品名称" width="240" />
    <el-table-column prop="salesType" label="销售类型" width="120" />
    <!-- 操作列 -->
    <el-table-column label="操作" min-width="120">
      <template #default="scope">
        <el-button
          link
          type="primary"
          size="small"
          @click.prevent="handleEditProduct(scope.row)"
          >编辑</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <!-- 详情弹窗 -->
  <DetailDialog
    ref="detailDialogRef"
    :fetchDouyinVideoTypeUpdateType="fetchDouyinVideoTypeUpdateType"
  />
</template>
