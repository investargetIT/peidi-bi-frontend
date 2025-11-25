<script setup lang="ts">
import { type ProductNewData } from "@/api/ppi";
import { computed, inject } from "vue";
import { COMMENT_RATING_RATIO } from "@/views/ppi/config";

// props
const props = defineProps({
  tableData: {
    type: Array as PropType<ProductNewData[]>,
    default: () => []
  },
  // 分页参数对象 是响应式的
  pagination: {
    type: Object as PropType<{
      pageNo: number;
      pageSize: number;
      pageTotal: number;
    }>,
    required: true
  }
});

// 注入排序方法handleSortChange
const handleSortChange = inject("handleSortChange") as (column: any) => void;

const emit = defineEmits(["update:pagination"]);
const paginationModel = computed({
  get: () => props.pagination,
  set: value => emit("update:pagination", value)
});

// 设计时的模拟数据
// const tableData = [
//   {
//     productName: "Premium Chicken Bites",
//     brand: "Brand A",
//     category: "Dog Treats",
//     platforms: ["Petco", "Chewy", "Amazon US"],
//     priceRange: "$9.99 - $11.49",
//     reviews: "1,247",
//     estSales: "62,350",
//     rating: "In Stock"
//   },
//   {
//     productName: "Beef Jerky Strips",
//     brand: "Brand A",
//     category: "Dog Treats",
//     platforms: ["Chewy", "Amazon US"],
//     priceRange: "$57.99 - $59.99",
//     reviews: "892",
//     estSales: "44,600",
//     rating: "In Stock"
//   },
//   {
//     productName: "Peanut Butter Bones",
//     brand: "Brand B",
//     category: "Dog Treats",
//     platforms: ["Petco", "Chewy", "Amazon US", "Walmart"],
//     priceRange: "$7.29 - $8.99",
//     reviews: "2,156",
//     estSales: "107,800",
//     rating: "Low Stock"
//   }
// ];
</script>

<template>
  <el-card shadow="never" style="border-radius: 10px">
    <!-- 标题 -->
    <div class="text-[16px] font-[600] text-[#0a0a0a] ml-[12px]">Products</div>
    <!-- 列表 -->
    <el-table
      :data="props.tableData"
      :style="{ width: '100%' }"
      :header-row-style="{ color: '#09090b' }"
      :cell-style="{ color: '#09090b' }"
      size="small"
      class="mt-[20px]"
      empty-text="No products found"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="title" label="Product Name" min-width="400" />
      <!-- <el-table-column prop="brand" label="Brand" width="120" /> -->
      <!-- <el-table-column prop="category" label="Category" width="120" /> -->
      <el-table-column prop="channel" label="Platforms" width="200">
        <template #default="scope">
          <el-tag
            type="info"
            effect="plain"
            class="mr-[8px]"
            style="color: #09090b"
          >
            {{ scope.row.channel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="longAmount"
        label="Price Range"
        width="200"
        sortable="custom"
        align="center"
      >
        <template #default="scope">
          <div class="text-[#71717a]">
            ${{ scope.row.longAmount }} - ${{ scope.row.amount }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="reviewCnt"
        label="Reviews"
        width="120"
        sortable="custom"
        align="right"
      >
        <template #default="scope">
          <div class="text-[#71717a]">
            <!-- 尝试将 reviewCnt 先转换为数字类型 -->
            {{ Number(scope.row.reviewCnt || 0).toLocaleString() }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="reviewCnt"
        label="Est. Sales"
        width="120"
        sortable="custom"
        align="right"
      >
        <template #default="scope">
          <div class="text-[#71717a]">
            {{
              (
                (scope.row.reviewCnt || 0) * COMMENT_RATING_RATIO
              ).toLocaleString()
            }}
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="rating" label="Rating" width="120">
        <template #default="scope">
          <el-tag
            v-if="scope.row.rating === 'In Stock'"
            type="info"
            effect="light"
            style="color: #09090b"
          >
            {{ scope.row.rating }}
          </el-tag>
          <el-tag
            v-if="scope.row.rating === 'Low Stock'"
            type="warning"
            effect="plain"
          >
            {{ scope.row.rating }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="star"
        label="Rating"
        width="120"
        sortable="custom"
        align="right"
      >
        <template #default="scope">
          <div class="text-[#71717a]">{{ scope.row.star }}</div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-end mt-[20px]">
      <el-pagination
        v-model:page-size="paginationModel.pageSize"
        v-model:current-page="paginationModel.pageNo"
        size="small"
        layout="total, prev, pager, next, sizes"
        :total="paginationModel.pageTotal"
        background
      />
    </div>
  </el-card>
</template>
