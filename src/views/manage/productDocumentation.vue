<script setup lang="ts">
import Layout from "@/views/manage/components/layout/index.vue";
import TitleCard from "@/views/manage/components/titleCard/index.vue";
import TableCard from "@/views/manage/components/tableCard/index.vue";
import DocumentDetail from "@/views/manage/components/documentDetail/index.vue";
import DataDialog from "@/views/manage/components/dataDialog/index.vue";
import { computed, onMounted, provide, ref, watch } from "vue";
import type { DialogType } from "@/views/manage/components/dataDialog/index.vue";
import LinkDetail from "@/views/manage/components/linkDetail/index.vue";
import { getMilvusPage, getCommonEnum, getMilvusDashboard } from "@/api/vdb";
import { message } from "@/utils/message";
import { useRoute } from "vue-router";
import DocumentDetailDialog from "@/views/manage/components/documentDetailDialog/index.vue";
import dayjs from "dayjs";

//#region 数据概览逻辑
const usageList = ref<any[]>([]);
const validList = ref<any[]>([]);
// 计算属性 -来获得数据概览需要的所有数据
const dashboardData = computed(() => {
  // 当前文档类型
  const currentDocType = handleTitleCardTitle().title;
  // 总数据量
  const totalDataCount =
    usageList.value.find((item: any) => item.field === currentDocType)?.cnt ||
    0;
  // 有效数据量
  const validDataCount =
    validList.value.find((item: any) => item.field === currentDocType)?.cnt ||
    0;
  // 最后更新时间 默认为今天
  const lastUpdateTime = dayjs().format("YYYY-MM-DD");

  return {
    totalDataCount,
    validDataCount,
    lastUpdateTime
  };
});
// 获取数据总览方法
const fetchMilvusDashboard = () => {
  getMilvusDashboard()
    .then((res: any) => {
      if (res.code === 200) {
        usageList.value = res.data?.usageList || [];
        validList.value = res.data?.validList || [];
      } else {
        message("获取数据总览失败", { type: "error" });
      }
    })
    .catch(() => {
      message("获取数据总览失败", { type: "error" });
    });
};
//#endregion

//#region 请求数据状态枚举
const docStatusEnum = ref<any[]>([]);
// 请求数据状态
const fetchDocStatusEnum = () => {
  return getCommonEnum("docStatus")
    .then((res: any) => {
      if (res?.code === 200) {
        // 处理成功逻辑
        docStatusEnum.value = res?.data || [];
      } else {
        // 处理失败逻辑
        message("请求数据状态失败", { type: "error" });
      }
    })
    .catch(() => {
      // 处理失败逻辑
      message("请求数据状态失败", { type: "error" });
    });
};
provide("docStatusEnum", docStatusEnum);
//#endregion

//#region 请求报告类型枚举
const reportTypeEnum = ref<any[]>([]);
// 请求报告类型
const fetchReportTypeEnum = () => {
  return getCommonEnum("reportType")
    .then((res: any) => {
      if (res?.code === 200) {
        // 处理成功逻辑
        reportTypeEnum.value = res?.data || [];
      } else {
        // 处理失败逻辑
        message("请求报告类型失败", { type: "error" });
      }
    })
    .catch(() => {
      // 处理失败逻辑
      message("请求报告类型失败", { type: "error" });
    });
};
provide("reportTypeEnum", reportTypeEnum);
//#endregion

//#region 请求分页数据
// 分页数据加载状态
const tableLoading = ref(true);
const route = useRoute();
// 数据列表
const milvusPageList = ref<any[]>([]);

//#region 分页相关逻辑
// 分页请求参数
const pageParams = ref({
  pageNo: 1,
  pageSize: 10,
  searchStr: []
});
// 分页请求结果
const pageResult = ref<any>({
  current: 0,
  pages: 0,
  size: 0,
  total: 0
});
// 整合分页参数和分页结果
const pageParamsGettersSetters = {
  // get
  getPageParams: () => {
    return {
      ...pageParams.value
    };
  },
  getPageResult: () => {
    return {
      ...pageResult.value
    };
  },
  // set
  setPageParams: (val: any) => {
    pageParams.value = {
      ...pageParams.value,
      ...val
    };
  },
  setPageResult: (val: any) => {
    pageResult.value = {
      ...pageResult.value,
      ...val
    };
  }
};
// 监听分页参数变化
watch(
  pageParams,
  (newVal: any, oldVal: any) => {
    if (
      newVal.pageNo !== oldVal.pageNo ||
      newVal.pageSize !== oldVal.pageSize ||
      newVal.searchStr !== oldVal.searchStr
    ) {
      console.log("分页参数变化:", newVal, oldVal);
      fetchMilvusPage();
    }
  },
  { deep: true }
);
provide("pageParamsGettersSetters", pageParamsGettersSetters);
//#endregion

// 筛选标题卡片数据
const handleTitleCardTitle = () => {
  // reportTypeEnum 中查找当前路由对应的报告类型
  // console.log("当前路由路径:", route.path.split("/")[2], reportTypeEnum.value);
  const reportType = reportTypeEnum.value.find(
    item => item.id.toString() === route.path.split("/")[2]
  );
  // 如果找到对应的报告类型，返回其名称和子标题
  // console.log("报告类型:", reportType);
  if (reportType) {
    return {
      title: reportType.value,
      subTitle: ""
    };
  } else {
    return {
      title: "",
      subTitle: ""
    };
  }
};

// 请求分页数据
const handleReportType = () => {
  const reportType = reportTypeEnum.value.find(
    item => item.id.toString() === route.path.split("/")[2]
  );
  // console.log("handleReportType报告类型:", reportType, reportTypeEnum.value);
  if (reportType) {
    return [
      {
        searchName: "reportType",
        searchType: "equals",
        searchValue: `"${reportType.value}"`
      }
    ];
  } else {
    return [];
  }
};

const fetchMilvusPage = () => {
  // 把请求数据总览方法放到这里，因为修改数据状态后表格和总览数据会变化
  fetchMilvusDashboard();

  tableLoading.value = true;

  // 目前三个路由界面风格统一，所以根据地址判断文档类型参数
  const searchStr = JSON.stringify([
    ...handleReportType(),
    ...pageParams.value.searchStr
  ]);
  getMilvusPage({
    ...pageParams.value,
    searchStr // 会覆盖一次pageParams.value.searchStr
  })
    .then((res: any) => {
      if (res?.code === 200) {
        // 处理成功逻辑
        // 如果当前页大于总页数，重置为第一页 排除总页数为0的情况
        if (res?.data?.current > res?.data?.pages && res?.data?.pages !== 0) {
          pageParams.value.pageNo = 1;
          return;
        }
        milvusPageList.value = res?.data?.records || [];
        // 更新分页结果
        pageResult.value = {
          current: res?.data?.current || 0,
          pages: res?.data?.pages || 0,
          size: res?.data?.size || 0,
          total: res?.data?.total || 0
        };
      } else {
        // 处理失败逻辑
        message("请求分页数据失败", { type: "error" });
        console.log("请求分页数据失败", res);
      }
      tableLoading.value = false;
    })
    .catch((error: any) => {
      // 处理失败逻辑
      message("请求分页数据失败", { type: "error" });
      console.log("请求分页数据失败", error);
      tableLoading.value = false;
    });
};
provide("fetchMilvusPage", fetchMilvusPage);
//#endregion

//#region 数据详情弹窗逻辑
// 数据详情弹窗方法接口
export interface DataDialogMethods {
  showDataDialog: (type: DialogType) => void;
  initDataDialog: (data: Record<string, any>) => void;
}

const dataDialogRef = ref<typeof DataDialog>();

// 数据详情弹窗 -显示事件
const showDataDialog = (type: DialogType = "add") => {
  // 组件功能尽量解耦，这边对add类型进行初始化是为了给form一个空的快照，不然会影响resetFields方法
  if (type === "add") {
    initDataDialog({
      reportType: handleTitleCardTitle().title,
      visibility: "all" // 注意初始化需要的是接口返回字段，不是我定义的字段
    });
  }
  dataDialogRef.value?.showDataDialog(type);
};
// 数据详情弹窗 -初始化事件
const initDataDialog = (data: Record<string, any>) => {
  dataDialogRef.value?.initDataDialog(data);
};
// 数据详情弹窗方法集合
const dataDialogMethods = (): DataDialogMethods => {
  return {
    showDataDialog,
    initDataDialog
  };
};
// 使用 vue-provide 提供方法给子组件
provide<DataDialogMethods>("dataDialogMethods", dataDialogMethods());
//#endregion

//#region 文件详情数据
// 文件详情数据
const documentDetailData = ref<Record<string, any>>({});
const documentDetailDialogRef = ref<typeof DocumentDetailDialog>();
// 文件详情数据 -更新事件
const updateDocumentDetailData = row => {
  documentDetailData.value = row || {};
  documentDetailDialogRef.value?.showDocumentDetailDialog();
};
provide("updateDocumentDetailData", updateDocumentDetailData);
//#endregion

onMounted(async () => {
  await fetchReportTypeEnum();
  await fetchDocStatusEnum();
  await fetchMilvusPage();

  // FIXME: 效果不好
  // // 主动初始化DocumentDetailDialog组件
  // documentDetailDialogRef.value?.showDocumentDetailDialog();
  // // 立即关闭，只为了初始化
  // setTimeout(() => {
  //   // 这里需要访问dialogVisible并设置为false
  //   // 或者组件内部应该有close方法
  //   documentDetailDialogRef.value?.closeDocumentDetailDialog();
  // }, 0);
});
</script>

<template>
  <div>
    <Layout>
      <template #left>
        <!-- 标题卡片 -->
        <TitleCard
          :title="handleTitleCardTitle().title"
          :text="handleTitleCardTitle().subTitle"
          :dashboardData="dashboardData"
        />
        <!-- 数据列表卡片 -->
        <div class="mt-[25px]" />
        <TableCard
          :tableData="milvusPageList"
          :tableLoading="tableLoading"
          :dashboardData="dashboardData"
        />
      </template>
      <!-- 暂不展示右侧内容区 -->
      <template #right>
        <!-- 文件详情 -->
        <!-- <DocumentDetail /> -->
        <!-- 链接详情 -->
        <!-- <LinkDetail /> -->
        <el-tabs tab-position="top">
          <el-tab-pane label="文件">
            <!-- <DocumentDetail :documentDetailData="documentDetailData" /> -->
          </el-tab-pane>
          <!-- <el-tab-pane label="链接">
            <LinkDetail />
          </el-tab-pane> -->
        </el-tabs>
      </template>
    </Layout>

    <!-- 数据详情弹窗 -->
    <DataDialog ref="dataDialogRef" />
    <!-- 文件详情弹窗 -->
    <DocumentDetailDialog
      ref="documentDetailDialogRef"
      :documentDetailData="documentDetailData"
    />
  </div>
</template>
