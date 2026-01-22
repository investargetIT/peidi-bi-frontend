<script setup lang="ts">
import { formatToken, getToken } from "@/utils/auth";
import { h, nextTick, ref, resolveComponent } from "vue";
import { getItemPricePage } from "@/api/priceControl";
import { ElMessage } from "element-plus";
import EpDownload from "~icons/ep/download";
import HeroiconsQuestionMarkCircle20Solid from "~icons/heroicons/question-mark-circle-20-solid";
import dayjs from "dayjs";

const TOKEN = formatToken(getToken().accessToken);

const SEARCH_FORM_CONFIG = {
  formItems: [
    {
      prop: "date",
      label: "日期",
      type: "date",
      config: {
        searchType: "equals",
        placeholder: "请选择日期"
      }
    },
    {
      prop: "productId",
      label: "产品名称",
      type: "text",
      config: {
        searchType: "like",
        placeholder: "请输入产品名称（模糊查询）"
      }
    },
    {
      prop: "stores",
      label: "店铺",
      type: "text",
      config: {
        searchType: "like",
        placeholder: "请输入店铺（模糊查询）"
      }
    }
  ]
};
const TABLE_CONFIG = {
  title: "源力碗 市场大盘表",
  table: {
    size: "small"
  },
  columns: [
    // {
    //   prop: "id",
    //   label: "ID",
    //   minWidth: 60
    // },
    {
      prop: "date",
      label: "日期",
      minWidth: 120
    },
    {
      prop: "productId",
      label: "产品名称",
      minWidth: 200
    },
    {
      prop: "productName",
      label: "产品ID",
      minWidth: 120
    },
    {
      prop: "productImageUrl",
      label: "产品图片",
      minWidth: 120,
      render: (scope: any) => {
        const ElImage = resolveComponent("ElImage");
        return () =>
          h(ElImage, {
            style: { width: "50px", height: "50px" },
            src: scope.row.productImageUrl,
            fit: "cover",
            previewTeleported: true,
            previewSrcList: scope.row.productImageUrl
              ? [scope.row.productImageUrl]
              : [],
            hideOnClickModal: true,
            zIndex: 9999
          });
      }
    },
    {
      prop: "originalPrice",
      label: "原价",
      minWidth: 100
    },
    {
      prop: "currentPrice",
      label: "当前价格",
      minWidth: 100
    },
    {
      prop: "paymentsCount",
      label: "支付数量",
      minWidth: 100
    },
    {
      prop: "categoryId",
      label: "分类",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      prop: "stores",
      label: "店铺",
      minWidth: 120
    },
    {
      prop: "storeType",
      label: "店铺类型",
      minWidth: 100
    },
    {
      prop: "platform",
      label: "平台",
      minWidth: 100
    },
    {
      prop: "productUrl",
      label: "产品链接",
      minWidth: 120,
      showOverflowTooltip: true,
      render: (scope: any) => {
        return () =>
          h(
            "a",
            {
              href: scope.row.productUrl,
              target: "_blank",
              style: { color: "#1890ff", textDecoration: "underline" },
              onClick: (e: Event) => {
                e.stopPropagation(); // 防止事件冒泡
              }
            },
            scope.row.productUrl ? "查看链接" : "无链接"
          );
      }
    }
  ]
};
const REQUEST_CONFIG = {
  get: {
    url: "https://api.peidigroup.cn/oms/bi/item-price",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: TOKEN
    },
    timeout: 1000 * 10
  }
};

const exportLoading = ref(false);
const exportTableData = ref([]);
const exportFileName = ref("");
const excelExportRef = ref();
const handleExportExcel = (searchForm: any) => {
  if (!searchForm.date) {
    ElMessage.warning("请选择日期");
    return;
  }
  const searchFormDate = dayjs(searchForm.date).format("YYYY-MM-DD");
  exportLoading.value = true;
  exportFileName.value = `源力碗_市场大盘表_${searchFormDate}`;
  getItemPricePage({
    pageNo: 1,
    pageSize: 10000,
    searchStr: JSON.stringify([
      {
        searchName: "date",
        searchType: "equals",
        searchValue: `"${searchFormDate}"`
      }
    ])
  })
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("产品明细:", res.data);
        exportTableData.value = res.data?.records || [];
        nextTick(() => {
          triggerButtonClick();
        });
      } else {
        ElMessage.error(res.msg || "获取市场大盘失败");
        exportLoading.value = false;
      }
    })
    .catch((err: any) => {
      ElMessage.error(err.message || "导出市场大盘失败");
      exportLoading.value = false;
    });
};

const triggerButtonClick = () => {
  if (excelExportRef.value) {
    excelExportRef.value?.triggerButtonClick({
      onFinally: () => {
        // console.log("导出完成后执行");
        exportLoading.value = false;
      }
    });
  }
};

const TABLE_COLUMNS_CONFIG = [
  {
    prop: "id",
    label: "ID",
    width: 10
  },
  {
    prop: "date",
    label: "日期",
    width: 20
  },
  {
    prop: "productId",
    label: "产品名称",
    width: 100
  },
  {
    prop: "productName",
    label: "产品ID",
    width: 25
  },
  {
    prop: "productImageUrl",
    label: "产品图片",
    width: 15,
    hyperlink: {
      url: (value: string) => `${value}`,
      text: (value: string) => `${value}`
    }
  },
  {
    prop: "originalPrice",
    label: "原价",
    width: 10
  },
  {
    prop: "currentPrice",
    label: "当前价格",
    width: 10
  },
  {
    prop: "paymentsCount",
    label: "支付数量",
    width: 15
  },
  {
    prop: "categoryId",
    label: "分类",
    width: 60
  },
  {
    prop: "stores",
    label: "店铺",
    width: 20
  },
  {
    prop: "storeType",
    label: "店铺类型",
    width: 15
  },
  {
    prop: "platform",
    label: "平台",
    width: 10
  },
  {
    prop: "productUrl",
    label: "产品链接",
    width: 50,
    hyperlink: {
      url: (value: string) => `${value}`,
      text: (value: string) => `${value}`
    }
  }
];
</script>

<template>
  <div>
    <pd-DataTable
      id="peidi-priceControl-yanliBowl-market"
      :searchFormConfig="SEARCH_FORM_CONFIG"
      :tableConfig="TABLE_CONFIG"
      :requestConfig="REQUEST_CONFIG"
    >
      <template #operationBar="{ searchForm }">
        <el-button
          :loading="exportLoading"
          type="primary"
          :icon="EpDownload"
          color="#217346"
          @click="handleExportExcel(searchForm)"
        >
          <div class="flex items-center">
            <div class="mr-[5px]">导出Excel</div>
            <el-tooltip
              content="导出选定日期的所有市场大盘数据"
              placement="top"
            >
              <HeroiconsQuestionMarkCircle20Solid />
            </el-tooltip>
          </div>
        </el-button>
      </template>
    </pd-DataTable>
    <pd-ExcelExport
      v-show="false"
      ref="excelExportRef"
      title="导出数据"
      :data="exportTableData"
      :columnsConfig="TABLE_COLUMNS_CONFIG"
      :fileName="exportFileName"
    />
  </div>
</template>
