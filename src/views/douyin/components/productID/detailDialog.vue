<script setup lang="ts">
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, nextTick, reactive, ref } from "vue";
import type { ProductInfo } from "./index.vue";

// props
const props = defineProps({
  // 更新商品类别对应关系方法
  fetchDouyinVideoTypeUpdateType: {
    type: Function,
    required: true
  }
});

const loading = ref(false);
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
// 弹窗标题
const dialogTitle = computed(() => {
  return dialogType.value === "add" ? "新增商品" : "编辑商品";
});

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<ProductInfo>({
  id: null,
  productId: "",
  productName: "",
  salesType: ""
});
const rules = reactive<FormRules<ProductInfo>>({
  productId: [
    { required: true, message: "请输入商品ID", trigger: "blur" },
    // 商品ID只能是数字
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!/^\d+$/.test(value)) {
          callback(new Error("商品ID只能是数字"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  productName: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  salesType: [{ required: true, message: "请输入销售类型", trigger: "change" }]
});

// 显示弹窗
const showUploadDialog = (type: "add" | "edit") => {
  dialogType.value = type;
  dialogVisible.value = true;
};

// 关闭弹窗
const closeUploadDialog = () => {
  // 重置表单数据
  ruleFormRef.value?.resetFields();
  dialogVisible.value = false;
};

// 初始化表单数据
const initUploadDialog = (row: ProductInfo) => {
  nextTick(() => {
    Object.assign(ruleForm, row);
  });
};

// 处理保存
const handleSave = async () => {
  await ruleFormRef.value?.validate();
  loading.value = true;
  // 调用更新商品类别对应关系接口 传入回调函数 刷新列表
  await props.fetchDouyinVideoTypeUpdateType(
    ruleForm,
    () => {
      if (dialogType.value === "add") {
        ElMessage({
          message: "新增商品成功",
          type: "success"
        });
      }
      if (dialogType.value === "edit") {
        ElMessage({
          message: "编辑商品成功",
          type: "success"
        });
      }
      loading.value = false;
    },
    () => {
      loading.value = false;
    }
  );
};

// 暴露方法
defineExpose({
  showUploadDialog,
  closeUploadDialog,
  initUploadDialog
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500"
    :close-on-click-modal="false"
    :before-close="closeUploadDialog"
  >
    <!-- 商品信息表单 -->
    <el-form
      ref="ruleFormRef"
      style="max-width: 600px"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
    >
      <el-form-item label="商品ID" prop="productId">
        <el-input v-model="ruleForm.productId" placeholder="请输入商品ID" />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-input v-model="ruleForm.productName" placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item label="销售类型" prop="salesType">
        <el-input v-model="ruleForm.salesType" placeholder="请输入销售类型" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeUploadDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  font-weight: normal;
}
</style>
