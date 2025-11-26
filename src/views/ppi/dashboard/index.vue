<script setup lang="ts">
import { onMounted, ref } from "vue";
import DataCard from "./dataCard/index.vue";
import SolarBoxOutline from "~icons/solar/box-outline";
import CircumShoppingCart from "~icons/circum/shopping-cart";
import PrimeDollar from "~icons/prime/dollar";
import SolarStarLineDuotone from "~icons/solar/star-line-duotone";
import ListCard from "./listCard/index.vue";
import { getAiIntelligenceProductPage } from "@/api/ppi";
import { message } from "@/utils/message";
import { COMMENT_RATING_RATIO } from "@/views/ppi/config";

const dataCards = ref([
  {
    title: "Total Products",
    icon: SolarBoxOutline,
    value: "0",
    text: "0 in stock"
  },
  {
    title: "Est. Total Sales",
    icon: CircumShoppingCart,
    value: "0",
    text: "Based on reviews"
  },
  {
    title: "Average Price",
    icon: PrimeDollar,
    value: "$0",
    text: "Across all products"
  },
  {
    title: "Average Rating",
    icon: SolarStarLineDuotone,
    value: "0",
    text: "Out of 5 stars"
  }
]);

export interface ListCardItem {
  name: string;
  brand: string;
  sales: string;
  price: string;
  reviews: string;
  rate: string;
}
const listCards = ref<ListCardItem[]>([
  // {
  //   name: "Peanut Butter Bones",
  //   brand: "Brand B • Dog Treats",
  //   sales: "107,800",
  //   price: "$7.99",
  //   reviews: "2,156",
  //   rate: "4"
  // },
  // {
  //   name: "Premium Chicken Bites",
  //   brand: "Brand A • Dog Treats",
  //   sales: "62,350",
  //   price: "$10.99",
  //   reviews: "1,247",
  //   rate: "5"
  // },
  // {
  //   name: "Beef Jerky Strips",
  //   brand: "Brand A • Dog Treats",
  //   sales: "44,600",
  //   price: "$57.99",
  //   reviews: "892",
  //   rate: "5"
  // }
]);

//#region 请求逻辑
// 分页获取产品信息 reviewCnt Top10
const fetchProductPageReviewCntTop10 = () => {
  getAiIntelligenceProductPage({
    pageNo: 1,
    pageSize: 10,
    sortStr: JSON.stringify([
      {
        sortName: "reviewCnt",
        sortType: "desc"
      }
    ])
  })
    .then((res: any) => {
      console.log("获取产品列表Top10", res);
      if (res?.code === 200 && res.data) {
        const sourceData = res.data?.records || [];
        // dataCards数据处理
        dataCards.value = [
          {
            ...dataCards.value[0],
            value: sourceData.length.toLocaleString(),
            text: `${res.data?.total} in stock`
          },
          {
            ...dataCards.value[1],
            value: (
              sourceData.reduce((acc, cur) => acc + Number(cur.reviewCnt), 0) *
              COMMENT_RATING_RATIO
            ).toLocaleString()
          },
          {
            ...dataCards.value[2],
            value: `$${(
              sourceData.reduce((acc, cur) => acc + Number(cur.amount), 0) /
              sourceData.length
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`
          },
          {
            ...dataCards.value[3],
            value: `${(
              sourceData.reduce((acc, cur) => acc + Number(cur.star), 0) /
              sourceData.length
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`,
            text: `Out of 5 stars`
          }
        ];
        // listCards数据处理
        listCards.value = sourceData.map(item => ({
          name: item.title,
          brand: item.channel,
          sales: (item.reviewCnt * COMMENT_RATING_RATIO).toLocaleString(),
          price: `$${item.amount}`,
          reviews: item.reviewCnt.toLocaleString(),
          rate: item.star
        }));
      } else {
        message("获取产品列表Top10失败", { type: "error" });
      }
    })
    .catch(() => {
      message("获取产品列表Top10失败", { type: "error" });
    });
};
//#endregion

onMounted(() => {
  fetchProductPageReviewCntTop10();
});
</script>

<template>
  <!-- 标题 -->
  <div class="text-[36px] font-bold text-[#0a0a0a] mb-[20px]">
    Global Pet Food Intelligence
  </div>
  <!-- 概览信息卡片 -->
  <div>
    <el-row :gutter="60">
      <el-col v-for="card in dataCards" :key="card.title" :xs="24" :span="6">
        <DataCard
          :title="card.title"
          :icon="card.icon"
          :value="card.value"
          :text="card.text"
          :style="{ minWidth: '300px', borderRadius: '10px' }"
        />
      </el-col>
    </el-row>
  </div>
  <!-- 排行榜卡片 -->
  <div class="mt-[20px]">
    <ListCard :sourceData="listCards" />
  </div>
</template>
