<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getTeamIncomeTargetList,
  type BiTeamIncomeTarget
} from "@/api/businessAnalysis";
import { Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableData = ref<BiTeamIncomeTarget[]>([]);
const loading = ref(false);
const selectedYear = ref<number>(dayjs().year());
const searchText = ref("");

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

const filteredTableData = computed(() => {
  if (!searchText.value) return tableData.value;
  return tableData.value.filter(item =>
    item.channel?.includes(searchText.value)
  );
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res: any = await getTeamIncomeTargetList({
      year: selectedYear.value
    });
    if (res.success) {
      tableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="team-income-target-wrapper">
    <div class="toolbar">
      <div class="search-bar">
        <el-date-picker
          v-model="selectedYear"
          type="year"
          placeholder="选择年份"
          format="YYYY"
          value-format="YYYY"
          style="width: 150px"
          @change="fetchList"
        />
        <el-input
          v-model="searchText"
          placeholder="搜索渠道"
          clearable
          :prefix-icon="Search"
          style="width: 300px; margin-left: 12px"
        />
      </div>
    </div>

    <el-table v-loading="loading" :data="filteredTableData" border stripe>
      <el-table-column label="渠道" min-width="150">
        <template #default="{ row }">
          {{ row.channel }}
        </template>
      </el-table-column>
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
      <el-table-column label="达成情况(%)" width="120">
        <template #default="{ row }">
          <el-tag
            v-if="calcAchievementStatus(row) !== null"
            :type="calcAchievementStatus(row)! >= 100 ? 'success' : 'warning'"
          >
            {{ calcAchievementStatus(row) }}%
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastYearIncome" label="去年同期(万元)" width="140">
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
            {{ calcYearOnYear(row)! > 0 ? "+" : "" }}{{ calcYearOnYear(row) }}%
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="annualTarget" label="年度预算(万元)" width="140">
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
      <el-table-column prop="createAt" label="创建时间" width="180" />
    </el-table>
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
