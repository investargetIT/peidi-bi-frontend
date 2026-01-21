<script setup lang="ts">
import { onMounted, ref, computed, reactive, watch } from "vue";
import {
  getGoodsEvaluation,
  postGenerateAiEvaluation
} from "@/api/productReview";
import { ElMessage, FormInstance } from "element-plus";
import dayjs from "dayjs";
import { useClipboard } from "@vueuse/core";
import TdesignLink from "~icons/tdesign/link";

// 商品评价类型定义
export interface ProductEvaluation {
  /** 评价ID */
  id: number;
  /** 抓取日期 (格式: YYYY-MM-DD) */
  date: string;
  /** 渠道 (如: 天猫、京东等) */
  channel: string;
  /** 评价类型 (如: 【主评】、【追评】) */
  evaluationType: string;
  /** 评价内容 */
  evaluationContent: string;
  /** 评价时间 (ISO格式) */
  evaluationTime: string;
  /** 订单号 (可能为空) */
  orderNo: string | null;
  /** 商品ID */
  productId: string;
  /** 商品名称 */
  productName: string;
  /** 用户昵称 (脱敏) */
  userNickname: string;
  /** 评价图片URL */
  imageUrls: string;
  /** 更多评价内容 (可能为空) */
  moreEvaluationContent: string | null;
  /** 店铺名称 */
  shopName: string;
  /** 商品详情链接 */
  productUrl: string;
  /** 情感分析结果 */
  sentiment: string;
  /** 商品评价列表 */
  goodsEvaluationList: unknown[] | null;
}

const evaluationData = ref<ProductEvaluation[]>([
  {
    id: 143,
    date: "2026-01-02",
    channel: "天猫",
    evaluationType: "【主评】",
    evaluationContent: "狗狗很喜欢吃 鸭肉冻干小狗的最爱",
    evaluationTime: "2026-01-02T23:35:06",
    orderNo: null,
    productId: "781124272229",
    productName: "【尝鲜】Meatyway爵宴风干犬粮营养鸭肉风干粮通用全价狗粮试吃",
    userNickname: "e**",
    imageUrls:
      "https://img.alicdn.com/i2/O1CN01mLK3Yb2BG2QDhxd9y_!!4611686018427384502-0-rate.jpg",
    moreEvaluationContent: null,
    shopName: "佩蒂旗舰店",
    productUrl: "https://detail.tmall.com/item.htm?id=781124272229",
    sentiment: "商品整体满意",
    goodsEvaluationList: null
  }
]);
const pagination = ref({
  pageNo: 1,
  pageSize: 5,
  pageTotal: 0
});

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  productId: "",
  orderNo: "",
  shopName: "",
  evaluationTime: null
});
const formatSearchStr = () => {
  const searchStr = [];
  if (searchForm.productId) {
    searchStr.push({
      searchName: "productId",
      searchType: "equals",
      searchValue: `${searchForm.productId}`
    });
  }
  if (searchForm.orderNo) {
    searchStr.push({
      searchName: "orderNo",
      searchType: "equals",
      searchValue: `${searchForm.orderNo}`
    });
  }
  if (searchForm.shopName) {
    searchStr.push({
      searchName: "shopName",
      searchType: "like",
      searchValue: searchForm.shopName
    });
  }
  if (searchForm.evaluationTime && searchForm.evaluationTime.length === 2) {
    searchStr.push({
      searchName: "evaluationTime",
      searchType: "betweenStr",
      searchValue: [
        dayjs(searchForm.evaluationTime[0]).format("YYYY-MM-DD 00:00:00"),
        dayjs(searchForm.evaluationTime[1]).format("YYYY-MM-DD 23:59:59")
      ].join(",")
    });
  }
  return JSON.stringify(searchStr);
};
const handleReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl?.resetFields();
  fetchGoodsEvaluation();
};

// 计算合并配置
const spanMethod = computed(() => {
  return ({ row, column, rowIndex, columnIndex }: any) => {
    // 只在商品名称列进行合并
    if (columnIndex === 0 || columnIndex === 1) {
      const data = evaluationData.value;
      let rowspan = 1;
      let colspan = 0;

      // 查找相同商品名称的行数
      if (
        rowIndex > 0 &&
        data[rowIndex].productName === data[rowIndex - 1].productName
      ) {
        // 如果与前一行相同，则隐藏当前行
        rowspan = 0;
        colspan = 0;
      } else {
        // 计算当前商品名称连续出现的次数
        let count = 1;
        for (let i = rowIndex + 1; i < data.length; i++) {
          if (data[i].productName === row.productName) {
            count++;
          } else {
            break;
          }
        }
        rowspan = count;
        colspan = 1;
      }

      return {
        rowspan: rowspan,
        colspan: colspan
      };
    }
  };
});

// 获取商品评论
const fetchGoodsEvaluation = () => {
  getGoodsEvaluation({
    pageNo: pagination.value.pageNo,
    pageSize: pagination.value.pageSize,
    searchStr: formatSearchStr()
  })
    .then((res: any) => {
      // console.log("商品评价列表:", res.data);

      if (res.code === 200) {
        // 如果当前页大于总页数，重置为最后一页 排除总页数为0的情况
        if (res.data?.current > res.data?.pages && res.data?.total !== 0) {
          pagination.value.pageNo = res.data?.pages;
          return;
        }

        // 更新总页数
        pagination.value.pageTotal = res.data?.total || 0;

        const evaluationDataTemp = [];
        res.data.records.forEach((item: ProductEvaluation) => {
          const itemReverse = [...item.goodsEvaluationList].reverse();
          evaluationDataTemp.push(...(itemReverse || []));
        });
        evaluationData.value = evaluationDataTemp;
      } else {
        ElMessage.error("获取商品评价失败:" + res.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取商品评价失败:" + error.message);
    });
};

watch(
  () => [pagination.value.pageNo, pagination.value.pageSize],
  () => {
    fetchGoodsEvaluation();
  },
  {
    immediate: true
  }
);

const commitLoading = ref({});

const handleClickCommit = (row: any) => {
  // console.log("点击评论:", row);
  commitLoading.value[row.id] = true;
  fetchGenerateAiEvaluation(row);
};

// 生成ai回复
const fetchGenerateAiEvaluation = (row: any) => {
  postGenerateAiEvaluation({ id: row.id })
    .then((res: any) => {
      if (res.code === 200) {
        fetchGoodsEvaluation();
        commitLoading.value[row.id] = false;
      } else {
        ElMessage.error("生成ai回复失败:" + res.msg);
      }
    })
    .catch(error => {
      ElMessage.error("生成ai回复失败:" + error.message);
    });
};

const { copy } = useClipboard();
const handleCopy = (text: string) => {
  copy(text);
  ElMessage.success("复制成功");
};
</script>

<template>
  <div>
    <el-card
      shadow="never"
      style="margin-bottom: 12px; border-radius: 10px"
      class="search-card"
    >
      <el-form
        ref="searchFormRef"
        :inline="true"
        :model="searchForm"
        class="demo-form-inline"
      >
        <el-form-item label="商品ID" prop="productId">
          <el-input
            v-model="searchForm.productId"
            placeholder="请输入商品ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="订单号" prop="orderNo">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="shopName">
          <el-input
            v-model="searchForm.shopName"
            placeholder="请输入店铺名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="评价日期" prop="evaluationTime">
          <el-date-picker
            v-model="searchForm.evaluationTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="handleReset(searchFormRef)">重置</el-button>
          <el-button type="primary" @click="fetchGoodsEvaluation"
            >查询</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="border-radius: 10px">
      <el-table
        :data="evaluationData"
        style="width: 100%"
        size="small"
        :header-cell-style="{ color: '#0a0a0a' }"
        :span-method="spanMethod"
      >
        <el-table-column prop="productName" label="商品名称" min-width="150">
          <template #default="scope">
            <span>{{ scope.row.productName }}</span>
            <el-link
              v-if="scope.row.productUrl"
              :href="scope.row.productUrl"
              target="_blank"
              type="primary"
              style=" margin-left: 5px;font-size: 14px"
            >
              <el-tooltip
                effect="dark"
                content="点击查看商品详情"
                placement="top-start"
              >
                <TdesignLink />
              </el-tooltip>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="productId" label="商品ID" width="120" />
        <el-table-column prop="orderNo" label="订单号" width="150" />
        <el-table-column prop="evaluationType" label="评价类型" width="80" />
        <el-table-column
          prop="evaluationContent"
          label="评价内容"
          min-width="200"
        >
          <template #default="scope">
            <el-scrollbar max-height="100px">
              <div>
                {{ scope.row.evaluationContent }}
              </div>
            </el-scrollbar>
          </template>
        </el-table-column>
        <el-table-column
          prop="moreEvaluationContent"
          label="追评内容"
          width="150"
        >
          <template #default="scope">
            <el-scrollbar max-height="100px">
              <div>
                {{ scope.row.moreEvaluationContent || "-" }}
              </div>
            </el-scrollbar>
          </template>
        </el-table-column>
        <el-table-column prop="imageUrls" label="评价图片" width="80">
          <template #default="scope">
            <el-image
              v-if="scope.row.imageUrls"
              :src="scope.row.imageUrls"
              :preview-src-list="[scope.row.imageUrls]"
              style="width: 50px; height: 50px"
              fit="cover"
              preview-teleported
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sentiment" label="情感分析" width="120" />
        <el-table-column prop="evaluationTime" label="评价日期" width="90">
          <template #default="scope">
            {{
              scope.row.evaluationTime
                ? dayjs(scope.row.evaluationTime).format("YYYY-MM-DD")
                : "-"
            }}
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="70" />
        <el-table-column prop="shopName" label="店铺名称" width="120" />
        <el-table-column prop="userNickname" label="用户昵称" width="80" />

        <el-table-column
          prop="aiEvaluationContent"
          label="AI回复（点击复制）"
          width="200"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              v-if="!scope.row.aiEvaluationContent"
              type="primary"
              size="small"
              style="font-size: 12px"
              :loading="commitLoading[scope.row.id]"
              @click="handleClickCommit(scope.row)"
            >
              点击生成
            </el-button>
            <el-scrollbar v-else max-height="100px">
              <div @click="handleCopy(scope.row.aiEvaluationContent)">
                {{ scope.row.aiEvaluationContent }}
              </div>
            </el-scrollbar>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-[16px] flex justify-end">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 30]"
          size="small"
          background
          layout="total, sizes, prev, pager, next"
          :total="pagination.pageTotal"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

:deep(.search-card .el-card__body) {
  padding-bottom: 0;
}
</style>
