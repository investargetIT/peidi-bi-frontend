<script setup lang="ts">
import NumCard from "../common/numCard.vue";

const props = defineProps({
  tableData: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <NumCard
    title="Filtered Products(Skin & Coat)"
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
          <el-tag type="success" effect="light" round class="min-w-[40px]">
            {{ row.health_score ? row.health_score.toFixed(1) : "N/A" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="red_flags" label="Red Flags">
        <template #default="{ row }">
          <el-space spacer="|" wrap>
            <span
              v-for="flag in row.red_flags"
              :key="flag"
              class="text-[#42A686]"
            >
              {{ flag }}
            </span>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </NumCard>
</template>
