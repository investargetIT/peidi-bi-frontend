<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import EpFolderAdd from "~icons/ep/folder-add";
import { getCommonEnum, postCommonEnum } from "@/api/vdb";
import { message } from "@/utils/message";

const tableData = ref<any>([
  // {
  //   id: 112,
  //   value: "检测报告",
  //   type: "reportType"
  // }
]);

// 请求报告类型
const fetchReportTypeEnum = () => {
  getCommonEnum("reportType")
    .then((res: any) => {
      if (res?.code === 200) {
        // 处理成功逻辑
        tableData.value = res?.data || [];
      } else {
        // 处理失败逻辑
        message("请求报告类型失败", { type: "error" });
      }
    })
    .catch(() => {
      // 处理失败逻辑
      message("请求报告类型失败", { type: "error" });
    });
};

onMounted(() => {
  fetchReportTypeEnum();
});

//#region 文档类型管理添加逻辑
const dialogFormVisible = ref(false);
const form = reactive({
  name: ""
});
const formRef = ref<any>(null);
const rules = reactive({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
});

const handleSave = () => {
  formRef.value.validate((valid: any) => {
    if (valid) {
      // 处理表单提交逻辑
      postCommonEnum(
        JSON.stringify([
          {
            type: "reportType",
            value: form.name
          }
        ])
      )
        .then((res: any) => {
          if (res?.code === 200) {
            // 处理成功逻辑
            message("添加成功", { type: "success" });
            dialogFormVisible.value = false;
            // fetchReportTypeEnum();
            // 刷新页面
            window.location.reload();
          } else {
            // 处理失败逻辑
            message("添加失败", { type: "error" });
          }
        })
        .catch(() => {
          // 处理失败逻辑
          message("添加失败", { type: "error" });
        });
    } else {
      message("请填写完整信息", { type: "warning" });
    }
  });
};

// 监听文档类型管理弹窗关闭事件
watch(dialogFormVisible, (newVal: boolean) => {
  if (!newVal) {
    // 重置表单
    formRef.value.resetFields();
  }
});
//#endregion
</script>

<template>
  <div>
    <!-- 文档类型管理头部 -->
    <div class="flex justify-between items-center mb-[30px]">
      <div class="text-[20px] font-bold">文档类型管理</div>
      <div>
        <el-button
          type="primary"
          :icon="EpFolderAdd"
          @click="dialogFormVisible = true"
          >添加文档类型</el-button
        >
      </div>
    </div>
    <!-- 文档类型管理表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      :header-cell-style="{ color: '#000' }"
    >
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="value" label="名称" />
      <!-- <el-table-column prop="type" label="Type" /> -->
    </el-table>
    <!-- 文档类型管理弹窗 -->
    <el-dialog v-model="dialogFormVisible" title="添加文档类型" width="500">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave"> 保存 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  color: #09090b;
}
</style>
