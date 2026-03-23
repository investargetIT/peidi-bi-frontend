<script setup lang="ts">
import dayjs from "dayjs";
import { FormInstance } from "element-plus";
import { reactive, ref } from "vue";

const props = defineProps({
  searchFn: {
    type: Function,
    required: true
  }
});

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  date: [
    dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    dayjs().subtract(1, "day").format("YYYY-MM-DD")
  ] // 默认昨天
});

const handleReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl?.resetFields();
  handleSearch();
};

const handleSearch = () => {
  props.searchFn();
};

const getSearchStr = () => {
  const searchStr = [];

  if (searchForm.date && searchForm.date.length === 2) {
    searchStr.push({
      searchName: "date",
      searchType: "betweenStr",
      searchValue: [
        dayjs(searchForm.date[0]).format("YYYY-MM-DD 00:00:00"),
        dayjs(searchForm.date[1]).format("YYYY-MM-DD 23:59:59")
      ].join(",")
    });
  }

  return JSON.stringify(searchStr);
};

defineExpose({
  getSearchStr
});
</script>

<template>
  <div>
    <el-card shadow="never" style="border-radius: 10px" class="search-card">
      <el-form
        ref="searchFormRef"
        :inline="true"
        :model="searchForm"
        class="demo-form-inline"
      >
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="searchForm.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="handleReset(searchFormRef)">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

:deep(.search-card .el-card__body) {
  padding-bottom: 0;
}
</style>
