<script setup lang="ts">
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, nextTick, reactive, ref } from "vue";

const TYPE_OPTIONS = [
  { label: "老品", value: "老品" },
  { label: "新品", value: "新品" }
];

// props
const props = defineProps({
  addFn: {
    type: Function,
    required: true
  },
  updateFn: {
    type: Function,
    required: true
  }
});

const loading = ref(false);
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
// 弹窗标题
const dialogTitle = computed(() => {
  return dialogType.value === "add" ? "新增数据" : "编辑数据";
});

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<any>({
  id: null,
  productId: "",
  productName: "",
  type: ""
});
const rules = reactive<FormRules<any>>({
  productId: [{ required: true, message: "请输入商品ID", trigger: "blur" }],
  productName: [{ required: true, message: "请输入品名", trigger: "blur" }],
  type: [{ required: true, message: "请选择类型", trigger: "change" }]
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
  loading.value = false;
};

// 初始化表单数据
const initUploadDialog = (row: any) => {
  nextTick(() => {
    Object.assign(ruleForm, row);
  });
};

// 处理保存
const handleSave = async () => {
  // await ruleFormRef.value?.validate();
  // loading.value = true;

  // if (dialogType.value === "add") {
  //   await props.addFn(ruleForm, () => {
  //     closeUploadDialog();
  //   });
  // }
  // if (dialogType.value === "edit") {
  //   await props.updateFn(ruleForm, () => {
  //     closeUploadDialog();
  //   });
  // }
  try {
    await ruleFormRef.value?.validate();
    loading.value = true;

    const submit = dialogType.value === "add" ? props.addFn : props.updateFn;
    await submit(ruleForm, closeUploadDialog);
  } finally {
    if (dialogVisible.value) loading.value = false;
  }
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
      <el-form-item label="品名" prop="productName">
        <el-input v-model="ruleForm.productName" placeholder="请输入品名" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="ruleForm.type" placeholder="请选择类型">
          <el-option
            v-for="item in TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
