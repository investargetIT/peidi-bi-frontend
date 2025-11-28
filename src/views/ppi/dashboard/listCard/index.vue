<script setup lang="ts">
import { ref, onMounted } from "vue";
import FluentEmojiFlatStar from "~icons/fluent-emoji-flat/star";
import type { ListCardItem } from "@/views/ppi/dashboard/index.vue";

// props
const props = defineProps({
  sourceData: {
    type: Array as PropType<ListCardItem[]>,
    required: true
  }
});
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <div class="text-[16px] font-[600] text-[#0a0a0a]">
      Top Products by Estimated Sales
    </div>
    <!-- 内容块 -->
    <div
      class="border-b border-[#e5e5e5] pb-[15px] mt-[40px]"
      v-for="item in sourceData"
      :key="item.name"
    >
      <div class="flex justify-between items-center">
        <!-- 左侧 -->
        <div>
          <div class="text-[16px] font-[600] text-[#0a0a0a]">
            {{ item.name }}
          </div>
          <div class="text-[14px] font-[400] text-[#737373]">
            {{ item.brand }}
          </div>
        </div>
        <!-- 右侧 -->
        <div class="flex">
          <!-- 销量 -->
          <div class="mr-[25px] text-right">
            <div class="text-[14px] font-[600] text-[#737373]">Est. Sales</div>
            <div class="text-[16px] font-[700] text-[#0a0a0a]">
              {{ item.sales }}
            </div>
          </div>
          <!-- 价格 -->
          <div class="mr-[25px] text-right">
            <div class="text-[16px] font-[600] text-[#0a0a0a]">
              {{ item.price }}
            </div>
            <div class="text-[14px] text-[#737373]">
              {{ item.reviews }} reviews
            </div>
          </div>
          <!-- 收藏 -->
          <div class="flex items-center">
            <FluentEmojiFlatStar
              class="w-[24px] h-[24px] text-[#ffd700] mr-[5px]"
            />
            <div class="text-[16px] font-[500] text-[#0a0a0a]">
              {{ item.rate }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>
