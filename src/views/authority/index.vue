<script setup lang="ts">
import { computed, ref } from "vue";
import RiUserAddLine from "~icons/ri/user-add-line";
import Search from "~icons/ep/search";
import { useNav } from "@/layout/hooks/useNav";
const { userAvatar, avatarsStyle } = useNav();

const userSearch = ref("");

const userData = [
  {
    // 用户 角色 邮箱 可访问集合
    user: "admin",
    role: "admin",
    email: "admin@example.com",
    accessibleCollections: ["collection1", "collection2"]
  },
  {
    user: "张三",
    role: "user",
    email: "zhangsan@example.com",
    accessibleCollections: ["collection1"]
  },
  {
    user: "李四",
    role: "user",
    email: "lisi@example.com",
    accessibleCollections: ["collection2"]
  }
];

const userTableData = computed(() => {
  return userData.filter(item => {
    return item.user.includes(userSearch.value);
  });
});
</script>

<template>
  <div>
    <!-- 权限管理头部 -->
    <div class="peidi-authority-header flex justify-between items-center">
      <div class="text-[20px] font-bold">用户管理</div>
      <div>
        <el-button type="primary" :icon="RiUserAddLine">添加用户</el-button>
      </div>
    </div>
    <!-- 搜索用户 -->
    <div class="peidi-authority-search py-[20px]">
      <div class="w-[350px]">
        <el-input
          v-model="userSearch"
          class="responsive-input"
          placeholder="搜索用户..."
          :prefix-icon="Search"
        />
      </div>
    </div>
    <!-- 用户列表 -->
    <div class="peidi-authority-table">
      <el-table
        :data="userTableData"
        style="width: 100%"
        :header-cell-style="{ color: '#000' }"
      >
        <el-table-column prop="user" label="用户" width="180">
          <template #default="scope">
            <div class="flex items-center">
              <img
                class="w-[24px] mr-[5px]"
                :src="userAvatar"
                :style="avatarsStyle"
              />
              {{ scope.row.user }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="180">
          <template #default="scope">
            <el-tag effect="dark">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="accessibleCollections" label="可访问集合">
          <template #default="scope">
            <el-tag
              v-for="item in scope.row.accessibleCollections"
              :key="item"
              effect="plain"
              class="mr-[5px]"
            >
              {{ item }}<span class="text-[#71717a]">（管理）</span>
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
