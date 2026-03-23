<script setup lang="ts">
import {
  getBiProductNameList,
  createBiProductName,
  updateBiProductName,
  deleteBiProductName
} from "@/api/littleRedBook";
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, ref } from "vue";
import EpPlus from "~icons/ep/plus";
import EpSearch from "~icons/ep/search";
import DetailDialog from "./detailDialog.vue";

// 详情弹窗引用
const detailDialogRef = ref(null);

const tableData = ref([]);

const searchValue = ref<string>("");
const filteredTableData = computed(() => {
  // console.log("searchValue.value:", searchValue.value);
  if (!searchValue.value) {
    return tableData.value;
  }
  return tableData.value.filter(item => {
    return (
      item.productId?.includes(searchValue.value) ||
      item.productName?.includes(searchValue.value) ||
      item.type?.includes(searchValue.value)
    );
  });
});

//#region 请求相关
const fetchBiProductNameList = () => {
  getBiProductNameList()
    .then((res: any) => {
      if (res?.code === 200) {
        console.log("获取bi_product_name_list数据:", res?.data);
        tableData.value = res?.data?.reverse() || [];
      } else {
        ElMessage.error("获取bi_product_name_list数据失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取bi_product_name_list数据失败:" + error?.message);
    });
};

const fetchAddBiProductName = (data: any, callback?: () => void) => {
  createBiProductName(data)
    .then((res: any) => {
      if (res?.code === 200) {
        ElMessage.success("新增成功");
        callback?.();
        fetchBiProductNameList();
      } else {
        ElMessage.error("新增失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("新增失败:" + error?.message);
    });
};

const fetchUpdateBiProductName = (data: any, callback?: () => void) => {
  updateBiProductName(data)
    .then((res: any) => {
      if (res?.code === 200) {
        ElMessage.success("修改成功");
        callback?.();
        fetchBiProductNameList();
      } else {
        ElMessage.error("修改失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("修改失败:" + error?.message);
    });
};

const fetchDeleteBiProductName = (data: any, callback?: () => void) => {
  deleteBiProductName(data)
    .then((res: any) => {
      if (res?.code === 200) {
        ElMessage.success("删除成功");
        callback?.();
      } else {
        ElMessage.error("删除失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("删除失败:" + error?.message);
    });
};
//#endregion

onMounted(() => {
  fetchBiProductNameList();
});

const handleAddProduct = () => {
  // 打开新增产品弹窗
  detailDialogRef.value.showUploadDialog("add");
};

// 处理编辑产品
const handleEditProduct = (row: any) => {
  // console.log("编辑产品:", row);
  // 打开编辑产品弹窗
  detailDialogRef.value.showUploadDialog("edit");
  // 必须等待弹窗显示后再初始化数据 不然resetFields达到预期效果
  // 初始化弹窗数据
  detailDialogRef.value.initUploadDialog(row);
};

const handleDeleteProduct = (row: any) => {
  // console.log("删除产品:", row);
  // 确认删除
  ElMessageBox.confirm(
    `确认删除【${row.productId}-${row.productName}-${row.type}】吗？`,
    "删除产品",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    fetchDeleteBiProductName({ id: row.id }, () => {
      fetchBiProductNameList();
    });
  });
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <el-input
        v-model="searchValue"
        style="width: 480px"
        placeholder="搜索商品ID、品名、类型..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />
      <el-button type="primary" :icon="EpPlus" @click="handleAddProduct">
        新增数据
      </el-button>
    </div>

    <div class="mt-[20px]">
      <el-table
        :data="filteredTableData"
        size="small"
        :header-cell-style="{ color: '#0a0a0a' }"
        :height="650"
      >
        <el-table-column prop="productId" label="商品ID" width="" />
        <el-table-column prop="productName" label="品名" width="" />
        <el-table-column prop="type" label="类型" width="" />

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
      :addFn="fetchAddBiProductName"
      :updateFn="fetchUpdateBiProductName"
    />
  </div>
</template>
