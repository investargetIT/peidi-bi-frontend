<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getIndicatorSummaryConfigList,
  addIndicatorSummaryConfig,
  updateIndicatorSummaryConfig,
  getIndicatorSummaryList,
  addIndicatorSummary,
  updateIndicatorSummary,
  type BiIndicatorSummaryConfig,
  type BiIndicatorSummary
} from "@/api/businessAnalysis";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";

const activeTab = ref("summary");

// 指标达成总表配置相关
const configTableData = ref<BiIndicatorSummaryConfig[]>([]);
const configLoading = ref(false);
const configDialogVisible = ref(false);
const configIsEdit = ref(false);
const configSubmitLoading = ref(false);
const configFormData = ref<BiIndicatorSummaryConfig>({
  configName: "",
  sortOrder: 0
});
const configSearchText = ref("");

const filteredConfigTableData = computed(() => {
  if (!configSearchText.value) return configTableData.value.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return configTableData.value
    .filter(item => item.configName?.includes(configSearchText.value))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
});

const fetchConfigList = async () => {
  configLoading.value = true;
  try {
    const res: any = await getIndicatorSummaryConfigList();
    if (res.success) {
      configTableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    configLoading.value = false;
  }
};

const handleConfigAdd = () => {
  configIsEdit.value = false;
  configFormData.value = {
    configName: "",
    sortOrder: configTableData.value.length + 1
  };
  configDialogVisible.value = true;
};

const handleConfigEdit = (row: BiIndicatorSummaryConfig) => {
  configIsEdit.value = true;
  configFormData.value = { ...row };
  configDialogVisible.value = true;
};

const handleConfigDelete = async (row: BiIndicatorSummaryConfig) => {
  try {
    await ElMessageBox.confirm(
      `确认删除配置"${row.configName}"吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    ElMessage.success("删除功能待接口完善");
    await fetchConfigList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleConfigSubmit = async () => {
  if (!configFormData.value.configName?.trim()) {
    ElMessage.warning("请输入配置名称");
    return;
  }

  if (configSubmitLoading.value) return;
  configSubmitLoading.value = true;

  try {
    const res: any = configIsEdit.value
      ? await updateIndicatorSummaryConfig(configFormData.value)
      : await addIndicatorSummaryConfig(configFormData.value);

    if (res.success) {
      ElMessage.success(configIsEdit.value ? "更新成功" : "新增成功");
      configDialogVisible.value = false;
      await fetchConfigList();
    } else {
      ElMessage.error(res.msg || (configIsEdit.value ? "更新失败" : "新增失败"));
    }
  } catch (error) {
    ElMessage.error(configIsEdit.value ? "更新失败" : "新增失败");
  } finally {
    configSubmitLoading.value = false;
  }
};

// 指标达成总览相关
const summaryTableData = ref<BiIndicatorSummary[]>([]);
const summaryLoading = ref(false);
const summaryDialogVisible = ref(false);
const summaryIsEdit = ref(false);
const summarySubmitLoading = ref(false);
const summaryFormData = ref<BiIndicatorSummary>({
  indicatorSummaryConfigId: undefined,
  currentActual: undefined,
  currentBudget: undefined,
  lastYearActual: undefined,
  annualBudget: undefined,
  completionRate: undefined,
  annualProgress: undefined,
  growthRate: undefined
});
const summarySearchText = ref("");

const filteredSummaryTableData = computed(() => {
  if (!summarySearchText.value) return summaryTableData.value.sort((a, b) => b.id - a.id);
  return summaryTableData.value
    .filter(item => item.config?.configName?.includes(summarySearchText.value))
    .sort((a, b) => b.id - a.id);
});

const fetchSummaryList = async () => {
  summaryLoading.value = true;
  try {
    const res: any = await getIndicatorSummaryList();
    if (res.success) {
      summaryTableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    summaryLoading.value = false;
  }
};

const handleSummaryAdd = () => {
  summaryIsEdit.value = false;
  summaryFormData.value = {
    indicatorSummaryConfigId: undefined,
    currentActual: undefined,
    currentBudget: undefined,
    lastYearActual: undefined,
    annualBudget: undefined,
    completionRate: undefined,
    annualProgress: undefined,
    growthRate: undefined
  };
  summaryDialogVisible.value = true;
};

const handleSummaryEdit = (row: BiIndicatorSummary) => {
  summaryIsEdit.value = true;
  summaryFormData.value = { ...row };
  summaryDialogVisible.value = true;
};

const handleSummaryDelete = async (row: BiIndicatorSummary) => {
  try {
    await ElMessageBox.confirm(
      `确认删除指标"${row.config?.configName}"吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    ElMessage.success("删除功能待接口完善");
    await fetchSummaryList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleSummarySubmit = async () => {
  if (!summaryFormData.value.indicatorSummaryConfigId) {
    ElMessage.warning("请选择指标配置");
    return;
  }

  if (summarySubmitLoading.value) return;
  summarySubmitLoading.value = true;

  try {
    const res: any = summaryIsEdit.value
      ? await updateIndicatorSummary(summaryFormData.value)
      : await addIndicatorSummary(summaryFormData.value);

    if (res.success) {
      ElMessage.success(summaryIsEdit.value ? "更新成功" : "新增成功");
      summaryDialogVisible.value = false;
      await fetchSummaryList();
    } else {
      ElMessage.error(res.msg || (summaryIsEdit.value ? "更新失败" : "新增失败"));
    }
  } catch (error) {
    ElMessage.error(summaryIsEdit.value ? "更新失败" : "新增失败");
  } finally {
    summarySubmitLoading.value = false;
  }
};

onMounted(() => {
  fetchConfigList();
  fetchSummaryList();
});
</script>

<template>
  <div class="core-indicators-wrapper">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="指标达成总览" name="summary">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="summarySearchText"
              placeholder="搜索配置名称"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleSummaryAdd"
            >新增指标</el-button
          >
        </div>

        <el-card shadow="never" class="table-card">
          <el-table
            v-loading="summaryLoading"
            :data="filteredSummaryTableData"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="指标名称" min-width="150">
              <template #default="{ row }">
                {{ row.config?.configName }}
              </template>
            </el-table-column>
            <el-table-column prop="currentActual" label="当期实际" width="120">
              <template #default="{ row }">
                {{ row.currentActual?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="currentBudget" label="当期预算" width="120">
              <template #default="{ row }">
                {{ row.currentBudget?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="completionRate" label="完成率(%)" width="120">
              <template #default="{ row }">
                <el-tag :type="row.completionRate && row.completionRate >= 100 ? 'success' : 'warning'">
                  {{ row.completionRate?.toFixed(2) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastYearActual" label="去年同期" width="120">
              <template #default="{ row }">
                {{ row.lastYearActual?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="growthRate" label="增减率(%)" width="120">
              <template #default="{ row }">
                <el-tag
                  v-if="row.growthRate !== null && row.growthRate !== undefined"
                  :type="row.growthRate >= 0 ? 'success' : 'danger'"
                >
                  {{ row.growthRate > 0 ? "+" : "" }}{{ row.growthRate?.toFixed(2) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="annualBudget" label="全年预算" width="120">
              <template #default="{ row }">
                {{ row.annualBudget?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="annualProgress" label="全年进度(%)" width="140">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.annualProgress || 0"
                  :color="
                    row.annualProgress && row.annualProgress >= 100
                      ? '#67c23a'
                      : row.annualProgress && row.annualProgress >= 50
                        ? '#e6a23c'
                        : '#f56c6c'
                  "
                />
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  size="small"
                  :icon="Edit"
                  @click="handleSummaryEdit(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-dialog
          v-model="summaryDialogVisible"
          :title="summaryIsEdit ? '编辑指标' : '新增指标'"
          width="600px"
        >
          <el-form label-width="120px">
            <el-form-item label="指标配置">
              <el-select
                v-model="summaryFormData.indicatorSummaryConfigId"
                placeholder="请选择指标配置"
                style="width: 100%"
                :disabled="summaryIsEdit"
              >
                <el-option
                  v-for="config in configTableData"
                  :key="config.id"
                  :label="config.configName"
                  :value="config.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="当期实际">
              <el-input-number
                v-model="summaryFormData.currentActual"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入当期实际"
              />
            </el-form-item>
            <el-form-item label="当期预算">
              <el-input-number
                v-model="summaryFormData.currentBudget"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入当期预算"
              />
            </el-form-item>
            <el-form-item label="完成率(%)">
              <el-input-number
                v-model="summaryFormData.completionRate"
                :precision="2"
                :step="0.01"
                style="width: 100%"
                placeholder="请输入完成率"
              />
            </el-form-item>
            <el-form-item label="去年同期">
              <el-input-number
                v-model="summaryFormData.lastYearActual"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入去年同期"
              />
            </el-form-item>
            <el-form-item label="增减率(%)">
              <el-input-number
                v-model="summaryFormData.growthRate"
                :precision="2"
                :step="0.01"
                style="width: 100%"
                placeholder="请输入增减率"
              />
            </el-form-item>
            <el-form-item label="全年预算">
              <el-input-number
                v-model="summaryFormData.annualBudget"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入全年预算"
              />
            </el-form-item>
            <el-form-item label="全年进度(%)">
              <el-input-number
                v-model="summaryFormData.annualProgress"
                :precision="2"
                :step="0.01"
                style="width: 100%"
                placeholder="请输入全年进度"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="summaryDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="summarySubmitLoading" @click="handleSummarySubmit">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="指标达成总表配置" name="config">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="configSearchText"
              placeholder="搜索配置名称"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleConfigAdd"
            >新增配置</el-button
          >
        </div>

        <el-card shadow="never" class="table-card">
          <el-table
            v-loading="configLoading"
            :data="filteredConfigTableData"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="configName" label="配置名称" min-width="200" />
            <el-table-column prop="sortOrder" label="排序" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column prop="updatedAt" label="更新时间" width="180" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  size="small"
                  :icon="Edit"
                  @click="handleConfigEdit(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-dialog
          v-model="configDialogVisible"
          :title="configIsEdit ? '编辑配置' : '新增配置'"
          width="500px"
        >
          <el-form label-width="100px">
            <el-form-item label="配置名称">
              <el-input
                v-model="configFormData.configName"
                placeholder="请输入配置名称"
              />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number
                v-model="configFormData.sortOrder"
                :min="0"
                placeholder="排序"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="configDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="configSubmitLoading" @click="handleConfigSubmit">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.core-indicators-wrapper {
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
