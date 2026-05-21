<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getCostCategoryGroupList,
  addCostCategoryGroup,
  updateCostCategoryGroup,
  deleteCostCategoryGroup,
  getCostCategoryListWithGroup,
  addCostCategory,
  updateCostCategory,
  deleteCostCategory,
  type BiCostCategoryGroup,
  type BiCostCategory
} from "@/api/businessAnalysis";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";

const activeTab = ref("category");

const handleTabChange = (tabName: string) => {
  if (tabName === "category") {
    fetchCategoryList();
  } else if (tabName === "group") {
    fetchGroupList();
  }
};

// 成本类别分组相关
const groupTableData = ref<BiCostCategoryGroup[]>([]);
const groupLoading = ref(false);
const groupDialogVisible = ref(false);
const groupIsEdit = ref(false);
const groupSubmitLoading = ref(false);
const groupFormData = ref<BiCostCategoryGroup>({
  groupName: "",
  groupCode: "",
  sortOrder: 0
});
const groupSearchText = ref("");

const filteredGroupTableData = computed(() => {
  if (!groupSearchText.value) return groupTableData.value.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return groupTableData.value
    .filter(
      item =>
        item.groupName?.includes(groupSearchText.value) ||
        item.groupCode?.includes(groupSearchText.value)
    )
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
});

const fetchGroupList = async () => {
  groupLoading.value = true;
  try {
    const res: any = await getCostCategoryGroupList();
    if (res.success) {
      groupTableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    groupLoading.value = false;
  }
};

const handleGroupAdd = () => {
  groupIsEdit.value = false;
  groupFormData.value = {
    groupName: "",
    groupCode: "",
    sortOrder: groupTableData.value.length + 1
  };
  groupDialogVisible.value = true;
};

const handleGroupEdit = (row: BiCostCategoryGroup) => {
  groupIsEdit.value = true;
  groupFormData.value = { ...row };
  groupDialogVisible.value = true;
};

const handleGroupDelete = async (row: BiCostCategoryGroup) => {
  try {
    await ElMessageBox.confirm(
      `确认删除成本类别分组"${row.groupName}"吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    const res: any = await deleteCostCategoryGroup(row.id!);
    if (res.success) {
      ElMessage.success("删除成功");
      await fetchGroupList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleGroupSubmit = async () => {
  if (!groupFormData.value.groupName?.trim()) {
    ElMessage.warning("请输入分组名称");
    return;
  }

  if (groupSubmitLoading.value) return;
  groupSubmitLoading.value = true;

  try {
    const res: any = groupIsEdit.value
      ? await updateCostCategoryGroup(groupFormData.value)
      : await addCostCategoryGroup(groupFormData.value);

    if (res.success) {
      ElMessage.success(groupIsEdit.value ? "更新成功" : "新增成功");
      groupDialogVisible.value = false;
      await fetchGroupList();
    } else {
      ElMessage.error(res.msg || (groupIsEdit.value ? "更新失败" : "新增失败"));
    }
  } catch (error) {
    ElMessage.error(groupIsEdit.value ? "更新失败" : "新增失败");
  } finally {
    groupSubmitLoading.value = false;
  }
};

// 成本类别相关
const categoryTableData = ref<BiCostCategory[]>([]);
const categoryLoading = ref(false);
const categoryDialogVisible = ref(false);
const categoryIsEdit = ref(false);
const categorySubmitLoading = ref(false);
const categoryFormData = ref<BiCostCategory>({
  categoryGroupId: undefined,
  currentCost: 0,
  yoyChange: 0,
  sortOrder: 0
});
const categorySearchText = ref("");

const filteredCategoryTableData = computed(() => {
  if (!categorySearchText.value) return categoryTableData.value.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return categoryTableData.value
    .filter(
      item =>
        item.group?.groupName?.includes(categorySearchText.value)
    )
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
});

const fetchCategoryList = async () => {
  categoryLoading.value = true;
  try {
    const res: any = await getCostCategoryListWithGroup();
    if (res.success) {
      categoryTableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    categoryLoading.value = false;
  }
};

const handleCategoryAdd = () => {
  categoryIsEdit.value = false;
  categoryFormData.value = {
    categoryGroupId: undefined,
    currentCost: 0,
    yoyChange: 0,
    sortOrder: categoryTableData.value.length + 1
  };
  categoryDialogVisible.value = true;
};

const handleCategoryEdit = (row: BiCostCategory) => {
  categoryIsEdit.value = true;
  categoryFormData.value = { ...row };
  categoryDialogVisible.value = true;
};

const handleCategoryDelete = async (row: BiCostCategory) => {
  try {
    await ElMessageBox.confirm(
      `确认删除成本类别吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    const res: any = await deleteCostCategory(row.id!);
    if (res.success) {
      ElMessage.success("删除成功");
      await fetchCategoryList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleCategorySubmit = async () => {
  if (!categoryFormData.value.categoryGroupId) {
    ElMessage.warning("请选择成本类别分组");
    return;
  }

  if (categorySubmitLoading.value) return;
  categorySubmitLoading.value = true;

  try {
    const res: any = categoryIsEdit.value
      ? await updateCostCategory(categoryFormData.value)
      : await addCostCategory(categoryFormData.value);

    if (res.success) {
      ElMessage.success(categoryIsEdit.value ? "更新成功" : "新增成功");
      categoryDialogVisible.value = false;
      await fetchCategoryList();
    } else {
      ElMessage.error(res.msg || (categoryIsEdit.value ? "更新失败" : "新增失败"));
    }
  } catch (error) {
    ElMessage.error(categoryIsEdit.value ? "更新失败" : "新增失败");
  } finally {
    categorySubmitLoading.value = false;
  }
};

onMounted(() => {
  fetchGroupList();
  fetchCategoryList();
});
</script>

<template>
  <div class="cost-category-group-wrapper">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="成本类别" name="category">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="categorySearchText"
              placeholder="搜索分组名称"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleCategoryAdd()"
            >新增成本类别</el-button
          >
        </div>

        <el-card shadow="never" class="table-card">
          <el-table
            v-loading="categoryLoading"
            :data="filteredCategoryTableData"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="分组名称" min-width="200">
              <template #default="{ row }">
                {{ row.group?.groupName }}
              </template>
            </el-table-column>
            <el-table-column label="分组代码" width="150">
              <template #default="{ row }">
                {{ row.group?.groupCode }}
              </template>
            </el-table-column>
            <el-table-column prop="currentCost" label="本期累计" width="120">
              <template #default="{ row }">
                {{ row.currentCost?.toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column prop="yoyChange" label="同比变化(%)" width="150">
              <template #default="{ row }">
                <el-tag
                  v-if="row.yoyChange !== null && row.yoyChange !== undefined"
                  :type="row.yoyChange >= 0 ? 'success' : 'danger'"
                >
                  {{ row.yoyChange > 0 ? '+' : '' }}{{ row.yoyChange?.toFixed(2) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sortOrder" label="排序" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column prop="updatedAt" label="更新时间" width="180" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  size="small"
                  :icon="Edit"
                  @click="handleCategoryEdit(row)"
                />
                <el-button
                  type="danger"
                  link
                  size="small"
                  :icon="Delete"
                  @click="handleCategoryDelete(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-dialog
          v-model="categoryDialogVisible"
          :title="categoryIsEdit ? '编辑成本类别' : '新增成本类别'"
          width="600px"
        >
          <el-form label-width="120px">
            <el-form-item label="成本类别分组">
              <el-select
                v-model="categoryFormData.categoryGroupId"
                placeholder="请选择成本类别分组"
                style="width: 100%"
              >
                <el-option
                  v-for="group in groupTableData"
                  :key="group.id"
                  :label="group.groupName"
                  :value="group.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="本期累计(%)">
              <el-input-number
                v-model="categoryFormData.currentCost"
                :precision="2"
                :step="0.01"
                placeholder="请输入本期累计"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="同比变化(%)">
              <el-input-number
                v-model="categoryFormData.yoyChange"
                :precision="2"
                :step="0.01"
                placeholder="请输入同比变化"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number
                v-model="categoryFormData.sortOrder"
                :min="0"
                placeholder="排序"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="categoryDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="categorySubmitLoading" @click="handleCategorySubmit">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="成本类别分组" name="group">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="groupSearchText"
              placeholder="搜索分组名称/代码"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleGroupAdd()"
            >新增分组</el-button
          >
        </div>

        <el-card shadow="never" class="table-card">
          <el-table
            v-loading="groupLoading"
            :data="filteredGroupTableData"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="groupName" label="分组名称" min-width="200" />
            <el-table-column prop="groupCode" label="分组代码" width="200" />
            <el-table-column prop="sortOrder" label="排序" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column prop="updatedAt" label="更新时间" width="180" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  size="small"
                  :icon="Edit"
                  @click="handleGroupEdit(row)"
                />
                <el-button
                  type="danger"
                  link
                  size="small"
                  :icon="Delete"
                  @click="handleGroupDelete(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-dialog
          v-model="groupDialogVisible"
          :title="groupIsEdit ? '编辑成本类别分组' : '新增成本类别分组'"
          width="600px"
        >
          <el-form label-width="100px">
            <el-form-item label="分组名称">
              <el-input
                v-model="groupFormData.groupName"
                placeholder="请输入分组名称"
              />
            </el-form-item>
            <el-form-item label="分组代码">
              <el-select
                v-model="groupFormData.groupCode"
                placeholder="请选择分组代码"
                style="width: 100%"
                clearable
              >
                <el-option label="COST" value="COST" />
                <el-option label="FEE" value="FEE" />
                <el-option label="ADJUST" value="ADJUST" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number
                v-model="groupFormData.sortOrder"
                :min="0"
                placeholder="排序"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="groupDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleGroupSubmit">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.cost-category-group-wrapper {
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
