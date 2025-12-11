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
const douyinVideoAmountSum = ref<[number, number]>([0, 0]);
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
  /** 店铺名称 */
  shopName: string;
  /** 商品ID */
  productId: string;
  /** 商品名称 */
  productName: string;
  /** 销售类型 */
  salesType: string | null;
  /** 账户列表（可能包含多个账户数据） */
  accountList: any[] | null;
  /** 实际支付金额 */
  actualPaymentAmount: number | null;
  /** 加购数量 */
  addToCartCount: number | null;
  /** 抖音账户ID */
  douyinAccountId: string;
  /** 抖音昵称 */
  douyinNickname: string;
  /** 收藏数量 */
  favoriteCount: number | null;
  /** 加购率（展示） */
  displayAddToCartRate: number | null;
  /** 收藏率（展示） */
  displayFavoriteRate: number | null;
  /** 净GMV */
  netGmv: number;
  /** 净GMV结算率 */
  netGmvSettlementRate: number | null;
  /** 净订单成本 */
  netOrderCost: number | null;
  /** 净订单数量 */
  netOrderCount: number | null;
  /** 净订单结算率 */
  netOrderSettlementRate: number | null;
  /** 净ROI */
  netRoi: number;
  /** 整体转化率 */
  overallConversionRate: number | null;
  /** 整体点击率 */
  overallCtr: number | null;
  /** 整体订单成本 */
  overallOrderCost: number | null;
  /** 整体支付ROI */
  overallPaymentRoi: number;
  /** 平台补贴金额 */
  platformSubsidyAmount: number | null;
  /** 发货前退款金额 */
  preShipRefundAmount: number | null;
  /** 发货前退款订单数 */
  preShipRefundOrderCount: number | null;
  /** 发货前退款率 */
  preShipRefundRate: number | null;
  /** 智能优惠券金额 */
  smartCouponAmount: number | null;
  /** 总点击量 */
  totalClicks: number;
  /** 总成本 */
  totalCost: number;
  /** 总GMV */
  totalGmv: number;
  /** 总曝光量 */
  totalImpressions: number;
  /** 总订单数 */
  totalOrderCount: number | null;
  /** 未支付预售预估 */
  unpaidPresaleEstimate: number | null;
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
// 搜索日期，默认前一天 开发中先选择有数据的日期范围
const searchDate = ref<string[]>([
  dayjs().subtract(1, "day").format("YYYY-MM-DD"),
  dayjs().subtract(1, "day").format("YYYY-MM-DD")
]);
// 搜索类别
// const searchSalesType = ref<string>("");
// 搜索产品
const searchProductName = ref<string>("");
// 搜索达人抖音ID
const searchDouyinAccountId = ref<string>("");
// 搜索达人
const searchInfluencerNickname = ref<string>("");
// 搜索视频标题
// const searchVideoTitle = ref<string>("");
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
  // if (searchSalesType.value) {
  //   searchStr.push({
  //     searchName: "salesType",
  //     searchType: "like",
  //     searchValue: `${searchSalesType.value}`
  //   });
  // }
  if (searchDouyinAccountId.value) {
    searchStr.push({
      searchName: "douyinAccountId",
      searchType: "like",
      searchValue: `${searchDouyinAccountId.value}`
    });
  }
  if (searchProductName.value) {
    searchStr.push({
      searchName: "productName",
      searchType: "like",
      searchValue: `${searchProductName.value}`
    });
  }
  // if (searchVideoTitle.value) {
  //   searchStr.push({
  //     searchName: "videoTitle",
  //     searchType: "like",
  //     searchValue: `${searchVideoTitle.value}`
  //   });
  // }
  if (searchInfluencerNickname.value) {
    searchStr.push({
      searchName: "douyinNickname",
      searchType: "like",
      searchValue: `${searchInfluencerNickname.value}`
    });
  }
  return JSON.stringify(searchStr);
};
//#endregion

//#region 分页逻辑
const pageNo = ref<number>(1);
const pageSize = ref<number>(20);
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
          return item.accountList.flatMap((item2: any) => {
            return item2.accountList.map((account: any) => ({
              ...account,
              douyinNickname: item2.douyinNickname,
              douyinAccountId: item.douyinAccountId
            }));
          });
          // return item.accountList.map((account: any) => ({
          //   ...account,
          //   paymentAmountSum: item.paymentAmountSum,
          //   ordersCntSum: item.ordersCntSum,
          //   viewCountSum: item.viewCountSum,
          //   exposureCntSum: item.exposureCntSum,
          //   clickCntSum: item.clickCntSum,
          //   isSelected: false
          // }));
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

// 处理单元格合并的方法 达人ID列基于ID合并，达人名称列基于ID和名称分别合并
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // 处理第一列（达人ID列）- 基于ID进行合并
  if (columnIndex === 0) {
    // 获取当前行的达人ID
    const currentInfluencerId = row.douyinAccountId;

    // 查找相同达人ID的连续行数
    let rowspan = 1;
    for (let i = rowIndex + 1; i < videoList.value.length; i++) {
      if (videoList.value[i].douyinAccountId === currentInfluencerId) {
        rowspan++;
      } else {
        break;
      }
    }

    // 如果是相同达人ID的第一行，返回合并信息
    if (
      rowIndex === 0 ||
      videoList.value[rowIndex - 1].douyinAccountId !== currentInfluencerId
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

  // 处理第二列（达人名称列）- 基于ID和名称的组合进行分别合并
  if (columnIndex === 1) {
    // 获取当前行的达人ID和达人名称
    const currentInfluencerId = row.douyinAccountId;
    const currentInfluencerName = row.douyinNickname;

    // 查找相同达人ID和达人名称的连续行数
    let rowspan = 1;
    for (let i = rowIndex + 1; i < videoList.value.length; i++) {
      if (
        videoList.value[i].douyinAccountId === currentInfluencerId &&
        videoList.value[i].douyinNickname === currentInfluencerName
      ) {
        rowspan++;
      } else {
        break;
      }
    }

    // 如果是相同达人ID和名称的第一行，返回合并信息
    if (
      rowIndex === 0 ||
      videoList.value[rowIndex - 1].douyinAccountId !== currentInfluencerId ||
      videoList.value[rowIndex - 1].douyinNickname !== currentInfluencerName
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
            return item.accountList.flatMap((item2: any) => {
              return item2.accountList.map((account: any) => ({
                ...account,
                douyinNickname: item2.douyinNickname,
                douyinAccountId: item.douyinAccountId
              }));
            });
            // return item.accountList.map((account: any) => ({
            //   ...account,
            //   paymentAmountSum: item.paymentAmountSum,
            //   ordersCntSum: item.ordersCntSum,
            //   viewCountSum: item.viewCountSum,
            //   exposureCntSum: item.exposureCntSum,
            //   clickCntSum: item.clickCntSum,
            //   exposureRate: calculatePercentage(
            //     account.exposureCnt,
            //     account.viewCount
            //   ), // 商品曝光率
            //   clickRate: calculatePercentage(
            //     account.clickCnt,
            //     account.viewCount
            //   ) // 商品点击率
            // }));
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
      "数据记录ID",
      "数据日期",
      "店铺名称",
      "商品ID",
      "商品名称",
      "销售类型",
      "抖音账户ID",
      "抖音昵称",
      "实际支付金额",
      "加购数量",
      "收藏数量",
      "加购率(%)",
      "收藏率(%)",
      "净GMV",
      "净GMV结算率(%)",
      "净订单成本",
      "净订单数量",
      "净订单结算率(%)",
      "净ROI",
      "整体转化率(%)",
      "整体点击率(%)",
      "整体订单成本",
      "整体支付ROI",
      "平台补贴金额",
      "发货前退款金额",
      "发货前退款订单数",
      "发货前退款率(%)",
      "智能优惠券金额",
      "总点击量",
      "总成本",
      "总GMV",
      "总曝光量",
      "总订单数",
      "未支付预售预估"
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
      12, // 数据记录ID
      12, // 数据日期
      15, // 店铺名称
      15, // 商品ID
      20, // 商品名称
      12, // 销售类型
      15, // 抖音账户ID
      15, // 抖音昵称
      12, // 实际支付金额
      12, // 加购数量
      12, // 收藏数量
      12, // 加购率
      12, // 收藏率
      12, // 净GMV
      12, // 净GMV结算率
      12, // 净订单成本
      12, // 净订单数量
      12, // 净订单结算率
      12, // 净ROI
      12, // 整体转化率
      12, // 整体点击率
      12, // 整体订单成本
      12, // 整体支付ROI
      12, // 平台补贴金额
      12, // 发货前退款金额
      12, // 发货前退款订单数
      12, // 发货前退款率
      12, // 智能优惠券金额
      12, // 总点击量
      12, // 总成本
      12, // 总GMV
      12, // 总曝光量
      12, // 总订单数
      12 // 未支付预售预估
    ];

    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // 添加数据行
    allData.forEach(item => {
      const dataRow = worksheet.addRow([
        item.id || "",
        item.date || "",
        item.shopName || "",
        item.productId || "",
        item.productName || "",
        item.salesType || "",
        item.douyinAccountId || "",
        item.douyinNickname || "",
        item.actualPaymentAmount || 0,
        item.addToCartCount || 0,
        item.favoriteCount || 0,
        item.displayAddToCartRate || 0,
        item.displayFavoriteRate || 0,
        item.netGmv || 0,
        item.netGmvSettlementRate || 0,
        item.netOrderCost || 0,
        item.netOrderCount || 0,
        item.netOrderSettlementRate || 0,
        item.netRoi || 0,
        item.overallConversionRate || 0,
        item.overallCtr || 0,
        item.overallOrderCost || 0,
        item.overallPaymentRoi || 0,
        item.platformSubsidyAmount || 0,
        item.preShipRefundAmount || 0,
        item.preShipRefundOrderCount || 0,
        item.preShipRefundRate || 0,
        item.smartCouponAmount || 0,
        item.totalClicks || 0,
        item.totalCost || 0,
        item.totalGmv || 0,
        item.totalImpressions || 0,
        item.totalOrderCount || 0,
        item.unpaidPresaleEstimate || 0
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
        v-model="searchDouyinAccountId"
        style="width: 150px"
        placeholder="搜索ID..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />
      <el-input
        v-model="searchInfluencerNickname"
        style="width: 150px"
        placeholder="搜索达人..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      />
      <!-- <el-input
        v-model="searchVideoTitle"
        style="width: 200px"
        placeholder="搜索视频标题..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      /> -->
      <!-- <el-input
        v-model="searchSalesType"
        style="width: 180px"
        placeholder="搜索销售类别..."
        class="mr-[20px]"
        :prefix-icon="EpSearch"
        clearable
      /> -->
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
    @sort-change="handleSortChange"
  >
    <el-table-column
      prop="douyinAccountId"
      label="ID"
      min-width="160"
      align="left"
      :resizable="false"
    />
    <el-table-column
      prop="douyinNickname"
      label="达人"
      min-width="160"
      align="left"
      :resizable="false"
    />
    <el-table-column
      prop="date"
      label="日期"
      width="90"
      align="center"
      :resizable="false"
    />
    <el-table-column
      prop="productName"
      label="销售产品"
      width="180"
      :resizable="false"
    />
    <el-table-column
      prop="totalCost"
      label="整体消耗"
      width="100"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="totalGmv"
      label="整体成交金额"
      width="120"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="totalImpressions"
      label="整体展示次数"
      width="120"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="totalClicks"
      label="整体点击次数"
      width="120"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="overallPaymentRoi"
      label="整体支付ROI"
      width="120"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="netRoi"
      label="净成交ROI"
      width="100"
      align="right"
      :resizable="false"
      sortable="custom"
    />
    <el-table-column
      prop="netGmv"
      label="净成交金额"
      width="120"
      align="right"
      :resizable="false"
      sortable="custom"
    />
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
