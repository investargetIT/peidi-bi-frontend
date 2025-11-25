<script setup lang="ts">
import TableCard from "./tableCard/index.vue";
import OperationBar from "./operationBar/index.vue";
import UploadDialog from "./uploadDialog/index.vue";
import MynauiUploadSolid from "~icons/mynaui/upload-solid";
import { onMounted, provide, ref, watch } from "vue";
import { getAiIntelligenceProductPage, type ProductNewData } from "@/api/ppi";

const uploadDialogRef = ref<typeof UploadDialog>(null);

const handleUploadClick = () => {
  uploadDialogRef.value?.showUploadDialog();
};

//#region 列表数据相关
// 产品列表
const tableData = ref<ProductNewData[]>([]);
// 分页
const pagination = ref({
  pageNo: 1,
  pageSize: 20,
  pageTotal: 0
});
// 搜索内容对象
const searchContent = ref({
  title: ""
});
// 拼接搜索参数
const getSearchStr = () => {
  const searchStr = [];
  if (searchContent.value.title) {
    searchStr.push({
      searchName: "title",
      searchType: "like",
      searchValue: `${searchContent.value.title}`
    });
  }
  return JSON.stringify(searchStr);
};
//#endregion

//#region 排序逻辑
// 请求的排序参数
const sortStr = ref<{ sortName: string; sortType: string }[]>([]);
// 处理排序事件
function handleSortChange(column: any) {
  console.log("column", column);
  // 处理排序逻辑
  if (column.column.sortable === "custom") {
    // 自定义排序逻辑
    // 这里可以根据 column.prop 来判断是哪个列在排序
    // 并根据 column.order 来判断排序方向（ascending 或 descending）
    // 最后更新表格数据即可
    if (!column.order) {
      sortStr.value = [];
    }
    if (column.order === "descending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "desc"
        }
      ];
    }
    if (column.order === "ascending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "asc"
        }
      ];
    }
    fetchProductPage();
  }
}
// 往子组件提供排序方法handleSortChange
provide("handleSortChange", handleSortChange);
//#endregion

//#region 请求逻辑
// 分页获取产品信息
const fetchProductPage = () => {
  getAiIntelligenceProductPage({
    pageNo: pagination.value.pageNo,
    pageSize: pagination.value.pageSize,
    searchStr: getSearchStr(),
    sortStr: JSON.stringify(sortStr.value)
  }).then((res: any) => {
    // console.log("获取产品列表成功", res);

    // 如果当前页大于总页数，重置为最后一页 排除总页数为0的情况
    if (res.data?.current > res.data?.pages && res.data?.total !== 0) {
      pagination.value.pageNo = res.data?.pages;
      return;
    }

    // 更新总页数
    pagination.value.pageTotal = res.data?.total || 0;

    tableData.value = res.data?.records || [];
  });
};
// 往子组件提供请求方法fetchProductPage
provide("fetchProductPage", fetchProductPage);
//#endregion

onMounted(() => {
  fetchProductPage();
});

// 监听分页参数变化
watch(
  () => [pagination.value.pageNo, pagination.value.pageSize],
  () => {
    fetchProductPage();
  }
);
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
  <div class="mb-[20px]">
    <OperationBar v-model:searchContent="searchContent" />
  </div>
  <!-- 列表卡片 -->
  <TableCard v-model:pagination="pagination" :tableData="tableData" />

  <!-- 上传弹窗 -->
  <UploadDialog ref="uploadDialogRef" />
</template>
