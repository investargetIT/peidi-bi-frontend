<script setup lang="ts">
import { inject, reactive, ref } from "vue";
import NormalForm from "./normalForm.vue";
export type DialogType = "add" | "edit";

const dialogVisible = ref(false);
const formData = ref({});
// 数据详情弹窗类型 - 类型是枚举 add | edit
const dialogType = ref<DialogType>("add");

// 数据详情弹窗 -显示事件
const showDataDialog = (type: DialogType = "add") => {
  dialogType.value = type;
  dialogVisible.value = true;
};
// 数据详情弹窗 -关闭事件
const closeDataDialog = () => {
  dialogVisible.value = false;
};

// 数据详情弹窗 -初始化事件
const initDataDialog = (data: Record<string, any>) => {
  formData.value = JSON.parse(JSON.stringify(data));
};
// 暴露方法
defineExpose({
  showDataDialog,
  closeDataDialog,
  initDataDialog
});

const normalFormRef = ref();
// 数据详情弹窗 -关闭前事件
const handleBeforeClose = () => {
  // console.log("数据详情弹窗关闭前事件触发");
  // 为了解决点击x 关闭弹窗时，表单数据未清空的问题
  normalFormRef.value?.clearForm();
};

// 获取分页数据方法
const fetchMilvusPage = inject<() => void>("fetchMilvusPage");
// 成功提交表单事件
const handleNormalFormSubmit = () => {
  // 刷新分页数据
  fetchMilvusPage();
  // 关闭弹窗
  closeDataDialog();
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    width="512"
    :close-on-click-modal="false"
    @closed="handleBeforeClose"
  >
    <!-- 弹窗标题 -->
    <template #header="{ titleId }">
      <div :id="titleId">
        <div class="text-[18px] font-bold text-[#09090B]">
          {{ dialogType === "add" ? "添加向量数据" : "编辑向量数据" }}
        </div>
        <div class="text-[14px] text-[#71717a] mt-[5px]">
          {{
            dialogType === "add"
              ? "向集合中添加新的向量数据"
              : "修改向量数据的元数据信息"
          }}
        </div>
      </div>
    </template>
    <!-- 表单组件 -标准 -->
    <NormalForm
      ref="normalFormRef"
      :cancel-callback="closeDataDialog"
      :save-callback="handleNormalFormSubmit"
      :form-data="formData"
      :form-type="dialogType"
    />
  </el-dialog>
</template>
