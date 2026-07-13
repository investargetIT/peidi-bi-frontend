<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getTeamConfigList,
  addTeamConfig,
  updateTeamConfig,
  deleteTeamConfig,
  type BiTeamConfig
} from "@/api/businessAnalysis";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";

const tableData = ref<BiTeamConfig[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const currentRow = ref<BiTeamConfig>({});
const formData = ref<BiTeamConfig>({
  teamName: ""
});
const searchText = ref("");

const filteredTableData = computed(() => {
  if (!searchText.value) return tableData.value;
  return tableData.value.filter(item =>
    item.teamName?.includes(searchText.value)
  );
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res: any = await getTeamConfigList();
    if (res.success) {
      tableData.value = res.data.sort((a, b) => b.id - a.id) || []; // 按id排序
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  formData.value = { teamName: "" };
  dialogVisible.value = true;
};

const handleEdit = (row: BiTeamConfig) => {
  isEdit.value = true;
  currentRow.value = row;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: BiTeamConfig) => {
  try {
    const teamName = row?.teamName || "未命名团队";
    await ElMessageBox.confirm(`确认删除团队"${teamName}"吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const res: any = await deleteTeamConfig(row);

    if (res.success) {
      ElMessage.success("删除成功");
      await fetchList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    // 检查是否是用户取消操作
    const isUserCancel =
      error === "cancel" ||
      (typeof error === "object" && error !== null && "action" in error);

    if (!isUserCancel) {
      ElMessage.error("删除失败");
    }
  }
};

const handleSubmit = async () => {
  if (!formData.value.teamName?.trim()) {
    ElMessage.warning("请输入团队名称");
    return;
  }

  if (submitLoading.value) return;
  submitLoading.value = true;

  try {
    const res: any = isEdit.value
      ? await updateTeamConfig(formData.value)
      : await addTeamConfig(formData.value);

    if (res.success) {
      ElMessage.success(isEdit.value ? "更新成功" : "新增成功");
      dialogVisible.value = false;
      await fetchList();
    } else {
      ElMessage.error(res.msg || (isEdit.value ? "更新失败" : "新增失败"));
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? "更新失败" : "新增失败");
  } finally {
    submitLoading.value = false;
  }
};

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="team-config-wrapper">
    <div class="toolbar">
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索团队名称"
          clearable
          :prefix-icon="Search"
          style="width: 300px"
        />
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAdd"
        >新增团队</el-button
      >
    </div>

    <el-table v-loading="loading" :data="filteredTableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="teamName" label="团队名称" />
      <el-table-column prop="createAt" label="创建时间" width="180" />
      <el-table-column prop="updateAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            :icon="Edit"
            @click="handleEdit(row)"
          />
          <el-button
            type="danger"
            link
            size="small"
            :icon="Delete"
            @click="handleDelete(row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑团队' : '新增团队'"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="团队名称">
          <el-input v-model="formData.teamName" placeholder="请输入团队名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.team-config-wrapper {
  width: 100%;
  padding: 20px;

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
}
</style>
