<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import SearchCard from "./components/searchCard/index.vue";
import ProductSelectCard from "./components/productSelectCard/index.vue";
import AnalyzeText from "./components/analyzeText/index.vue";
import AnalyzeChart from "./components/analyzeChart/index.vue";
import AnalyzeList from "./components/analyzeList/index.vue";
import {
  getCommonEnum,
  getGoodsReviewQuestion,
  getGoodsReviewQuestionPre
} from "@/api/taobao";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  COMMIT_ICON,
  TRENDING_UP_ICON,
  TRENDING_DOWN_ICON,
  UP_ICON,
  DOWN_ICON,
  ADVANTAGE_ICON,
  DISADVANTAGE_ICON,
  SUGGESTION_ICON
} from "@/views/taobao/reviewAnalytics/svg/index";
import dayjs from "dayjs";

//#region AI智能检索逻辑
// 是否已经搜索
const isSearch = ref(false);
const isLoading = ref(false);
const handleSearch = (question: string) => {
  fetchGoodsReviewQuestion({
    question,
    product: product.value,
    compareProduct: competitor.value,
    compareProductReviewTime: formatDateRange(competitorTimeRange.value),
    productReviewTime: formatDateRange(productTimeRange.value)
  });
  // console.log(
  //   "compareProductReviewTime",
  //   formatDateRange(competitorTimeRange.value),
  //   "productReviewTime",
  //   formatDateRange(productTimeRange.value)
  // );
  function formatDateRange(dateRange: string[]) {
    if (!dateRange || dateRange.length !== 2) {
      return "";
    }
    if (!dateRange[0] || !dateRange[1]) {
      return "";
    }
    return `${dayjs(dateRange[0]).format("YYYY-MM-DD")}&&${dayjs(dateRange[1]).format("YYYY-MM-DD")}`;
  }
};
//#endregion

//#region 竞品对比模式逻辑
const isCompareMode = ref(false);
// 注入isCompareMode到子组件组件
provide("isCompareMode", isCompareMode);
//#endregion

//#region 产品对比选择逻辑
const productOptions = ref([]);
const competitorOptions = ref([]);
const product = ref("");
const competitor = ref("");
const productTimeRange = ref(["", ""]);
const competitorTimeRange = ref(["", ""]);
//#endregion

//#region 分析内容相关
const analyzeNumCards = ref([]);
const analyzeTextCards = ref([]);
//#endregion

//#region 图表相关
const sentimentChart = ref([]);
const commentTrendsChart = ref([]);
const goodsWordCloud = ref([]);
const compareGoodsWordCloud = ref([]);
//#endregion

//#region 评论相关
export interface AnalyzeListContentItem {
  id: number | string;
  channel: string;
  customerName: string;
  reviewDate: string;
  goodsName: string;
  goodsId: string;
  goodsType: string;
  goodsReview: string;
  goodsImage: string;
  shopName: string;
  sentiment: string;
  milvusId: string;
}

export interface AnalyzeListItem {
  title: string;
  contentList: AnalyzeListContentItem[];
}

const analyzeLists = ref<AnalyzeListItem[]>([]);
//#endregion

//#region 请求相关
const fetchGoodsReviewQuestion = async (params: {
  question: string;
  product: string;
  compareProduct?: string;
  compareProductReviewTime?: string; // 2025-11-01&&2025-11-31
  productReviewTime?: string;
}) => {
  isLoading.value = true;

  getGoodsReviewQuestionPre(params)
    .then((res: any) => {
      if (res.code === 200) {
        ElMessageBox.confirm(
          `检索预计耗时${res.data}分钟，是否继续？`,
          "请确认",
          {
            confirmButtonText: "继续",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
          .then(() => {
            fetchGoodsReviewQuestionDetail();
          })
          .catch(() => {
            ElMessage({
              type: "info",
              message: "已取消检索"
            });
            isLoading.value = false;
          });
      } else {
        ElMessage.error(res.msg || "获取商品评论问题预时间失败");
        isLoading.value = false;
      }
    })
    .catch(() => {
      ElMessage.error("获取商品评论问题预时间失败");
      isLoading.value = false;
    });

  function fetchGoodsReviewQuestionDetail() {
    getGoodsReviewQuestion(params)
      .then((res: any) => {
        if (res.code === 200) {
          isSearch.value = true;

          // 内部逻辑比较复杂，打算用函数封装起来
          //#################################################################
          //#region 处理分析数据
          analyzeNumCards.value = reworkAnalyzeNumCards();
          function reworkAnalyzeNumCards() {
            const goodsReviewsNum = calculateAnalyzeNum(res.data.goodsReviews);
            const compareGoodsReviewsNum = calculateAnalyzeNum(
              res.data.compareGoodsReviews
            );

            function calculateAnalyzeNum(dataList: AnalyzeListContentItem[]) {
              const temp = {
                total: dataList.length,
                positive: dataList.filter(item => item.sentiment === "positive")
                  .length,
                negative: dataList.filter(item => item.sentiment === "negative")
                  .length
              };
              return {
                ...temp,
                positivePercent: calculatePercent(temp.positive, temp.total),
                negativePercent: calculatePercent(temp.negative, temp.total)
              };
            }

            function calculatePercent(num: number, total: number) {
              return num === 0 || total === 0 ? 0 : (num / total) * 100;
            }

            const goodsAndCompareGoodsReviewsNum = {
              totalCompare:
                goodsReviewsNum.total - compareGoodsReviewsNum.total,
              positiveCompare:
                goodsReviewsNum.positivePercent -
                compareGoodsReviewsNum.positivePercent,
              negativeCompare:
                goodsReviewsNum.negativePercent -
                compareGoodsReviewsNum.negativePercent
            };

            const analyzeNumCardsTemp = [];
            analyzeNumCardsTemp.push(
              {
                title: "总评论数",
                content: goodsReviewsNum.total.toLocaleString(),
                iconHTML: COMMIT_ICON,
                changeContent: "",
                changeIconHTML: TRENDING_UP_ICON,
                changeStatus: "positive",

                competitorName: competitor.value.replace("&&", "-"),
                competitorContent:
                  compareGoodsReviewsNum.total.toLocaleString(),
                competitorChangeContent: Math.abs(
                  goodsAndCompareGoodsReviewsNum.totalCompare
                ).toFixed(1),
                competitorChangeIconHTML:
                  goodsAndCompareGoodsReviewsNum.totalCompare > 0
                    ? UP_ICON
                    : DOWN_ICON,
                competitorChangeStatus:
                  goodsAndCompareGoodsReviewsNum.totalCompare > 0
                    ? "positive"
                    : "negative"
              },
              {
                title: "正面评价",
                content: goodsReviewsNum.positivePercent.toFixed(1) + "%",
                iconHTML: TRENDING_UP_ICON,
                changeContent: "",
                changeIconHTML: TRENDING_UP_ICON,
                changeStatus: "positive",

                competitorName: competitor.value.replace("&&", "-"),
                competitorContent:
                  compareGoodsReviewsNum.positivePercent.toFixed(1) + "%",
                competitorChangeContent:
                  Math.abs(
                    goodsAndCompareGoodsReviewsNum.positiveCompare
                  ).toFixed(1) + "%",
                competitorChangeIconHTML:
                  goodsAndCompareGoodsReviewsNum.positiveCompare > 0
                    ? UP_ICON
                    : DOWN_ICON,
                competitorChangeStatus:
                  goodsAndCompareGoodsReviewsNum.positiveCompare > 0
                    ? "positive"
                    : "negative"
              },
              {
                title: "负面评价",
                content: goodsReviewsNum.negativePercent.toFixed(1) + "%",
                iconHTML: TRENDING_DOWN_ICON,
                changeContent: "",
                changeIconHTML: TRENDING_UP_ICON,
                changeStatus: "positive",

                competitorName: competitor.value.replace("&&", "-"),
                competitorContent:
                  compareGoodsReviewsNum.negativePercent.toFixed(1) + "%",
                competitorChangeContent:
                  Math.abs(
                    goodsAndCompareGoodsReviewsNum.negativeCompare
                  ).toFixed(1) + "%",
                competitorChangeIconHTML:
                  goodsAndCompareGoodsReviewsNum.negativeCompare > 0
                    ? UP_ICON
                    : DOWN_ICON,
                competitorChangeStatus:
                  goodsAndCompareGoodsReviewsNum.negativeCompare > 0
                    ? "positive"
                    : "negative"
              }
            );

            return analyzeNumCardsTemp;
          }
          //#endregion

          //#region 处理分析内容
          analyzeTextCards.value = reworkAnalyzeTextCards();
          function reworkAnalyzeTextCards() {
            const analyzeTextCardsTemp = [];
            analyzeTextCardsTemp.push(
              {
                title: "竞争优势",
                contents: [],
                iconHTML: ADVANTAGE_ICON,
                status: "advantage"
              },
              {
                title: "需要改进",
                contents: [],
                iconHTML: DISADVANTAGE_ICON,
                status: "disadvantage"
              },
              {
                title: "优化建议",
                contents: [],
                iconHTML: SUGGESTION_ICON,
                status: "suggestion"
              }
            );
            const compareSummaryTemp = JSON.parse(
              res.data.compareSummary || "{}"
            );
            analyzeTextCardsTemp[0].contents =
              compareSummaryTemp.competitiveAdvantage || [];
            analyzeTextCardsTemp[1].contents =
              compareSummaryTemp.improvementPoints || [];
            analyzeTextCardsTemp[2].contents =
              compareSummaryTemp.optimizationSuggestions || [];
            return analyzeTextCardsTemp;
          }
          //#endregion

          //#region 处理情感分析柱状图
          sentimentChart.value = reworkSentimentChart();
          function reworkSentimentChart() {
            const sentimentChartTemp = [];
            sentimentChartTemp.push(
              {
                name: "本产品",
                type: "bar",
                data: calculateSentiment(res.data.goodsReviews)
              },
              {
                name: "竞品",
                type: "bar",
                data: calculateSentiment(res.data.compareGoodsReviews)
              }
            );

            function calculateSentiment(dataList: AnalyzeListContentItem[]) {
              const temp = [0, 0, 0];
              dataList.forEach(item => {
                if (item.sentiment === "positive") {
                  temp[0]++;
                } else if (item.sentiment === "negative") {
                  temp[2]++;
                } else {
                  temp[1]++;
                }
              });
              return temp;
            }

            return sentimentChartTemp;
          }

          //#endregion

          //#region 处理评论趋势折线图
          commentTrendsChart.value = reworkCommentTrendsChart();
          function reworkCommentTrendsChart() {
            const commentTrendsChartTemp = [];
            commentTrendsChartTemp.push(
              {
                name: "本产品",
                type: "line",
                stack: "Total",
                data: calculateCommentTrends(res.data.goodsReviews),
                smooth: true
              },
              {
                name: "竞品",
                type: "line",
                stack: "Total",
                data: calculateCommentTrends(res.data.compareGoodsReviews),
                smooth: true
              }
            );

            function calculateCommentTrends(
              dataList: AnalyzeListContentItem[]
            ) {
              const temp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
              dataList.forEach(item => {
                const year = dayjs(item.reviewDate).year();
                const month = dayjs(item.reviewDate).month();
                if (year === dayjs().year()) {
                  temp[month] += 1;
                }
              });
              return temp;
            }

            return commentTrendsChartTemp;
          }

          //#endregion

          //#region 处理词云
          const goodsAndCompareGoodsWordCloudTemp =
            reworkGoodsAndCompareGoodsWordCloud();
          function reworkGoodsAndCompareGoodsWordCloud() {
            const goodsWordCloudTemp = JSON.parse(
              res.data.goodsWordCloud || "[]"
            ).map((item: any) => ({
              name: item.word,
              value: item.frequency
            }));
            const compareGoodsWordCloudTemp = JSON.parse(
              res.data.compareGoodsWordCloud || "[]"
            ).map((item: any) => ({
              name: item.word,
              value: item.frequency
            }));
            // console.log("词云", goodsWordCloudTemp, compareGoodsWordCloudTemp);
            return {
              goodsWordCloud: goodsWordCloudTemp,
              compareGoodsWordCloud: compareGoodsWordCloudTemp
            };
          }
          goodsWordCloud.value =
            goodsAndCompareGoodsWordCloudTemp.goodsWordCloud;
          compareGoodsWordCloud.value =
            goodsAndCompareGoodsWordCloudTemp.compareGoodsWordCloud;
          //#endregion

          //#region 处理评论
          analyzeLists.value = reworkAnalyzeLists();
          function reworkAnalyzeLists() {
            const analyzeListsTemp = [];
            analyzeListsTemp.push(
              {
                title: "本产品最新评论",
                contentList:
                  reverseArrayByReviewDate(res.data.goodsReviews) || [] // 按照reviewDate排序
              },
              {
                title: "竞品最新评论",
                contentList:
                  reverseArrayByReviewDate(res.data.compareGoodsReviews) || []
              }
            );

            function reverseArrayByReviewDate(arr: AnalyzeListContentItem[]) {
              return arr.sort((a, b) => {
                return dayjs(b.reviewDate).unix() - dayjs(a.reviewDate).unix();
              });
            }

            return analyzeListsTemp;
          }
          //#endregion
          //#################################################################
        } else {
          ElMessage.error(res.msg || "获取商品评论问题失败");
        }
      })
      .catch(err => {
        ElMessage.error(err.message || "获取商品评论问题失败");
      })
      .finally(() => {
        isLoading.value = false;
      });
  }
};
provide("fetchGoodsReviewQuestion", fetchGoodsReviewQuestion);
// Promise.all 获取所有枚举
const fetchCommonEnum = async () => {
  Promise.all([
    getCommonEnum("reviewShopName"),
    getCommonEnum("compareReviewShopName")
  ])
    .then((res: any[]) => {
      if (res.every(item => item.code === 200)) {
        // ElMessage.success("获取枚举成功");
        const productOptionsTemp = [];
        const competitorOptionsTemp = [];
        // console.log("获取枚举成功", res);

        res[0].data.forEach((item: any) => {
          productOptionsTemp.push({
            value: item.value,
            label: item.value.replaceAll("&&", "-")
          });
        });
        res[1].data.forEach((item: any) => {
          competitorOptionsTemp.push({
            value: item.value,
            label: item.value.replaceAll("&&", "-")
          });
        });

        productOptions.value = productOptionsTemp;
        competitorOptions.value = competitorOptionsTemp;
        // console.log("productOptions", productOptions.value);
        // console.log("competitorOptions", competitorOptions.value);
        // 默认选择第一个产品
        product.value = productOptions.value[0].value;
        // 默认选择第一个竞品
        competitor.value = competitorOptions.value[0].value;
      } else {
        ElMessage.error("获取枚举失败");
      }
    })
    .catch(err => {
      ElMessage.error(err.message || "获取枚举失败");
    });
};
//#endregion

onMounted(() => {
  fetchCommonEnum();
});
</script>

<template>
  <div>
    <div>
      <SearchCard :isLoading="isLoading" :handleSearch="handleSearch" />
    </div>
    <div class="mt-[20px]">
      <ProductSelectCard
        v-model:isCompareMode="isCompareMode"
        v-model:product="product"
        v-model:competitor="competitor"
        v-model:productTimeRange="productTimeRange"
        v-model:competitorTimeRange="competitorTimeRange"
        :productOptions="productOptions"
        :competitorOptions="competitorOptions"
      />
    </div>
    <div v-show="isLoading" class="mt-[20px]">
      <el-card
        v-loading="isLoading"
        style="height: 200px; border-radius: 10px"
        element-loading-text="检索中，请勿关闭页面"
      />
    </div>
    <div v-if="isSearch" v-show="!isLoading">
      <div>
        <AnalyzeText
          :analyzeNumCards="analyzeNumCards"
          :analyzeTextCards="analyzeTextCards"
        />
      </div>
      <div>
        <AnalyzeChart
          :sentimentChart="sentimentChart"
          :goodsWordCloud="goodsWordCloud"
          :commentTrendsChart
          :compareGoodsWordCloud="compareGoodsWordCloud"
        />
      </div>
      <div>
        <AnalyzeList :analyzeLists="analyzeLists" />
      </div>
    </div>
  </div>
</template>
