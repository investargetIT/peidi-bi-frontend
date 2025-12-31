<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import { getShuyunNickPage } from "@/api/oldbi";
import SearchCard from "./searchCard.vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { da } from "element-plus/es/locale/index.mjs";

const TABLE_COLUMNS_CONFIG = [
  {
    prop: "nick",
    label: "会员昵称",
    width: 25
  },
  {
    prop: "customer_level",
    label: "会员等级",
    width: 10
  },
  {
    prop: "pet_type",
    label: "宠物体型",
    width: 10
  },
  {
    prop: "pet_breed",
    label: "宠物品种",
    width: 10
  },
  {
    prop: "pet_sex",
    label: "宠物性别",
    width: 10
  },
  {
    prop: "sterilization",
    label: "绝育状态",
    width: 10
  },
  {
    prop: "pet_birth",
    label: "宠物生日",
    width: 12,
    format: value => dayjs(value).format("YYYY/MM/DD")
  },
  {
    prop: "age",
    label: "宠物年龄",
    width: 10
  },
  {
    prop: "pet_birth_month",
    label: "生日月",
    width: 10
  },
  {
    prop: "constellation",
    label: "星座",
    width: 10
  },
  {
    prop: "pet_picture",
    label: "宠物图片",
    width: 100,
    hyperlink: {
      url: (value: string) => `${value}`,
      text: (value: string) => `${value}`
    }
  }
];

// 添加缺失的变量
const TABLE_DATA = ref<PetProfile[]>([]);
const FILE_NAME = "宠物档案数据";

const isLoading = ref(false);

export interface PetProfile {
  pet_birth_month: number; // 生日月
  nick: string; // 会员昵称
  pet_birth: string; // 宠物生日
  pet_picture: string; // 宠物图片
  pet_breed: string; // 宠物品种
  pet_sex: string; // 宠物性别
  constellation: string; // 星座
  pet_type: string; // 宠物体型
  sterilization: string; // 绝育状态
  customer_level: string; // 会员等级
  customer_id: string; // 客户唯一标识ID
  age: number; // 宠物年龄
}

const tableData = ref<PetProfile[]>([]);

//#region 请求相关
const fetchShuyunNickPage = (searchStr: string) => {
  isLoading.value = true;
  getShuyunNickPage({
    pageNo: 1,
    pageSize: 999999,
    searchStr: searchStr
  })
    .then((res: any) => {
      // console.log("fetchShuyunNickPage:", res);
      if (res.code === 200) {
        tableData.value = res.data.records;
      } else {
        ElMessage.error(res.msg || "获取数据失败");
      }
    })
    .catch((err: any) => {
      // console.log("fetchShuyunNickPage error:", err);
      ElMessage.error(err.message || "获取数据失败");
    })
    .finally(() => {
      isLoading.value = false;
    });
};
provide("fetchShuyunNickPage", fetchShuyunNickPage);
//#endregion
</script>

<template>
  <div>
    <SearchCard :isLoading="isLoading" />

    <el-card shadow="never" style="border-radius: 10px" class="mt-[20px]">
      <div class="flex justify-between items-center mb-[10px]">
        <div>
          宠物档案<span>({{ tableData.length }})</span>
        </div>
        <div>
          <pd-ExcelExport
            title="导出数据"
            :data="tableData"
            :columnsConfig="TABLE_COLUMNS_CONFIG"
            :fileName="'宠物档案数据'"
          />
        </div>
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        :header-cell-style="{ color: '#0a0a0a' }"
        size="small"
      >
        <el-table-column prop="nick" label="会员昵称" />
        <el-table-column prop="customer_level" label="会员等级" />
        <el-table-column prop="pet_type" label="宠物体型" />
        <el-table-column prop="pet_breed" label="宠物品种" />
        <el-table-column prop="pet_sex" label="宠物性别" />
        <el-table-column prop="sterilization" label="绝育状态" />
        <el-table-column prop="pet_birth" label="宠物生日">
          <template #default="scope">
            {{ dayjs(scope.row.pet_birth).format("YYYY/MM/DD") }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="宠物年龄">
          <template #default="scope">
            {{ scope.row.age.toFixed(0) }}
          </template>
        </el-table-column>
        <el-table-column prop="pet_birth_month" label="生日月" />
        <el-table-column prop="constellation" label="星座" />
        <el-table-column
          prop="pet_picture"
          label="宠物图片"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-image
              v-if="scope.row.pet_picture.indexOf('.heic') === -1"
              :src="scope.row.pet_picture"
              fit="cover"
              :preview-src-list="[scope.row.pet_picture]"
              preview-teleported
              :style="{ width: '60px', height: '60px' }"
            />
            <a v-else :href="scope.row.pet_picture" target="_blank">
              {{ scope.row.pet_picture }}
            </a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
a {
  color: #007bff;
}
</style>
