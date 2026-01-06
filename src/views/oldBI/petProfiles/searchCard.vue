<script setup lang="ts">
import dayjs from "dayjs";
import { type FormInstance } from "element-plus";
import { inject, reactive, ref } from "vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true
  }
});

const fetchShuyunNickPage = inject<(searchStr: string) => void>(
  "fetchShuyunNickPage",
  () => {
    console.error("fetchShuyunNickPage not provided");
  }
);

const CONSTELLATION_OPTIONS = [
  {
    label: "水瓶座(1.20-2.18)",
    value: "水瓶座"
  },
  {
    label: "双鱼座(2.19-3.20)",
    value: "双鱼座"
  },
  {
    label: "白羊座(3.21-4.19)",
    value: "白羊座"
  },
  {
    label: "金牛座(4.20-5.20)",
    value: "金牛座"
  },
  {
    label: "双子座(5.21-6.20)",
    value: "双子座"
  },
  {
    label: "巨蟹座(6.21-7.22)",
    value: "巨蟹座"
  },
  {
    label: "狮子座(7.23-8.22)",
    value: "狮子座"
  },
  {
    label: "处女座(8.23-9.22)",
    value: "处女座"
  },
  {
    label: "天秤座(9.23-10.22)",
    value: "天秤座"
  },
  {
    label: "天蝎座(10.23-11.21)",
    value: "天蝎座"
  },
  {
    label: "射手座(11.22-12.21)",
    value: "射手座"
  },
  {
    label: "摩羯座(12.22-1.19)",
    value: "摩羯座"
  }
];
const PET_BIRTH_MONTH_OPTIONS = [
  {
    label: "1月",
    value: "1"
  },
  {
    label: "2月",
    value: "2"
  },
  {
    label: "3月",
    value: "3"
  },
  {
    label: "4月",
    value: "4"
  },
  {
    label: "5月",
    value: "5"
  },
  {
    label: "6月",
    value: "6"
  },
  {
    label: "7月",
    value: "7"
  },
  {
    label: "8月",
    value: "8"
  },
  {
    label: "9月",
    value: "9"
  },
  {
    label: "10月",
    value: "10"
  },
  {
    label: "11月",
    value: "11"
  },
  {
    label: "12月",
    value: "12"
  }
];

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  nick: "",
  pet_birth_month: [dayjs().month() + 1 + ""],
  constellation: []
});

const getSearchStr = () => {
  const searchStrTemp = [];
  if (searchForm.nick) {
    searchStrTemp.push({
      searchName: "nick",
      searchType: "like",
      searchValue: searchForm.nick
    });
  }
  if (searchForm.pet_birth_month.length > 0) {
    searchStrTemp.push({
      searchName: "pet_birth_month",
      searchType: "equals",
      searchValue: searchForm.pet_birth_month.join("&#&")
    });
  }
  if (searchForm.constellation.length > 0) {
    searchStrTemp.push({
      searchName: "constellation",
      searchType: "equals",
      searchValue: stringArrayFormat(searchForm.constellation)
    });
  }
  function stringArrayFormat(strArray: string[]) {
    return strArray.map(item => `"${item}"`).join("&#&");
  }
  return JSON.stringify(searchStrTemp);
};

const handleSearch = () => {
  const searchStr = getSearchStr();
  // console.log("searchStr:", searchStr);
  fetchShuyunNickPage(searchStr);
};

const handleReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl?.resetFields();
};
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchForm"
      class="peidi-oldBI-petProfiles-searchCard"
    >
      <el-form-item label="会员昵称" prop="nick">
        <el-input
          v-model="searchForm.nick"
          placeholder="请输入会员昵称(支持模糊搜索)"
          clearable
        />
      </el-form-item>
      <el-form-item label="生日月" prop="pet_birth_month">
        <el-select
          v-model="searchForm.pet_birth_month"
          placeholder="请选择生日月(可多选)"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
        >
          <el-option
            v-for="item in PET_BIRTH_MONTH_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="星座" prop="constellation">
        <el-select
          v-model="searchForm.constellation"
          placeholder="请选择星座(可多选)"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
        >
          <el-option
            v-for="item in CONSTELLATION_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleReset(searchFormRef)">重置</el-button>
        <el-button type="primary" :loading="isLoading" @click="handleSearch"
          >查询</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.peidi-oldBI-petProfiles-searchCard .el-input {
  --el-input-width: 220px;
}

.peidi-oldBI-petProfiles-searchCard .el-select {
  --el-select-width: 220px;
}

:deep(.el-card__body) {
  padding-bottom: 2px;
}
</style>
