<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getTeamIncomeTargetList,
  addTeamIncomeTarget,
  updateTeamIncomeTarget,
  deleteTeamIncomeTarget,
  getTeamConfigList,
  type BiTeamIncomeTarget,
  type BiTeamConfig
} from "@/api/businessAnalysis";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableData = ref<BiTeamIncomeTarget[]>([]);
const teamConfigList = ref<BiTeamConfig[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formData = ref<BiTeamIncomeTarget>({
  teamConfigId: undefined,
  statisticsDate: dayjs().format("YYYY-MM-DD"),
  currentIncome: undefined,
  targetAmount: undefined,
  lastYearIncome: undefined,
  annualTarget: undefined
});
const searchText = ref("");

const filteredTableData = computed(() => {
  if (!searchText.value) return tableData.value;
  return tableData.value.filter(item =>
    item.teamConfig?.teamName?.includes(searchText.value)
  );
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res: any = await getTeamIncomeTargetList();
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

const fetchTeamConfigList = async () => {
  try {
    const res: any = await getTeamConfigList();
    if (res.success) {
      teamConfigList.value = res.data || [];
    }
  } catch (error) {
    console.error("获取团队列表失败", error);
  }
};

const handleAdd = () => {
  isEdit.value = false;
  formData.value = {
    teamConfigId: undefined,
    statisticsDate: dayjs().format("YYYY-MM-DD"),
    currentIncome: undefined,
    targetAmount: undefined,
    lastYearIncome: undefined,
    annualTarget: undefined
  };
  dialogVisible.value = true;
};

const handleEdit = (row: BiTeamIncomeTarget) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: BiTeamIncomeTarget) => {
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
      await fetchList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleSubmit = async () => {
  if (!formData.value.teamConfigId) {
    ElMessage.warning("请选择团队");
    return;
  }
  if (!formData.value.statisticsDate) {
    ElMessage.warning("请选择统计日期");
    return;
  }

  if (submitLoading.value) return;
  submitLoading.value = true;

  try {
    const res: any = isEdit.value
      ? await updateTeamIncomeTarget(formData.value)
      : await addTeamIncomeTarget(formData.value);

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

const getTeamName = (teamConfigId: number) => {
  const team = teamConfigList.value.find(t => t.id === teamConfigId);
  return team?.teamName || "";
};

onMounted(() => {
  fetchList();
  fetchTeamConfigList();
});
</script>

<template>
  <div class="team-income-target-wrapper">
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
        >新增指标</el-button
      >
    </div>

    <el-table v-loading="loading" :data="filteredTableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="团队名称" min-width="150">
        <template #default="{ row }">
          {{ row.teamConfig?.teamName }}
        </template>
      </el-table-column>
      <el-table-column prop="statisticsDate" label="统计日期" width="120" />
      <el-table-column prop="currentIncome" label="本期累计(万元)" width="140">
        <template #default="{ row }">
          {{ row.currentIncome?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="targetAmount" label="预算指标(万元)" width="140">
        <template #default="{ row }">
          {{ row.targetAmount?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="achievementStatus" label="达成情况(%)" width="120">
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
      <el-table-column prop="lastYearIncome" label="去年同期(万元)" width="140">
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
      <el-table-column prop="annualTarget" label="年度预算(万元)" width="140">
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
      :title="isEdit ? '编辑收入指标' : '新增收入指标'"
      width="550px"
    >
      <el-form label-width="145px">
        <el-form-item label="团队">
          <el-select
            v-model="formData.teamConfigId"
            placeholder="请选择团队"
            style="width: 100%"
            :disabled="isEdit"
          >
            <el-option
              v-for="team in teamConfigList"
              :key="team.id"
              :label="team.teamName"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="统计日期">
          <el-date-picker
            v-model="formData.statisticsDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="本期累计收入(万元)">
          <el-input-number
            v-model="formData.currentIncome"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入本期累计收入"
          />
        </el-form-item>
        <el-form-item label="预算指标(万元)">
          <el-input-number
            v-model="formData.targetAmount"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入预算指标"
          />
        </el-form-item>
        <el-form-item label="去年同期收入(万元)">
          <el-input-number
            v-model="formData.lastYearIncome"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入去年同期收入"
          />
        </el-form-item>
        <el-form-item label="年度预算(万元)">
          <el-input-number
            v-model="formData.annualTarget"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入年度预算"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.team-income-target-wrapper {
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
