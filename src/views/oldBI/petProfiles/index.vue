<script setup lang="ts">
import { onMounted, provide, ref, nextTick, watch, onUnmounted } from "vue";
import { getShuyunNickPage } from "@/api/oldbi";
import SearchCard from "./searchCard.vue";
import OnlineImg from "./components/onlineImg.vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

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

const tableRef = ref();
const tableData = ref<PetProfile[]>([]);
const tableSourceData = ref<PetProfile[]>([]);

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
        tableSourceData.value = res.data.records;

        tableData.value = [];
        currentLoadedIndex.value = 0;
        isAllDataLoaded.value = false;
        scrollToTop();

        assignTableData();
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

//#region 表格滚动相关逻辑
const scrollLoading = ref(false);
// 添加分页相关变量
const currentLoadedIndex = ref(0); // 当前已加载的数据索引
const batchSize = 50; // 每次加载的数据量
const isAllDataLoaded = ref(false); // 是否所有数据都已加载
// 滚动赋值函数
const assignTableData = () => {
  if (isAllDataLoaded.value) {
    return;
  }

  const remainingData = tableSourceData.value.length - currentLoadedIndex.value;

  if (remainingData <= 0) {
    isAllDataLoaded.value = true;
    return;
  }

  scrollLoading.value = true;
  const loadCount = Math.min(batchSize, remainingData);
  const newData = tableSourceData.value.slice(
    currentLoadedIndex.value,
    currentLoadedIndex.value + loadCount
  );

  // 将新数据添加到tableData中
  tableData.value = [...tableData.value, ...newData];
  currentLoadedIndex.value += loadCount;
  scrollLoading.value = false;

  if (currentLoadedIndex.value >= tableSourceData.value.length) {
    isAllDataLoaded.value = true;
  }
};

// 添加滚动相关变量
const isScrollingToBottom = ref(false);
const scrollEventBound = ref(false);

// 滚动条到顶部
const scrollToTop = () => {
  if (!tableRef.value) return;

  const scrollWrapper =
    tableRef.value.$refs.bodyWrapper?.getElementsByClassName(
      "el-scrollbar__wrap"
    )[0];

  if (scrollWrapper) {
    scrollWrapper.scrollTop = 0;
  }
};

const bindScrollEvent = () => {
  if (scrollEventBound.value) return;

  if (!tableRef.value) {
    setTimeout(bindScrollEvent, 500);
    return;
  }

  // 获取表格的滚动容器
  const scrollWrapper =
    tableRef.value.$refs.bodyWrapper?.getElementsByClassName(
      "el-scrollbar__wrap"
    )[0];

  if (!scrollWrapper) {
    setTimeout(bindScrollEvent, 500);
    return;
  }

  // 移除可能已存在的事件监听器
  scrollWrapper.removeEventListener("scroll", handleTableScroll);

  // 添加新的事件监听器
  scrollWrapper.addEventListener("scroll", handleTableScroll, {
    passive: true
  });
  scrollEventBound.value = true;
};

const handleTableScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  const scrollDistance =
    target.scrollHeight - target.scrollTop - target.clientHeight;

  // console.log("滚动信息:", {
  //   scrollHeight: target.scrollHeight,
  //   scrollTop: target.scrollTop,
  //   clientHeight: target.clientHeight,
  //   distance: scrollDistance
  // });

  // 判断是否接近底部
  if (scrollDistance <= 1000) {
    if (!isScrollingToBottom.value) {
      isScrollingToBottom.value = true;
      // console.log("触发底部加载");

      assignTableData();
    }
  } else {
    isScrollingToBottom.value = false;
  }
};

// 清理滚动事件的函数
const cleanupScrollEvent = () => {
  if (!tableRef.value || !scrollEventBound.value) return;

  try {
    const scrollWrapper =
      tableRef.value.$refs.bodyWrapper?.getElementsByClassName(
        "el-scrollbar__wrap"
      )[0];

    if (scrollWrapper) {
      scrollWrapper.removeEventListener("scroll", handleTableScroll);
      // console.log("滚动事件监听器已移除");
    }
  } catch (error) {
    console.warn("清理滚动事件时出错:", error);
  } finally {
    scrollEventBound.value = false;
  }
};
//#endregion

onMounted(() => {
  // 等待表格渲染完成
  nextTick(() => {
    setTimeout(() => {
      bindScrollEvent();
    }, 300);
  });

  // 监听数据变化，数据加载完成后再绑定
  watch(
    tableData,
    newData => {
      if (newData.length > 0 && !scrollEventBound.value) {
        // console.log("数据已加载，重新绑定滚动事件");
        nextTick(() => {
          setTimeout(() => {
            bindScrollEvent();
          }, 300);
        });
      }
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  cleanupScrollEvent();
});
</script>

<template>
  <div>
    <SearchCard :isLoading="isLoading" />

    <el-card shadow="never" style="border-radius: 10px" class="mt-[20px]">
      <div class="flex justify-between items-center mb-[10px]">
        <div>
          宠物档案<span>({{ tableSourceData.length }})</span>
        </div>
        <div>
          <pd-ExcelExport
            title="导出数据"
            :data="tableSourceData"
            :columnsConfig="TABLE_COLUMNS_CONFIG"
            :fileName="'宠物档案数据'"
          />
        </div>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        style="width: 100%"
        :header-cell-style="{ color: '#0a0a0a' }"
        size="small"
        height="650"
        v-loading="scrollLoading"
        :row-key="row => row.customer_id + row.pet_birth"
      >
        <el-table-column type="index" width="50" />
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
            {{ scope.row.age ? scope.row.age.toFixed(0) : "N/A" }}
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
            <!-- <OnlineImg
              v-if="scope.row.pet_picture.indexOf('.heic') === -1"
              :url="scope.row.pet_picture"
              :size="'60px'"
            /> -->
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
