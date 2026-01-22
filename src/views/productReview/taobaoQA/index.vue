<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { getTaobaoAnswers } from "@/api/productReview";
import dayjs from "dayjs";
import TdesignLink from "~icons/tdesign/link";

export interface TaobaoAnswerItem {
  /** 回答内容 */
  answerContent: string;
  /** 回答数量 */
  answerCount: number;
  /** 回答ID */
  answerId: string;
  /** 回答时间 (ISO格式) */
  answerTime: string;
  /** 回答用户名 (脱敏) */
  answerUserName: string;
  /** 回答列表 (可能为null) */
  answersList: TaobaoAnswerItem[] | null;
  /** 提问时间 (ISO格式) */
  askTime: string;
  /** 渠道 (如: 天猫) */
  channel: string;
  /** 日期 (格式: YYYY-MM-DD) */
  date: string;
  /** 唯一标识ID */
  id: number;
  /** 商品ID */
  productId: string;
  /** 商品名称 */
  productName: string;
  /** 商品详情链接 */
  productUrl: string;
  /** 问题内容 */
  questionContent: string;
  /** 问题ID */
  questionId: string;
  /** 店铺名称 */
  shopName: string;
  /** 用户昵称 (脱敏) */
  userNickname: string;
}

const taobaoQAData = ref<TaobaoAnswerItem[]>([]);
const pagination = ref({
  pageNo: 1,
  pageSize: 5,
  pageTotal: 0
});

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  productId: "",
  shopName: "",
  askTime: null
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
  if (searchForm.shopName) {
    searchStr.push({
      searchName: "shopName",
      searchType: "like",
      searchValue: searchForm.shopName
    });
  }
  if (searchForm.askTime && searchForm.askTime.length === 2) {
    searchStr.push({
      searchName: "askTime",
      searchType: "betweenStr",
      searchValue: [
        dayjs(searchForm.askTime[0]).format("YYYY-MM-DD 00:00:00"),
        dayjs(searchForm.askTime[1]).format("YYYY-MM-DD 23:59:59")
      ].join(",")
    });
  }
  return JSON.stringify(searchStr);
};
const handleReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl?.resetFields();
  fetchTaobaoAnswers();
};

// 计算合并配置
const spanMethod = computed(() => {
  return ({ row, column, rowIndex, columnIndex }: any) => {
    // 在商品名称、商品ID、问题内容、提问用户、提问时间列进行合并
    if (columnIndex >= 0 && columnIndex <= 5) {
      const data = taobaoQAData.value;
      let rowspan = 1;
      let colspan = 0;

      // 检查是否与前一行是同一个商品
      const isSameProductAsPrevious =
        rowIndex > 0 &&
        data[rowIndex].productName === data[rowIndex - 1].productName;

      // 检查是否与前一行的对应列值相同（对于问题相关列）
      const isSameQuestionInfoAsPrevious =
        rowIndex > 0 &&
        data[rowIndex].productName === data[rowIndex - 1].productName &&
        data[rowIndex].questionContent === data[rowIndex - 1].questionContent &&
        data[rowIndex].userNickname === data[rowIndex - 1].userNickname &&
        data[rowIndex].askTime === data[rowIndex - 1].askTime;

      if (columnIndex === 0 || columnIndex === 1) {
        // 商品名称和商品ID列：基于商品名称进行合并
        if (isSameProductAsPrevious) {
          // 如果与前一行是同一个商品，则隐藏当前行
          rowspan = 0;
          colspan = 0;
        } else {
          // 计算当前商品连续出现的次数
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
      } else {
        // 问题内容、提问用户、提问时间列：基于完整问题信息进行合并
        if (isSameQuestionInfoAsPrevious) {
          // 如果与前一行是同一个问题，则隐藏当前行
          rowspan = 0;
          colspan = 0;
        } else {
          // 计算当前问题连续出现的次数（在同一个商品的前提下）
          let count = 1;
          for (let i = rowIndex + 1; i < data.length; i++) {
            if (
              data[i].productName === row.productName &&
              data[i].questionContent === row.questionContent &&
              data[i].userNickname === row.userNickname &&
              data[i].askTime === row.askTime
            ) {
              count++;
            } else {
              break;
            }
          }
          rowspan = count;
          colspan = 1;
        }
      }

      return {
        rowspan: rowspan,
        colspan: colspan
      };
    }
  };
});

const fetchTaobaoAnswers = async () => {
  getTaobaoAnswers({
    pageNo: pagination.value.pageNo,
    pageSize: pagination.value.pageSize,
    searchStr: formatSearchStr()
  })
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("获取淘宝问答成功", res.data);

        // 如果当前页大于总页数，重置为最后一页 排除总页数为0的情况
        if (res.data?.current > res.data?.pages && res.data?.total !== 0) {
          pagination.value.pageNo = res.data?.pages;
          return;
        }

        // 更新总页数
        pagination.value.pageTotal = res.data?.total || 0;

        const taobaoQADataTemp = [];

        if (res.data?.records && res.data.records.length > 0) {
          for (const productRecord of res.data.records) {
            if (
              productRecord.answersList &&
              productRecord.answersList.length > 0
            ) {
              for (const questionRecord of productRecord.answersList) {
                if (
                  questionRecord.answersList &&
                  questionRecord.answersList.length > 0
                ) {
                  // console.log(
                  //   "questionRecord.answersList",
                  //   questionRecord.answersList
                  // );
                  for (const answerRecord of [
                    ...questionRecord.answersList
                  ].sort(
                    (a, b) =>
                      dayjs(b.answerTime).unix() - dayjs(a.answerTime).unix()
                  )) {
                    taobaoQADataTemp.push(answerRecord);
                  }
                }
              }
            }
          }
        }

        // console.log("taobaoQADataTemp", taobaoQADataTemp);
        taobaoQAData.value = taobaoQADataTemp;
      } else {
        ElMessage.error(res.msg || "获取淘宝问答失败");
      }
    })
    .catch(err => {
      ElMessage.error(err.message || "获取淘宝问答失败");
    });
};

onMounted(() => {
  fetchTaobaoAnswers();
});

watch(
  () => [pagination.value.pageNo, pagination.value.pageSize],
  () => {
    fetchTaobaoAnswers();
  },
  {
    immediate: true
  }
);

defineExpose({
  fetchTaobaoAnswers
});
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
        <el-form-item label="店铺名称" prop="shopName">
          <el-input
            v-model="searchForm.shopName"
            placeholder="请输入店铺名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="提问时间" prop="askTime">
          <el-date-picker
            v-model="searchForm.askTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="handleReset(searchFormRef)">重置</el-button>
          <el-button type="primary" @click="fetchTaobaoAnswers">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="border-radius: 10px">
      <el-table
        :data="taobaoQAData"
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
              style="margin-left: 5px; font-size: 14px"
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

        <el-table-column
          prop="questionContent"
          label="问题内容"
          min-width="200"
        />

        <el-table-column prop="userNickname" label="提问用户" width="80" />
        <el-table-column prop="askTime" label="提问时间" width="120">
          <template #default="scope">
            {{
              scope.row.askTime
                ? dayjs(scope.row.askTime).format("YYYY-MM-DD")
                : "-"
            }}
          </template>
        </el-table-column>
        <el-table-column prop="answerCount" label="回答数量" width="80" />

        <el-table-column prop="answerContent" label="回答内容" min-width="200">
          <template #default="scope">
            <el-scrollbar max-height="100px">
              <div>
                {{ scope.row.answerContent }}
              </div>
            </el-scrollbar>
          </template>
        </el-table-column>
        <el-table-column prop="answerUserName" label="回答用户" width="100" />

        <el-table-column prop="answerTime" label="回答时间" width="120">
          <template #default="scope">
            {{
              scope.row.answerTime
                ? dayjs(scope.row.answerTime).format("YYYY-MM-DD")
                : "-"
            }}
          </template>
        </el-table-column>

        <el-table-column prop="channel" label="渠道" width="70" />
        <el-table-column prop="shopName" label="店铺名称" width="120" />
      </el-table>

      <div class="mt-[16px] flex justify-end">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[1, 5, 10, 100]"
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
