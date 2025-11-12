<script setup lang="ts">
import EpEdit from "~icons/ep/edit";
import EpDelete from "~icons/ep/delete";
import EpDownload from "~icons/ep/download";
import IconParkOutlinePreviewOpen from "~icons/icon-park-outline/preview-open";
import { computed, inject, reactive, ref, watch } from "vue";
import type { DataDialogMethods } from "@/views/manage/productDocumentation.vue";
import { ElMessageBox } from "element-plus";
import {
  getCommonDownload,
  getCommonDownloadUrl,
  postMilvusDelete
} from "@/api/vdb";
import { message } from "@/utils/message";

// props
const props = defineProps({
  tableDataSource: {
    type: Array,
    required: true
  }
});

//#region 数据状态类型判断
// [
//   { id: 109, value: "valid", type: "docStatus" },
//   { id: 110, value: "obsolete", type: "docStatus" },
//   { id: 111, value: "draft", type: "docStatus" }
// ];
const docStatusEnum = inject<any>("docStatusEnum");
const judgeStatusType = status => {
  switch (status) {
    case "有效":
      return "primary";
    case "草稿":
      return "info";
    case "停用":
      return "danger";
    default:
      return "primary";
  }
};
// 用计算属性来判断数据状态的标签 value改成了中文已经不需要判断id了
const judgeStatusLabel = computed(() => {
  return id => {
    // console.log("docStatusEnum:", docStatusEnum);
    const docStatusEnumArray = docStatusEnum?.value || [];
    // console.log("docStatusEnumArray:", docStatusEnumArray);
    if (docStatusEnumArray.length === 0) return "valid";
    const statusItem = docStatusEnumArray?.find(item => item.id === Number(id));
    // console.log("statusItem:", statusItem);
    return statusItem?.value || "valid";
  };
});
//#endregion

let tableData = ref<any>([
  // {
  //   // -文档标题 -报告编号 -文档类型 -产品名称 -文档状态 -入库时间
  //   title: "产品A安全数据表(MSDS)",
  //   milvusId: "MSDS-2023-001",
  //   reportType: "MSDS",
  //   productName: "产品A",
  //   docStatus: "有效",
  //   reportDate: "2023年10月16日 17:30"
  // }
]);

//#region tableData 复制n份
// const n = 100;
// tableData = tableData.flatMap(item => Array(n).fill(item));
//#endregion

//#region 分页相关逻辑
// 注入分页参数和分页结果
const pageParamsGettersSetters = inject<any>("pageParamsGettersSetters");
const currentPage = computed(() => {
  return pageParamsGettersSetters.getPageResult().current;
});
const pageSize = computed(() => {
  return pageParamsGettersSetters.getPageResult().size;
});
const pageTotal = computed(() => {
  return pageParamsGettersSetters.getPageResult().total;
});
// 计算属性 -当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});

const handleSizeChange = size => {
  console.log("每页条数:", size);
  // pageSize.value = size;
  // 更新分页参数
  pageParamsGettersSetters.setPageParams({
    pageSize: size
  });
};
const handleCurrentChange = page => {
  console.log("当前页码:", page);
  // currentPage.value = page;
  // 更新分页参数
  pageParamsGettersSetters.setPageParams({
    pageNo: page
  });
};

//#endregion

// 数据详情弹窗方法
const dataDialogMethods = inject<DataDialogMethods>("dataDialogMethods");
const handleEditClick = row => {
  console.log("编辑点击:", row);
  dataDialogMethods?.initDataDialog(row);
  dataDialogMethods?.showDataDialog("edit");
};

watch(
  () => props.tableDataSource,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      console.log("tableDataSource 变化:", newVal);
      tableData.value = newVal;
    }
  }
);

//#region 触发右侧文件详情逻辑
// 获取注入
const updateDocumentDetailData = inject<any>("updateDocumentDetailData");
// 点击数据列表
const handleClickTableLine = row => {
  console.log("点击数据列表:", row);
  // 现在通过预览来显示，暂时不使用这个逻辑
  // updateDocumentDetailData(row);
};
//#endregion

// 点击预览
const handlePreviewClick = (row: any) => {
  // console.log("预览点击:", row);
  updateDocumentDetailData(row);
};

//#region 数据删除逻辑
// 删除点击
const handleDeleteClick = row => {
  console.log("删除点击:", row);
  ElMessageBox.confirm(`确定删除文档 【${row.title}】 吗？`, "注意", {
    confirmButtonText: "确定",
    type: "warning",
    showCancelButton: false,
    confirmButtonClass: "el-button--danger" // 可以用element自带的，也可以完全自定义
  })
    .then(() => fetchDeleteMilvus(row))
    .catch(() => {});
};

// 获取分页数据方法
const fetchMilvusPage = inject<() => void>("fetchMilvusPage");
// 删除知识库
const fetchDeleteMilvus = async (data: any) => {
  try {
    const res: any = await postMilvusDelete(data);
    console.log("删除知识库", res);
    if (res.code === 200) {
      message("删除知识库成功", { type: "success" });
      // 刷新分页数据
      fetchMilvusPage();
    } else {
      message(res.msg || "删除知识库失败", { type: "error" });
    }
  } catch (error) {
    message("删除知识库失败", { type: "error" });
  }
};
//#endregion

//#region 数据下载逻辑
// 下载点击
const handleDownloadClick = row => {
  console.log("下载点击:", row);
  // 调用下载文件接口
  fetchDownloadFile(row.source);
};
// 下载文件方法
const fetchDownloadFile = async (objectName: string) => {
  try {
    const res: any = await getCommonDownloadUrl(objectName);
    console.log("下载文件成功", res);
    // 返回的res.data是url
    // 模拟a标签
    const link = document.createElement("a");
    link.href = res.data;
    link.download = objectName.split("/").pop();
    link.click();
    // 释放内存
    URL.revokeObjectURL(link.href);
    // message("下载文件成功", { type: "success" });
  } catch (error) {
    message("下载文件失败", { type: "error" });
  }
};
//#endregion
</script>

<template>
  <el-card shadow="never" body-style="padding: 0;">
    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%; color: #09090b"
      :header-cell-style="{ color: '#09090b' }"
      max-height="740px"
      highlight-current-row
      @current-change="handleClickTableLine"
    >
      <el-table-column prop="title" label="标题" min-width="400">
        <template #default="scope">
          <p class="text-[14px] text-[#09090b] font-bold">
            {{ scope.row.title }}
          </p>
          <p class="text-[12px] text-[#71717a]">{{ scope.row.milvusId }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="reportType" label="类型" width="200">
        <template #default="scope">
          <el-tag effect="plain" type="info">
            <span class="text-[#09090b]">{{ scope.row.reportType }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="产品" width="200" />
      <el-table-column prop="docStatus" label="状态" width="100">
        <template #default="scope">
          <el-tag effect="dark" :type="judgeStatusType(scope.row.docStatus)">
            {{ scope.row.docStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reportDate" label="入库时间" width="180" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-tooltip content="预览" placement="top" :show-after="500">
            <el-button
              text
              size="large"
              style="width: 36px; height: 36px"
              @click="handlePreviewClick(scope.row)"
            >
              <IconParkOutlinePreviewOpen
                color="#09090b"
                style="font-size: 16px"
              />
            </el-button>
          </el-tooltip>
          <el-tooltip content="编辑" placement="top" :show-after="500">
            <el-button
              text
              size="large"
              style="width: 36px; height: 36px"
              @click="handleEditClick(scope.row)"
            >
              <EpEdit color="#09090b" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="下载" placement="top" :show-after="500">
            <el-button
              text
              size="large"
              style="width: 36px; height: 36px"
              @click="handleDownloadClick(scope.row)"
            >
              <EpDownload color="#09090b" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" :show-after="500">
            <el-button
              text
              size="large"
              style="width: 36px; height: 36px"
              @click="handleDeleteClick(scope.row)"
            >
              <EpDelete color="#09090b" />
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="py-[10px] pl-[15px]">
      <el-pagination
        :current-page="currentPage"
        size="large"
        :page-size="pageSize"
        :page-sizes="[10, 30, 100]"
        layout="total, sizes, prev, pager, next"
        :total="pageTotal"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </el-card>
</template>
