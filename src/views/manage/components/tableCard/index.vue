<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import DataBlock from "./dataBlock.vue";
import Search from "~icons/ep/search";
import RiAddLargeLine from "~icons/ri/add-large-line";
import DataTable from "./dataTable.vue";
import type { DataDialogMethods } from "@/views/manage/productDocumentation.vue";
import _ from "lodash";

// props
const props = defineProps({
  tableData: {
    type: Array<Record<string, any>>,
    required: true
  },
  tableLoading: {
    type: Boolean,
    default: false
  },
  dashboardData: {
    type: Object,
    required: true
  }
});

const pageParamsGettersSetters = inject<any>("pageParamsGettersSetters");

const dataBlocks = computed(() => {
  return [
    {
      title: "总数据量",
      value: Number(props.dashboardData?.totalDataCount || 0).toLocaleString(),
      color: "#155dfc"
    },
    {
      title: "向量维度",
      value: Number(0).toLocaleString(),
      color: "#00a63e"
    },
    {
      title: "有效数据",
      value: Number(props.dashboardData?.validDataCount || 0).toLocaleString(),
      color: "#9810fa"
    },
    {
      title: "最后更新",
      // value: "2023年11月20日",
      value: props.dashboardData?.lastUpdateTime || "--",
      color: "#f54900"
    }
  ];
});

// const dataBlocks = [
//   {
//     title: "总数据量",
//     value: Number(0).toLocaleString(),
//     color: "#155dfc"
//   },
//   {
//     title: "向量维度",
//     value: Number(0).toLocaleString(),
//     color: "#00a63e"
//   },
//   {
//     title: "有效数据",
//     value: Number(0).toLocaleString(),
//     color: "#9810fa"
//   },
//   {
//     title: "最后更新",
//     // value: "2023年11月20日",
//     value: "--",
//     color: "#f54900"
//   }
// ];

//#region 搜索数据逻辑
const dataSearch = ref("");
// 搜索后的表格数据
// const filteredTableData = computed(() => {
//   if (!dataSearch.value) {
//     return props.tableData;
//   }
//   return props.tableData.filter(item =>
//     item.title.toLowerCase().includes(dataSearch.value.toLowerCase())
//   );
// });
watch(dataSearch, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log("dataSearch.value", dataSearch.value);
    _.debounce(() => {
      pageParamsGettersSetters.setPageParams({
        searchStr:
          newVal === ""
            ? []
            : [
                {
                  searchName: "title",
                  searchType: "like",
                  searchValue: `${newVal}`
                }
              ]
      });
    }, 1000)();
  }
});
//#endregion

// 数据详情弹窗方法
const dataDialogMethods = inject<DataDialogMethods>("dataDialogMethods");

// 处理添加数据点击事件
const handleAddDataClick = () => {
  dataDialogMethods?.showDataDialog("add");
};
</script>

<template>
  <el-card shadow="never">
    <!-- 数据概览 -->
    <div>
      <div class="text-[18px] font-bold text-[#09090B]">A1-数据概览</div>
      <div class="flex items-center justify-between flex-wrap mt-[20px]">
        <DataBlock
          v-for="block in dataBlocks"
          :key="block.title"
          :title="block.title"
          :value="block.value"
          :color="block.color"
          :style="{ width: '20%', minWidth: '200px' }"
        />
      </div>
      <!-- 数据列表 -->
      <div class="mt-[30px]">
        <!-- 数据列表-标题&搜索框&添加数据 -->
        <div class="flex items-center justify-between mb-[20px]">
          <div class="text-[18px] font-bold text-[#09090B] min-w-[150px]">
            A2-数据列表
          </div>
          <div class="flex items-center">
            <div class="w-[250px] mr-[10px]">
              <el-input
                v-model="dataSearch"
                class="responsive-input"
                placeholder="搜索向量数据..."
                :prefix-icon="Search"
              />
            </div>
            <el-button
              type="primary"
              :icon="RiAddLargeLine"
              @click="handleAddDataClick"
              >添加数据</el-button
            >
          </div>
        </div>
        <!-- 数据列表-表格 -->
        <DataTable
          v-loading="props.tableLoading"
          :tableDataSource="tableData"
        />
      </div>
    </div>
  </el-card>
</template>
