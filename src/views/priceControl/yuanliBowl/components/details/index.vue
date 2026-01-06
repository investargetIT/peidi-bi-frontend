<script setup lang="ts">
import { formatToken, getToken } from "@/utils/auth";
import { h, nextTick, ref, resolveComponent } from "vue";
import { getAllItemPricePage } from "@/api/priceControl";
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
      prop: "productName",
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
  title: "源力碗 产品明细表",
  table: {
    size: "small"
  },
  columns: [
    // {
    //   prop: "id",
    //   label: "ID",
    //   minWidth: 50
    // },
    {
      prop: "date",
      label: "日期",
      minWidth: 120
    },
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 250
    },
    {
      prop: "productId",
      label: "产品ID",
      minWidth: 150
    },
    {
      prop: "skuName",
      label: "SKU名称",
      minWidth: 200
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
      prop: "stores",
      label: "店铺",
      minWidth: 120
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
    url: "https://api.peidigroup.cn/oms/bi/all-item-price",
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
  exportFileName.value = `源力碗_产品明细表_${searchFormDate}`;
  getAllItemPricePage({
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
        ElMessage.error(res.msg || "获取产品明细失败");
      }
    })
    .catch((err: any) => {
      ElMessage.error(err.message || "导出产品明细失败");
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
    prop: "productName",
    label: "产品名称",
    width: 100
  },
  {
    prop: "productId",
    label: "产品ID",
    width: 25
  },
  {
    prop: "skuName",
    label: "SKU名称",
    width: 60
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
    prop: "stores",
    label: "店铺",
    width: 20
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
      id="peidi-priceControl-yanliBowl-details"
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
              content="导出选定日期的所有产品明细数据"
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
