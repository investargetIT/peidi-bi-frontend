<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getTeamConfigList,
  addTeamConfig,
  updateTeamConfig,
  deleteTeamConfig,
  getTeamIncomeTargetList,
  addTeamIncomeTarget,
  updateTeamIncomeTarget,
  deleteTeamIncomeTarget,
  type BiTeamConfig,
  type BiTeamIncomeTarget
} from "@/api/businessAnalysis";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const activeTab = ref("target");

const handleTabChange = (tabName: string) => {
  if (tabName === "target") {
    fetchTargetList();
  } else if (tabName === "config") {
    fetchConfigList();
  }
};

// 团队配置相关
const configTableData = ref<BiTeamConfig[]>([]);
const configLoading = ref(false);
const configDialogVisible = ref(false);
const configIsEdit = ref(false);
const configSubmitLoading = ref(false);
const configFormData = ref<BiTeamConfig>({
  teamName: ""
});
const configSearchText = ref("");

const filteredConfigTableData = computed(() => {
  if (!configSearchText.value) return configTableData.value;
  return configTableData.value.filter(item =>
    item.teamName?.includes(configSearchText.value)
  );
});

const fetchConfigList = async () => {
  configLoading.value = true;
  try {
    const res: any = await getTeamConfigList();
    if (res.success) {
      configTableData.value = res.data.sort((a, b) => b.id - a.id) || [];
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
  configFormData.value = { teamName: "" };
  configDialogVisible.value = true;
};

const handleConfigEdit = (row: BiTeamConfig) => {
  configIsEdit.value = true;
  configFormData.value = { ...row };
  configDialogVisible.value = true;
};

const handleConfigDelete = async (row: BiTeamConfig) => {
  try {
    await ElMessageBox.confirm(`确认删除团队"${row.teamName}"吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    const res: any = await deleteTeamConfig(row);
    if (res.success) {
      ElMessage.success("删除成功");
      await fetchConfigList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleConfigSubmit = async () => {
  if (!configFormData.value.teamName?.trim()) {
    ElMessage.warning("请输入团队名称");
    return;
  }

  if (configSubmitLoading.value) return;
  configSubmitLoading.value = true;

  try {
    const res: any = configIsEdit.value
      ? await updateTeamConfig(configFormData.value)
      : await addTeamConfig(configFormData.value);

    if (res.success) {
      ElMessage.success(configIsEdit.value ? "更新成功" : "新增成功");
      configDialogVisible.value = false;
      await fetchConfigList();
    } else {
      ElMessage.error(
        res.msg || (configIsEdit.value ? "更新失败" : "新增失败")
      );
    }
  } catch (error) {
    ElMessage.error(configIsEdit.value ? "更新失败" : "新增失败");
  } finally {
    configSubmitLoading.value = false;
  }
};

// 团队收入目标相关
const targetTableData = ref<BiTeamIncomeTarget[]>([]);
const targetLoading = ref(false);
const targetDialogVisible = ref(false);
const targetIsEdit = ref(false);
const targetSubmitLoading = ref(false);
const targetFormData = ref<BiTeamIncomeTarget>({
  teamConfigId: undefined,
  statisticsDate: dayjs().format("YYYY-MM-DD"),
  currentIncome: undefined,
  targetAmount: undefined,
  lastYearIncome: undefined,
  annualTarget: undefined
});
const targetSearchText = ref("");

const filteredTargetTableData = computed(() => {
  if (!targetSearchText.value) return targetTableData.value;
  return targetTableData.value.filter(item =>
    item.teamConfig?.teamName?.includes(targetSearchText.value)
  );
});

const fetchTargetList = async () => {
  targetLoading.value = true;
  try {
    const res: any = await getTeamIncomeTargetList();
    if (res.success) {
      targetTableData.value = res.data.sort((a, b) => b.id - a.id) || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    targetLoading.value = false;
  }
};

const handleTargetAdd = () => {
  targetIsEdit.value = false;
  targetFormData.value = {
    teamConfigId: undefined,
    statisticsDate: dayjs().format("YYYY-MM-DD"),
    currentIncome: undefined,
    targetAmount: undefined,
    lastYearIncome: undefined,
    annualTarget: undefined
  };
  targetDialogVisible.value = true;
};

const handleTargetEdit = (row: BiTeamIncomeTarget) => {
  targetIsEdit.value = true;
  targetFormData.value = { ...row };
  targetDialogVisible.value = true;
};

const handleTargetDelete = async (row: BiTeamIncomeTarget) => {
  try {
    await ElMessageBox.confirm(
      `确认删除团队"${row.teamConfig?.teamName}"的收入指标吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    const res: any = await deleteTeamIncomeTarget(row);
    if (res.success) {
      ElMessage.success("删除成功");
      await fetchTargetList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleTargetSubmit = async () => {
  if (!targetFormData.value.teamConfigId) {
    ElMessage.warning("请选择团队");
    return;
  }
  if (!targetFormData.value.statisticsDate) {
    ElMessage.warning("请选择统计日期");
    return;
  }

  if (targetSubmitLoading.value) return;
  targetSubmitLoading.value = true;

  try {
    const res: any = targetIsEdit.value
      ? await updateTeamIncomeTarget(targetFormData.value)
      : await addTeamIncomeTarget(targetFormData.value);

    if (res.success) {
      ElMessage.success(targetIsEdit.value ? "更新成功" : "新增成功");
      targetDialogVisible.value = false;
      await fetchTargetList();
    } else {
      ElMessage.error(
        res.msg || (targetIsEdit.value ? "更新失败" : "新增失败")
      );
    }
  } catch (error) {
    ElMessage.error(targetIsEdit.value ? "更新失败" : "新增失败");
  } finally {
    targetSubmitLoading.value = false;
  }
};

onMounted(() => {
  fetchConfigList();
  fetchTargetList();
});
</script>

<template>
  <div class="team-indicators-wrapper">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="团队收入目标" name="target">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="targetSearchText"
              placeholder="搜索团队名称"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleTargetAdd"
            >新增指标</el-button
          >
        </div>

        <el-table
          v-loading="targetLoading"
          :data="filteredTargetTableData"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="团队名称" min-width="150">
            <template #default="{ row }">
              {{ row.teamConfig?.teamName }}
            </template>
          </el-table-column>
          <el-table-column prop="statisticsDate" label="统计日期" width="120" />
          <el-table-column
            prop="currentIncome"
            label="本期累计(万元)"
            width="140"
          >
            <template #default="{ row }">
              {{ row.currentIncome?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="targetAmount"
            label="预算指标(万元)"
            width="140"
          >
            <template #default="{ row }">
              {{ row.targetAmount?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="achievementStatus"
            label="达成情况(%)"
            width="120"
          >
            <template #default="{ row }">
              <el-tag
                :type="
                  row.achievementStatus && row.achievementStatus >= 100
                    ? 'success'
                    : 'warning'
                "
              >
                {{ row.achievementStatus }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastYearIncome"
            label="去年同期(万元)"
            width="140"
          >
            <template #default="{ row }">
              {{ row.lastYearIncome?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="yearOnYear" label="同比(%)" width="100">
            <template #default="{ row }">
              <el-tag
                v-if="row.yearOnYear !== null && row.yearOnYear !== undefined"
                :type="row.yearOnYear >= 0 ? 'success' : 'danger'"
              >
                {{ row.yearOnYear > 0 ? "+" : "" }}{{ row.yearOnYear }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="annualTarget"
            label="年度预算(万元)"
            width="140"
          >
            <template #default="{ row }">
              {{ row.annualTarget?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="达成进度(%)" width="120">
            <template #default="{ row }">
              <el-progress
                :percentage="row.progress || 0"
                :color="
                  row.progress && row.progress >= 100
                    ? '#67c23a'
                    : row.progress && row.progress >= 50
                      ? '#e6a23c'
                      : '#f56c6c'
                "
              />
            </template>
          </el-table-column>
          <el-table-column prop="createAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                :icon="Edit"
                @click="handleTargetEdit(row)"
              />
              <el-button
                type="danger"
                link
                size="small"
                :icon="Delete"
                @click="handleTargetDelete(row)"
              />
            </template>
          </el-table-column>
        </el-table>

        <el-dialog
          v-model="targetDialogVisible"
          :title="targetIsEdit ? '编辑收入指标' : '新增收入指标'"
          width="550px"
        >
          <el-form label-width="145px">
            <el-form-item label="团队">
              <el-select
                v-model="targetFormData.teamConfigId"
                placeholder="请选择团队"
                style="width: 100%"
                :disabled="targetIsEdit"
              >
                <el-option
                  v-for="team in configTableData"
                  :key="team.id"
                  :label="team.teamName"
                  :value="team.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="统计日期">
              <el-date-picker
                v-model="targetFormData.statisticsDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="本期累计收入(万元)">
              <el-input-number
                v-model="targetFormData.currentIncome"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入本期累计收入"
              />
            </el-form-item>
            <el-form-item label="预算指标(万元)">
              <el-input-number
                v-model="targetFormData.targetAmount"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入预算指标"
              />
            </el-form-item>
            <el-form-item label="去年同期收入(万元)">
              <el-input-number
                v-model="targetFormData.lastYearIncome"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入去年同期收入"
              />
            </el-form-item>
            <el-form-item label="年度预算(万元)">
              <el-input-number
                v-model="targetFormData.annualTarget"
                :precision="2"
                :step="1"
                style="width: 100%"
                placeholder="请输入年度预算"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="targetDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="targetSubmitLoading" @click="handleTargetSubmit"
              >确定</el-button
            >
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="团队配置" name="config">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="configSearchText"
              placeholder="搜索团队名称"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleConfigAdd"
            >新增团队</el-button
          >
        </div>

        <el-table
          v-loading="configLoading"
          :data="filteredConfigTableData"
          border
          stripe
        >
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
                @click="handleConfigEdit(row)"
              />
              <el-button
                type="danger"
                link
                size="small"
                :icon="Delete"
                @click="handleConfigDelete(row)"
              />
            </template>
          </el-table-column>
        </el-table>

        <el-dialog
          v-model="configDialogVisible"
          :title="configIsEdit ? '编辑团队' : '新增团队'"
          width="500px"
        >
          <el-form label-width="80px">
            <el-form-item label="团队名称">
              <el-input
                v-model="configFormData.teamName"
                placeholder="请输入团队名称"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="configDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="configSubmitLoading" @click="handleConfigSubmit"
              >确定</el-button
            >
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.team-indicators-wrapper {
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
