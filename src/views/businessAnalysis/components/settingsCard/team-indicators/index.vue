<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getTeamConfigList,
  addTeamConfig,
  updateTeamConfig,
  deleteTeamConfig,
  getTeamIncomeTargetList,
  type BiTeamConfig,
  type BiTeamIncomeTarget
} from "@/api/businessAnalysis";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const activeTab = ref("target");
const selectedYear = ref<number>(dayjs().year());

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
    const teamName = row?.teamName || "未命名团队";
    await ElMessageBox.confirm(`确认删除团队"${teamName}"吗？`, "提示", {
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
    // 检查是否是用户取消操作
    const isUserCancel =
      error === "cancel" ||
      (typeof error === "object" && error !== null && "action" in error);

    if (!isUserCancel) {
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
const targetSearchText = ref("");

/** 计算达成情况(%) */
const calcAchievementStatus = (row: BiTeamIncomeTarget) => {
  if (!row.currentIncome || !row.targetAmount) return null;
  return Math.round((row.currentIncome / row.targetAmount) * 100);
};

/** 计算同比(%) */
const calcYearOnYear = (row: BiTeamIncomeTarget) => {
  if (!row.currentIncome || !row.lastYearIncome) return null;
  return Math.round(
    ((row.currentIncome - row.lastYearIncome) / row.lastYearIncome) * 100
  );
};

/** 计算达成进度(%) */
const calcProgress = (row: BiTeamIncomeTarget) => {
  if (!row.currentIncome || !row.annualTarget) return 0;
  return Math.round((row.currentIncome / row.annualTarget) * 100);
};

const filteredTargetTableData = computed(() => {
  if (!targetSearchText.value) return targetTableData.value;
  return targetTableData.value.filter(
    item =>
      item.channel?.includes(targetSearchText.value) ||
      item.teamConfig?.teamName?.includes(targetSearchText.value)
  );
});

const fetchTargetList = async () => {
  targetLoading.value = true;
  try {
    const res: any = await getTeamIncomeTargetList({
      year: selectedYear.value
    });
    if (res.success) {
      targetTableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    targetLoading.value = false;
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
            <el-date-picker
              v-model="selectedYear"
              type="year"
              placeholder="选择年份"
              format="YYYY"
              value-format="YYYY"
              style="width: 150px"
              @change="fetchTargetList"
            />
            <el-input
              v-model="targetSearchText"
              placeholder="搜索渠道/团队"
              clearable
              :prefix-icon="Search"
              style="width: 300px; margin-left: 12px"
            />
          </div>
        </div>

        <el-table
          v-loading="targetLoading"
          :data="filteredTargetTableData"
          border
          stripe
        >
          <el-table-column label="渠道/团队" min-width="150">
            <template #default="{ row }">
              {{ row.channel || row.teamConfig?.teamName }}
            </template>
          </el-table-column>
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
          <el-table-column label="达成情况(%)" width="120">
            <template #default="{ row }">
              <el-tag
                v-if="calcAchievementStatus(row) !== null"
                :type="
                  calcAchievementStatus(row)! >= 100 ? 'success' : 'warning'
                "
              >
                {{ calcAchievementStatus(row) }}%
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
          <el-table-column label="同比(%)" width="100">
            <template #default="{ row }">
              <el-tag
                v-if="calcYearOnYear(row) !== null"
                :type="calcYearOnYear(row)! >= 0 ? 'success' : 'danger'"
              >
                {{ calcYearOnYear(row)! > 0 ? "+" : ""
                }}{{ calcYearOnYear(row) }}%
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
          <el-table-column label="达成进度(%)" width="160">
            <template #default="{ row }">
              <el-progress
                :percentage="calcProgress(row)"
                :color="
                  calcProgress(row) >= 100
                    ? '#67c23a'
                    : calcProgress(row) >= 50
                      ? '#e6a23c'
                      : '#f56c6c'
                "
              />
            </template>
          </el-table-column>
        </el-table>
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
            <el-button
              type="primary"
              :loading="configSubmitLoading"
              @click="handleConfigSubmit"
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
