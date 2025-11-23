<script setup lang="ts">
import { ref } from "vue";
import DataCard from "./dataCard/index.vue";
import SolarBoxOutline from "~icons/solar/box-outline";
import CircumShoppingCart from "~icons/circum/shopping-cart";
import PrimeDollar from "~icons/prime/dollar";
import SolarStarLineDuotone from "~icons/solar/star-line-duotone";
import ListCard from "./listCard/index.vue";

const dataCards = ref([
  {
    title: "Total Products",
    icon: SolarBoxOutline,
    value: "3",
    text: "2 in stock"
  },
  {
    title: "Est. Total Sales",
    icon: CircumShoppingCart,
    value: "214,750",
    text: "Based on reviews"
  },
  {
    title: "Average Price",
    icon: PrimeDollar,
    value: "$25.66",
    text: "Across all products"
  },
  {
    title: "Average Rating",
    icon: SolarStarLineDuotone,
    value: "4.7",
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
  {
    name: "Peanut Butter Bones",
    brand: "Brand B • Dog Treats",
    sales: "107,800",
    price: "$7.99",
    reviews: "2,156",
    rate: "4"
  },
  {
    name: "Premium Chicken Bites",
    brand: "Brand A • Dog Treats",
    sales: "62,350",
    price: "$10.99",
    reviews: "1,247",
    rate: "5"
  },
  {
    name: "Beef Jerky Strips",
    brand: "Brand A • Dog Treats",
    sales: "44,600",
    price: "$57.99",
    reviews: "892",
    rate: "5"
  }
]);
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
