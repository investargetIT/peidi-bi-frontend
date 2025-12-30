<script setup lang="ts">
import { reactive } from "vue";

const CONSTELLATION_OPTIONS = [
  {
    label: "白羊座",
    value: "白羊座"
  },
  {
    label: "金牛座",
    value: "金牛座"
  },
  {
    label: "双子座",
    value: "双子座"
  },
  {
    label: "巨蟹座",
    value: "巨蟹座"
  },
  {
    label: "狮子座",
    value: "狮子座"
  },
  {
    label: "处女座",
    value: "处女座"
  },
  {
    label: "天秤座",
    value: "天秤座"
  },
  {
    label: "天蝎座",
    value: "天蝎座"
  },
  {
    label: "射手座",
    value: "射手座"
  },
  {
    label: "摩羯座",
    value: "摩羯座"
  },
  {
    label: "水瓶座",
    value: "水瓶座"
  },
  {
    label: "双鱼座",
    value: "双鱼座"
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

const searchForm = reactive({
  nick: "",
  pet_birth_month: "",
  constellation: ""
});
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <el-form
      :inline="true"
      :model="searchForm"
      class="peidi-oldBI-petProfiles-searchCard"
    >
      <el-form-item label="会员昵称">
        <el-input
          v-model="searchForm.nick"
          placeholder="请输入会员昵称"
          clearable
        />
      </el-form-item>
      <el-form-item label="生日月">
        <el-select
          v-model="searchForm.pet_birth_month"
          placeholder="请选择生日月"
          clearable
        >
          <el-option
            v-for="item in PET_BIRTH_MONTH_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="星座">
        <el-select
          v-model="searchForm.constellation"
          placeholder="请选择星座"
          clearable
        >
          <el-option
            v-for="item in CONSTELLATION_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
</style>
