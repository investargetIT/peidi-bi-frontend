<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  getBiMidProductMappingList,
  postBiMidProductMappingNew,
  postBiMidProductMappingUpdate,
  postBiMidProductMappingDelete,
  type MidProductInfo
} from "@/api/sitePromotion";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit } from "@element-plus/icons-vue";
import DetailDialog from "./detailDialog.vue";
import EpPlus from "~icons/ep/plus";
import EpSearch from "~icons/ep/search";

// 详情弹窗引用
const detailDialogRef = ref(null);

const midProductMappingList = ref([]);

const searchValue = ref<string>("");
const filteredMidProductMappingList = computed(() => {
  // console.log("searchValue.value:", searchValue.value);
  if (!searchValue.value) {
    return midProductMappingList.value;
  }
  return midProductMappingList.value.filter(item => {
    return (
      item.productId.includes(searchValue.value) ||
      item.productLine.includes(searchValue.value) ||
      item.productShortName.includes(searchValue.value)
    );
  });
});

//#region 请求相关
const fetchMidProductMappingList = () => {
  return getBiMidProductMappingList()
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("mid表:", res.data);
        midProductMappingList.value = res.data;
      } else {
        ElMessage.error("请求中间表失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("请求中间表失败:" + error.message);
    });
};

const fetchAddBiMidProductMapping = (
  data: MidProductInfo,
  callback?: () => void
) => {
  return postBiMidProductMappingNew(data)
    .then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("新增成功");
        callback?.();
        fetchMidProductMappingList();
      } else {
        ElMessage.error("新增失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("新增失败:" + error.message);
    });
};

const fetchUpdateBiMidProductMapping = (
  data: MidProductInfo,
  callback?: () => void
) => {
  return postBiMidProductMappingUpdate(data)
    .then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("更新成功");
        callback?.();
        fetchMidProductMappingList();
      } else {
        ElMessage.error("更新失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("更新失败:" + error.message);
    });
};

const fetchDeleteBiMidProductMapping = (data: { id: string | number }) => {
  return postBiMidProductMappingDelete(data)
    .then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("删除成功");
        fetchMidProductMappingList();
      } else {
        ElMessage.error("删除失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("删除失败:" + error.message);
    });
};
//#endregion

onMounted(async () => {
  await fetchMidProductMappingList();
});

const handleAddProduct = () => {
  // 打开新增产品弹窗
  detailDialogRef.value.showUploadDialog("add");
};

// 处理编辑产品
const handleEditProduct = (row: MidProductInfo) => {
  // console.log("编辑产品:", row);
  // 打开编辑产品弹窗
  detailDialogRef.value.showUploadDialog("edit");
  // 必须等待弹窗显示后再初始化数据 不然resetFields达到预期效果
  // 初始化弹窗数据
  detailDialogRef.value.initUploadDialog(row);
};

const handleDeleteProduct = (row: MidProductInfo) => {
  // console.log("删除产品:", row);
  // 确认删除
  ElMessageBox.confirm(`确认删除${row.productShortName}吗？`, "删除产品", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    fetchDeleteBiMidProductMapping({ id: row.id });
  });
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <el-input
        v-model="searchValue"
        style="width: 480px"
        placeholder="搜索产品ID、产品线、产品简称..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />
      <el-button type="primary" :icon="EpPlus" @click="handleAddProduct"
        >新增数据</el-button
      >
    </div>

    <div>
      <el-table
        style="margin-top: 20px"
        :data="filteredMidProductMappingList"
        size="small"
        :header-cell-style="{ color: '#0a0a0a' }"
      >
        <el-table-column prop="productId" label="产品ID" width="" />
        <el-table-column prop="productLine" label="产品线" width="" />
        <el-table-column prop="productShortName" label="产品简称" width="" />

        <el-table-column label="操作" min-width="120">
          <template #default="scope">
            <el-button
              link
              :icon="Edit"
              type="primary"
              @click="handleEditProduct(scope.row)"
            />
            <el-button
              link
              :icon="Delete"
              type="danger"
              @click="handleDeleteProduct(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情弹窗 -->
    <DetailDialog
      ref="detailDialogRef"
      :addFn="fetchAddBiMidProductMapping"
      :updateFn="fetchUpdateBiMidProductMapping"
    />
  </div>
</template>
