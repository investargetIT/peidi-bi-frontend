<script setup lang="ts">
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, nextTick, reactive, ref } from "vue";
import { type MidProductInfo } from "@/api/sitePromotion";

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
const ruleForm = reactive<MidProductInfo>({
  id: null,
  productId: "",
  productLine: "",
  productShortName: ""
});
const rules = reactive<FormRules<MidProductInfo>>({
  productId: [
    { required: true, message: "请输入产品ID", trigger: "blur" },
    // 产品ID只能是数字
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!/^\d+$/.test(value)) {
          callback(new Error("产品ID只能是数字"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  productLine: [{ required: true, message: "请输入产品线", trigger: "change" }],
  productShortName: [
    { required: true, message: "请输入产品简称", trigger: "change" }
  ]
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
const initUploadDialog = (row: MidProductInfo) => {
  nextTick(() => {
    Object.assign(ruleForm, row);
  });
};

// 处理保存
const handleSave = async () => {
  await ruleFormRef.value?.validate();
  loading.value = true;

  if (dialogType.value === "add") {
    await props.addFn(ruleForm, () => {
      closeUploadDialog();
    });
  }
  if (dialogType.value === "edit") {
    await props.updateFn(ruleForm, () => {
      closeUploadDialog();
    });
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
      <el-form-item label="产品ID" prop="productId">
        <el-input v-model="ruleForm.productId" placeholder="请输入产品ID" />
      </el-form-item>
      <el-form-item label="产品线" prop="productLine">
        <el-input v-model="ruleForm.productLine" placeholder="请输入产品线" />
      </el-form-item>
      <el-form-item label="产品简称" prop="productShortName">
        <el-input
          v-model="ruleForm.productShortName"
          placeholder="请输入产品简称"
        />
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
