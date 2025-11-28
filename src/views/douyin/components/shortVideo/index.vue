<script setup lang="ts">
import {
  getBiDouyinVideo,
  postBiDouyinVideoUpdate,
  getBiDouyinVideoAmountSum
} from "@/api/douyin";
import { computed, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import EpSearch from "~icons/ep/search";
import EpUpload from "~icons/ep/upload";
import { ElMessage } from "element-plus";
import HeroiconsQuestionMarkCircle20Solid from "~icons/heroicons/question-mark-circle-20-solid";
import { calculatePercentage } from "./utils";
import * as ExcelJS from "exceljs"; // 导入exceljs库
import { saveAs } from "file-saver"; // 用于保存文件

// 加载状态
const loading = ref<boolean>(false);
// 抖音短视频数据汇总
const douyinVideoAmountSum = ref<number>(0);
// 计算属性 -计算数据汇总的ROI
const douyinVideoAmountSumROI = computed(() => {
  if (!douyinVideoAmountSum.value[1]) return "--";
  return (
    (douyinVideoAmountSum.value[0] || 0) / douyinVideoAmountSum.value[1]
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});
// 抖音短视频数据类型定义
interface DouyinShortVideo {
  /** 数据记录ID */
  id: number;
  /** 数据日期 */
  date: string;
  /** 平台名称 */
  platform: string;
  /** 店铺名称 */
  shopName: string;
  /** 视频标题 */
  videoTitle: string;
  /** 视频ID */
  videoId: string;
  /** 是否为广告视频（是/否） */
  isAd: string;
  /** 视频链接 */
  videoUrl: string;
  /** 发布时间 */
  publishTime: string;
  /** 达人昵称 */
  influencerNickname: string;
  /** 达人抖音ID */
  influencerDouyinId: string;
  /** 商品ID */
  productId: string;
  /** 商品名称 */
  productName: string;
  /** 观看次数 */
  viewCount: number | null;
  /** 支付金额 */
  paymentAmount: number;
  /** 退款金额 */
  refundAmount: number;
  /** 直播间跳转次数 */
  liveRoomRedirect: number;
  /** 观看后搜索次数 */
  searchAfterView: number;
  /** 店铺页面跳转次数 */
  storePageRedirect: number | null;
  /** 销售类型 */
  salesType: string | null;
  /** 账户列表（可能包含多个账户数据） */
  accountList: any[] | null;
  /** 商品曝光次数 */
  exposureCnt: number;
  /** 商品点击次数 */
  clickCnt: number;
  /** 成交订单数 */
  ordersCnt: number;
  // 后续增加
  /** 支付金额总和 */
  paymentAmountSum: number;
  /** 成交订单数总和 */
  ordersCntSum: number;
  /** 观看次数总和 */
  viewCountSum: number;
  /** 商品曝光次数总和 */
  exposureCntSum: number;
  /** 商品点击次数总和 */
  clickCntSum: number;
  /** 千川消耗金额（手填） */
  qianchuan: number | null;
  /** ROI（计算） */
  roi: number | null;
  // 前端加入 - 是否选中
  isSelected: boolean;
}
// 抖音短视频数据列表
const videoList = ref<DouyinShortVideo[]>([]);

//#region 排序逻辑
// 请求的排序参数
const sortStr = ref<{ sortName: string; sortType: string }[]>([]);
// 处理排序事件
function handleSortChange(column: any) {
  console.log("column", column);
  // 处理排序逻辑
  if (column.column.sortable === "custom") {
    // 自定义排序逻辑
    // 这里可以根据 column.prop 来判断是哪个列在排序
    // 并根据 column.order 来判断排序方向（ascending 或 descending）
    // 最后更新表格数据即可
    if (!column.order) {
      sortStr.value = [];
    }
    if (column.order === "descending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "desc"
        }
      ];
    }
    if (column.order === "ascending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "asc"
        }
      ];
    }
    fetchDouyinVideo();
  }
}
//#endregion

//#region 搜索逻辑
// 搜索日期，默认当天 开发中先选择有数据的日期范围
const searchDate = ref<string[]>([
  dayjs("2025-11-16").format("YYYY-MM-DD"),
  dayjs("2025-11-16").format("YYYY-MM-DD")
]);
// 搜索类别
const searchSalesType = ref<string>("");
// 搜索产品
const searchProductName = ref<string>("");
// 搜索达人
const searchInfluencerNickname = ref<string>("");
// 搜索视频标题
const searchVideoTitle = ref<string>("");
// 拼接查询参数
const getSearchStr = () => {
  const searchStr = [
    {
      searchName: "date",
      searchType: "betweenStr",
      searchValue: searchDate.value
        .map(date => dayjs(date).format("YYYY-MM-DD"))
        .join(",")
    }
  ];
  if (searchSalesType.value) {
    searchStr.push({
      searchName: "salesType",
      searchType: "like",
      searchValue: `${searchSalesType.value}`
    });
  }
  if (searchProductName.value) {
    searchStr.push({
      searchName: "productName",
      searchType: "like",
      searchValue: `${searchProductName.value}`
    });
  }
  if (searchVideoTitle.value) {
    searchStr.push({
      searchName: "videoTitle",
      searchType: "like",
      searchValue: `${searchVideoTitle.value}`
    });
  }
  if (searchInfluencerNickname.value) {
    searchStr.push({
      searchName: "influencerNickname",
      searchType: "like",
      searchValue: `${searchInfluencerNickname.value}`
    });
  }
  return JSON.stringify(searchStr);
};
//#endregion

//#region 分页逻辑
const pageNo = ref<number>(1);
const pageSize = ref<number>(10);
const pageTotal = ref<number>(0);
//#endregion

//#region 请求逻辑
// 获取抖音短视频数据
function fetchDouyinVideo() {
  // 先获取抖音短视频支付金额总和 暂时没想好放哪里合适
  fetchDouyinVideoAmountSum();

  loading.value = true;
  getBiDouyinVideo({
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    searchStr: getSearchStr(),
    sortStr: JSON.stringify(sortStr.value)
  })
    .then((res: any) => {
      console.log("抖音短视频数据", res);

      // 如果当前页大于总页数，重置为最后一页 排除总页数为0的情况
      if (res.data?.current > res.data?.pages && res.data?.total !== 0) {
        pageNo.value = res.data?.pages;
        return;
      }

      // 更新总页数
      pageTotal.value = res.data?.total || 0;

      // 处理抖音短视频数据
      // 把data.records里的每条数据里的accountList铺平 放入汇总数据
      const videoListTemp = res.data.records.flatMap((item: any) => {
        if (item.accountList && item.accountList.length > 0) {
          return item.accountList.map((account: any) => ({
            ...account,
            paymentAmountSum: item.paymentAmountSum,
            ordersCntSum: item.ordersCntSum,
            viewCountSum: item.viewCountSum,
            exposureCntSum: item.exposureCntSum,
            clickCntSum: item.clickCntSum,
            isSelected: false
          }));
        }
        return [];
      });

      console.log("videoListTemp", videoListTemp);
      videoList.value = videoListTemp;
    })
    .finally(() => {
      loading.value = false;
    });
}
// 修改抖音短视频数据
function updateDouyinVideo(data: any) {
  postBiDouyinVideoUpdate(data).then((res: any) => {
    console.log("修改抖音短视频数据", res);
    if (res.code === 200) {
      // ElMessage.success("修改成功");
      ElMessage.success("千川消耗金额已更新");
      // 刷新数据
      fetchDouyinVideo();
    } else {
      ElMessage.error(res.msg || "修改失败");
    }
  });
}
// 获取抖音短视频支付金额总和
function fetchDouyinVideoAmountSum() {
  getBiDouyinVideoAmountSum({
    searchStr: getSearchStr()
  }).then((res: any) => {
    console.log("抖音短视频支付金额总和", res);
    if (res.code === 200) {
      // ElMessage.success("修改成功");
      douyinVideoAmountSum.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取抖音短视频支付金额总和失败");
    }
  });
}
//#endregion

// 处理查询
function handleSearch() {
  fetchDouyinVideo();
}

onMounted(() => {
  fetchDouyinVideo();
});

// 监听分页参数变化
watch(
  () => [pageNo.value, pageSize.value],
  () => {
    fetchDouyinVideo();
  }
);

// 处理单元格合并的方法 合并达人列（第一列）
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // 处理第一列（达人列） 和汇总列6 10 12 14 17
  if (columnIndex === 0 || [6, 10, 12, 14, 17].includes(columnIndex)) {
    // 获取当前行的达人名称
    const currentInfluencerNickname = row.influencerNickname;

    // 查找相同达人名称的连续行数
    let rowspan = 1;
    for (let i = rowIndex + 1; i < videoList.value.length; i++) {
      if (videoList.value[i].influencerNickname === currentInfluencerNickname) {
        rowspan++;
      } else {
        break;
      }
    }

    // 如果是相同达人名称的第一行，返回合并信息
    if (
      rowIndex === 0 ||
      videoList.value[rowIndex - 1].influencerNickname !==
        currentInfluencerNickname
    ) {
      return {
        rowspan: rowspan,
        colspan: 1
      };
    } else {
      // 如果不是第一行，隐藏单元格
      return {
        rowspan: 0,
        colspan: 0
      };
    }
  }
};

//#region 千川消耗金额 逻辑
// 当前正在编辑的行ID
const tableRowEditId = ref<number | null>(null);
// 当前正在编辑的列ID
const tableColumnEditIndex = ref<string | null>(null);
// 编辑前的值，用于取消编辑时恢复
const originalValue = ref<any>(null);

/**
 * 开始编辑单元格
 * @param row 行数据
 * @param column 列数据
 */
const startEdit = (row: DouyinShortVideo, column: any) => {
  // 保存编辑前的值
  originalValue.value = row.qianchuan;
  // 设置当前编辑的行和列
  tableRowEditId.value = row.id;
  tableColumnEditIndex.value = column.id;
};

/**
 * 结束编辑单元格
 * @param row 行数据
 * @param column 列数据
 */
const blurValueInput = (row: DouyinShortVideo, column: any) => {
  // 验证输入的值
  if (row.qianchuan !== null && row.qianchuan !== undefined) {
    // 确保输入的是数字
    const value = parseFloat(row.qianchuan.toString());
    if (!isNaN(value)) {
      row.qianchuan = value;

      // 检查值是否真的发生了变化
      const hasValueChanged = originalValue.value !== row.qianchuan;

      if (hasValueChanged) {
        // 计算ROI
        calculateROI(row);

        // 只有值发生变化时才发送请求
        console.log("值发生变化，触发更新请求", row);
        updateDouyinVideo({
          ...row
        });
      } else {
        // 值没有变化，不发送请求
        console.log("值未发生变化，不发送请求");
        ElMessage.info("千川消耗金额未发生变化");
      }
    } else {
      // 如果输入无效，恢复原值
      row.qianchuan = originalValue.value;
      ElMessage.warning("请输入有效的数字");
    }
  }

  // 结束编辑状态
  tableRowEditId.value = null;
  tableColumnEditIndex.value = null;
  originalValue.value = null;
};

/**
 * 计算ROI
 * @param row 行数据
 */
const calculateROI = (row: DouyinShortVideo) => {
  if (row.qianchuan && row.qianchuan > 0 && row.paymentAmount) {
    row.roi = parseFloat((row.paymentAmount / row.qianchuan).toFixed(2));
  } else {
    row.roi = null;
  }
};

/**
 * 取消编辑
 */
const cancelEdit = () => {
  if (tableRowEditId.value !== null && originalValue.value !== null) {
    // 找到对应的行并恢复原值
    const row = videoList.value.find(item => item.id === tableRowEditId.value);
    if (row) {
      row.qianchuan = originalValue.value;
    }
  }

  tableRowEditId.value = null;
  tableColumnEditIndex.value = null;
  originalValue.value = null;
};

/**
 * 双击单元格开始编辑
 * @param row 行数据
 * @param column 列数据
 */
const handleCellDblClick = (row: DouyinShortVideo, column: any) => {
  // 只允许编辑千川消耗金额列
  if (column.property === "qianchuan") {
    startEdit(row, column);
  }
};
//#endregion

//#region 表格操作按钮逻辑
// 操作栏点击搜索按钮
const handleSearchClick = (row: any) => {
  // 填充搜索栏
  searchVideoTitle.value = row.videoTitle;
  // 触发查询
  handleSearch();
};
//#endregion

//#region 导出逻辑
const handleExport = async () => {
  try {
    ElMessage.info("正在导出数据，请稍候...");

    // 获取总数据量
    const totalRes: any = await getBiDouyinVideo({
      pageNo: 1,
      pageSize: 1,
      searchStr: getSearchStr(),
      sortStr: JSON.stringify(sortStr.value)
    });

    const total = totalRes.data?.total || 0;
    if (total === 0) {
      ElMessage.warning("没有数据可导出");
      return;
    }

    // 计算需要分批获取的页数，每批100条数据
    const pageSize = 100;
    const totalPages = Math.ceil(total / pageSize);

    // 创建所有页面的请求Promise数组
    const promises = [];
    for (let page = 1; page <= totalPages; page++) {
      promises.push(
        getBiDouyinVideo({
          pageNo: page,
          pageSize: pageSize,
          searchStr: getSearchStr(),
          sortStr: JSON.stringify(sortStr.value)
        })
      );
    }

    // 使用Promise.all并发请求所有页面数据
    const results = await Promise.all(promises);

    // 合并所有页面的数据
    let allData: any[] = [];
    results.forEach(res => {
      if (res.data?.records && res.data.records.length > 0) {
        // 处理数据，将accountList铺平
        const pageData = res.data.records.flatMap((item: any) => {
          if (item.accountList && item.accountList.length > 0) {
            return item.accountList.map((account: any) => ({
              ...account,
              paymentAmountSum: item.paymentAmountSum,
              ordersCntSum: item.ordersCntSum,
              viewCountSum: item.viewCountSum,
              exposureCntSum: item.exposureCntSum,
              clickCntSum: item.clickCntSum,
              exposureRate: calculatePercentage(
                account.exposureCnt,
                account.viewCount
              ), // 商品曝光率
              clickRate: calculatePercentage(
                account.clickCnt,
                account.viewCount
              ) // 商品点击率
            }));
          }
          return [];
        });
        allData = [...allData, ...pageData];
      }
    });

    // 创建工作簿
    const workbook = new ExcelJS.Workbook();

    // 添加工作表
    const worksheet = workbook.addWorksheet("抖音短视频数据");

    // 定义表头
    const headers = [
      "达人昵称",
      "达人抖音ID",
      "日期",
      "销售类别",
      "销售产品",
      "视频标题",
      "视频ID",
      "是否为广告视频",
      "视频链接",
      "发布时间",
      "商品ID",
      "观看次数",
      "支付金额",
      "退款金额",
      "直播间跳转次数",
      "观看后搜索次数",
      "店铺页面跳转次数",
      "商品曝光次数",
      "商品点击次数",
      "成交订单数",
      "支付金额总和",
      "成交订单数总和",
      "观看次数总和",
      "商品曝光次数总和",
      "商品点击次数总和",
      "千川消耗金额",
      "ROI",
      "商品曝光率(%)",
      "商品点击率(%)"
    ];

    // 添加表头行并设置样式
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell, colNumber) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" }
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" }
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle"
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    // 设置列宽
    const columnWidths = [
      15, // 达人昵称
      15, // 达人抖音ID
      12, // 日期
      12, // 销售类别
      20, // 销售产品
      30, // 视频标题
      20, // 视频ID
      12, // 是否为广告视频
      30, // 视频链接
      20, // 发布时间
      20, // 商品ID
      12, // 观看次数
      12, // 支付金额
      12, // 退款金额
      15, // 直播间跳转次数
      15, // 观看后搜索次数
      15, // 店铺页面跳转次数
      15, // 商品曝光次数
      15, // 商品点击次数
      12, // 成交订单数
      15, // 支付金额总和
      15, // 成交订单数总和
      15, // 观看次数总和
      18, // 商品曝光次数总和
      18, // 商品点击次数总和
      15, // 千川消耗金额
      12, // ROI
      12, // 商品曝光率
      12 // 商品点击率
    ];

    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // 添加数据行
    allData.forEach(item => {
      const dataRow = worksheet.addRow([
        item.influencerNickname || "",
        item.influencerDouyinId || "",
        item.date || "",
        item.salesType || "",
        item.productName || "",
        item.videoTitle || "",
        item.videoId || "",
        item.isAd || "",
        item.videoUrl || "",
        item.publishTime || "",
        item.productId || "",
        item.viewCount || 0,
        item.paymentAmount || 0,
        item.refundAmount || 0,
        item.liveRoomRedirect || 0,
        item.searchAfterView || 0,
        item.storePageRedirect || 0,
        item.exposureCnt || 0,
        item.clickCnt || 0,
        item.ordersCnt || 0,
        item.paymentAmountSum || 0,
        item.ordersCntSum || 0,
        item.viewCountSum || 0,
        item.exposureCntSum || 0,
        item.clickCntSum || 0,
        item.qianchuan || 0,
        item.roi || 0,
        item.exposureRate || 0, // 商品曝光率
        item.clickRate || 0 // 商品点击率
      ]);

      // 设置数据行样式
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = {
          horizontal: colNumber >= 12 && colNumber <= 27 ? "right" : "left", // 数字列右对齐，文本列左对齐
          vertical: "middle"
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };

        // 设置数字格式
        if (colNumber >= 12 && colNumber <= 27) {
          cell.numFmt = "#,##0.00"; // 数字格式，保留两位小数
        }
      });
    });

    // 冻结首行
    worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

    // 生成Excel文件并下载
    const fileName = `抖音短视频数据_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`;

    // 将工作簿转换为buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 使用file-saver保存文件
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, fileName);

    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败，请稍后重试");
  }
};
//#endregion
</script>

<template>
  <!-- 搜索栏 -->
  <div class="mb-[10px] flex items-center justify-between">
    <div>
      <el-date-picker
        v-model="searchDate"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        unlink-panels
        :clearable="false"
        class="mr-[20px]"
      />
      <el-input
        v-model="searchInfluencerNickname"
        style="width: 150px"
        placeholder="搜索达人..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />
      <el-input
        v-model="searchVideoTitle"
        style="width: 200px"
        placeholder="搜索视频标题..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />
      <el-input
        v-model="searchSalesType"
        style="width: 180px"
        placeholder="搜索销售类别..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />
      <el-input
        v-model="searchProductName"
        style="width: 180px"
        placeholder="搜索销售产品..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />

      <el-button
        type="primary"
        :icon="EpSearch"
        :loading="loading"
        @click="handleSearch"
        >查询</el-button
      >
    </div>

    <div>
      <el-button type="primary" :icon="EpUpload" @click="handleExport"
        >导出</el-button
      >
    </div>
  </div>

  <!-- 抖音短视频支付金额总和 -->
  <div class="mb-[10px] text-[12px] text-[#09090b] flex">
    <el-space>
      <div>
        所有用户支付金额汇总：
        <span class="text-[16px] font-bold">{{
          (douyinVideoAmountSum[0] || 0).toLocaleString()
        }}</span>
      </div>
      <el-divider direction="vertical" />
      <div>
        所有千川消耗金额汇总：
        <span class="text-[16px] font-bold">{{
          (douyinVideoAmountSum[1] || 0).toLocaleString()
        }}</span>
      </div>
      <el-divider direction="vertical" />
      <div>
        ROI：
        <span class="text-[16px] font-bold">{{ douyinVideoAmountSumROI }}</span>
      </div>
    </el-space>
  </div>

  <!-- 表格 -->
  <el-table
    v-loading="loading"
    :data="videoList"
    :header-row-style="{ color: '#09090b' }"
    size="small"
    border
    height="720"
    :span-method="objectSpanMethod"
    @cell-dblclick="handleCellDblClick"
    @sort-change="handleSortChange"
  >
    <el-table-column
      prop="influencerNickname"
      label="达人"
      width="150"
      align="center"
      :resizable="false"
      fixed
    />
    <el-table-column
      prop="date"
      label="日期"
      width="100"
      align="center"
      :resizable="false"
    />
    <el-table-column
      prop="salesType"
      label="销售类别"
      width="100"
      :resizable="false"
    />
    <el-table-column
      prop="productName"
      label="销售产品"
      width="200"
      :resizable="false"
    />
    <el-table-column
      prop="publishTime"
      label="发布时间（历史发视频）"
      width="160"
      :resizable="false"
    >
      <template #default="scope">
        {{ dayjs(scope.row.publishTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
    </el-table-column>
    <el-table-column
      prop="videoTitle"
      label="视频标题"
      min-width="200"
      show-overflow-tooltip
      :resizable="false"
      :fixed="true"
    >
      <!-- 自定义表头 -->
      <template #header>
        <div
          class="flex items-center"
          :style="{ justifyContent: 'flex-start' }"
        >
          视频标题
          <el-tooltip
            class="box-item"
            effect="dark"
            content="点击视频标题自动打开抖音视频详情页"
            placement="top"
          >
            <HeroiconsQuestionMarkCircle20Solid />
          </el-tooltip>
        </div>
      </template>

      <template #default="scope">
        <a :href="scope.row.videoUrl" target="_blank" class="link">{{
          scope.row.videoTitle
        }}</a>
      </template>
    </el-table-column>
    <el-table-column
      prop="paymentAmountSum"
      label="用户支付金额汇总"
      width="150"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="paymentAmount"
      label="用户支付金额"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="qianchuan"
      label="千川消耗金额（手填）"
      width="170"
      align="right"
      :resizable="false"
    >
      <!-- 自定义表头 -->
      <template #header>
        <div class="flex items-center" :style="{ justifyContent: 'flex-end' }">
          千川消耗金额（手填）
          <el-tooltip
            class="box-item"
            effect="dark"
            content="双击单元格编辑千川消耗金额"
            placement="top"
          >
            <HeroiconsQuestionMarkCircle20Solid />
          </el-tooltip>
        </div>
      </template>

      <!-- 可编辑单元格 -->
      <template #default="{ row, column }">
        <el-input
          v-if="tableRowEditId === row.id && tableColumnEditIndex === column.id"
          v-model.number="row.qianchuan"
          size="small"
          placeholder="请输入金额"
          :min="0"
          @blur="blurValueInput(row, column)"
          @keyup.enter="blurValueInput(row, column)"
          @keyup.esc="cancelEdit"
        />
        <span
          v-else
          class="editable-cell"
          :class="{ 'editable-cell--editable': true }"
          @click="startEdit(row, column)"
        >
          {{ row.qianchuan || "-" }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      prop="roi"
      label="ROI（计算）"
      width="120"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="ordersCntSum"
      label="成交订单数汇总"
      width="135"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="ordersCnt"
      label="成交订单数"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="viewCountSum"
      label="视频观看次数汇总"
      width="150"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="viewCount"
      label="视频观看次数"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      prop="exposureCntSum"
      label="商品曝光次数汇总"
      width="150"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="exposureCnt"
      label="商品曝光次数"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      label="商品曝光率"
      width="100"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{
          calculatePercentage(scope.row.exposureCnt, scope.row.viewCount) + "%"
        }}
      </template>
    </el-table-column>
    <el-table-column
      prop="clickCntSum"
      label="商品点击次数汇总"
      width="150"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="clickCnt"
      label="商品点击次数"
      width="100"
      align="right"
      :resizable="false"
    />
    <el-table-column
      label="商品点击率"
      width="100"
      align="right"
      :resizable="false"
    >
      <template #default="scope">
        {{ calculatePercentage(scope.row.clickCnt, scope.row.viewCount) + "%" }}
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      width="50"
      align="right"
      :resizable="false"
      :fixed="'right'"
    >
      <template #default="scope">
        <el-tooltip
          class="box-item"
          effect="dark"
          content="点击快速搜索该视频标题"
          placement="top"
        >
          <el-button
            link
            type="primary"
            size="small"
            @click="handleSearchClick(scope.row)"
          >
            <EpSearch />
          </el-button>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页 -->
  <div class="flex justify-end mt-[20px]">
    <el-pagination
      v-model:page-size="pageSize"
      v-model:current-page="pageNo"
      size="small"
      layout="total, prev, pager, next"
      :total="pageTotal"
      background
    />
  </div>
</template>

<style lang="scss" scoped>
.link {
  color: #409eff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
