<script setup lang="ts">
import { computed, ref, watch } from "vue";
import NumCard from "../common/numCard.vue";
import { bg } from "element-plus/es/locale/index.mjs";

const props = defineProps({
  sourceData: {
    type: Array,
    required: true
  },
  filteredProduct: {
    type: [String, null],
    required: true
  }
});

const tableData = ref([]);

watch(
  () => [props.filteredProduct, props.sourceData],
  (newVal, oldVal) => {
    if (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1]) {
      tableData.value = props.sourceData.filter(
        (item: any) => item?.primary_function === newVal[0]
      );
    }
    // console.log("tableData:", tableData.value);
  }
);

const getHealthScoreColor = (healthScore: number | string) => {
  if (typeof healthScore === "string") {
    healthScore = Number(healthScore);
  }

  if (healthScore >= 8) {
    return {
      bg: "rgb(220, 252, 231)",
      color: "rgb(22, 101, 52)"
    };
  } else if (healthScore >= 6) {
    return {
      bg: "rgb(254, 249, 195)",
      color: "rgb(133, 77, 14)"
    };
  } else {
    return {
      bg: "rgb(254, 226, 226)",
      color: "rgb(153, 27, 27)"
    };
  }
};
</script>

<template>
  <NumCard
    :title="`Filtered Products(${props.filteredProduct})`"
    num=""
    :desc="tableData.length + ' products match your criteria'"
  >
    <el-table
      :data="tableData"
      style="width: 100%"
      :header-row-style="{ color: '#09090b' }"
      empty-text="No filtered products found"
      size="small"
      class="mt-[20px]"
      height="400px"
    >
      <el-table-column prop="product_name" label="Product" min-width="250px">
        <template #default="{ row }">
          <span class="text-[#0a0a0a]">{{ row.product_name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="brand" label="Brand" />
      <el-table-column prop="form_factor" label="Form">
        <template #default="{ row }">
          <span class="text-[#0a0a0a]">{{ row.form_factor }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="primary_protein_source" label="Protein">
        <template #default="{ row }">
          <span class="text-[#0a0a0a]">{{ row.primary_protein_source }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="health_score" label="Health Score">
        <template #default="{ row }">
          <span
            class="px-2 py-1 rounded-full text-xs font-medium"
            :style="{
              backgroundColor: getHealthScoreColor(row.health_score).bg,
              color: getHealthScoreColor(row.health_score).color
            }"
          >
            {{ row.health_score ? row.health_score.toFixed(1) : "N/A" }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="red_flags" label="Red Flags">
        <template #default="{ row }">
          <el-space v-if="row.red_flags.length > 0" wrap>
            <span
              v-for="flag in row.red_flags"
              :key="flag"
              class="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
              >{{ flag }}</span
            >
          </el-space>
          <span v-else class="text-[#42A686]">Clean</span>
        </template>
      </el-table-column>
    </el-table>
  </NumCard>
</template>
