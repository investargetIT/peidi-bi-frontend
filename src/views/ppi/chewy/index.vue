<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import MarketOverview from "./marketOverview/index.vue";
import HealthScoreAndIngredient from "./healthScoreAndIngredient/index.vue";
import BadIngredient from "./badIngredient/index.vue";
import FormFactor from "./formFactor/index.vue";
import FilteredProducts from "./filteredProducts/index.vue";
import DEBUG_DATA from "./debug/response_1769149160652.json";
import { getChewyList } from "@/api/ppi";
import { ElMessage, FormInstance } from "element-plus";

const SCENARIO_LIST = [
  "All Functions",
  "Skin & Coat",
  "Training/Reward",
  "Joint/Mobility",
  "General Treat",
  "Digestion",
  "Long-lasting Chew",
  "Dental",
  "Calming",
  "Topper"
];

const firstLoad = ref(true);
const loading = ref(false);

const overview_info = ref([0, 0]);

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  brand: "",
  scenario: "All Functions",
  quality: []
});

const marketOverviewRef = ref();
const resetFilters = () => {
  searchFormRef.value?.resetFields();
  marketOverviewRef.value?.initActiveBlock();
};

const marketOverviewData = ref({});
const healthScoreData = ref([0, 0, 0, 0, 0]);
const ingredientData = ref({});
const formFactorData = ref({ data: {}, y: [], x: [] });
const badIngredientData = ref({});
const filteredProduct = ref<string | null>(null);
const filteredProductsData = ref<any>([]);

const selectedFilteredProductsData = ref([]);

const fetchChewyList = () => {
  firstLoad.value = false;
  loading.value = true;
  getChewyList({
    function:
      searchForm.scenario === "All Functions" ? "" : searchForm.scenario,
    keyword: searchForm.brand,
    redFlag: searchForm.quality.includes("hide_red_flags"),
    score: searchForm.quality.includes("clean_label")
  })
    .then((res: any) => {
      // console.log("chewy list:", res.data);
      if (res.code === 200) {
        overview_info.value = [res.data.data.length, res.data.cnt];
        handleDataTreating(res.data.data);
      } else {
        ElMessage.error("获取Chewy列表失败:" + res.msg);
      }
    })
    .catch(error => {
      ElMessage.error("获取Chewy列表失败:" + error.message);
    })
    .finally(() => {
      loading.value = false;
    });
};

// 数据处理函数
const handleDataTreating = data => {
  // console.log("数据处理函数:", data);

  const marketOverviewDataTemp = {};

  const healthScoreDataTemp = [0, 0, 0, 0, 0];
  const ingredientDataTemp = {};

  const formFactorDataTemp = { data: {}, y: new Set(), x: new Set() };

  const badIngredientDataTemp = {};

  const filteredProductsDataTemp = [];

  data.forEach((item: any) => {
    const analysis = item.analysis;
    const brand = item.brand;

    const { form_factor, primary_function } = analysis.layer_1_positioning;
    const { health_score, red_flags, first_ingredient, first_ingredient_type } =
      analysis.layer_2_quality;
    const { primary_protein_source } = analysis.layer_3_insights;

    if (marketOverviewDataTemp[primary_function]) {
      marketOverviewDataTemp[primary_function].count++;
      marketOverviewDataTemp[primary_function].score += health_score;
    } else {
      marketOverviewDataTemp[primary_function] = {
        count: 1,
        score: health_score
      };
    }

    if (health_score !== null) {
      if (0 <= health_score && health_score < 2) {
        healthScoreDataTemp[0]++;
      } else if (2 <= health_score && health_score < 4) {
        healthScoreDataTemp[1]++;
      } else if (4 <= health_score && health_score < 6) {
        healthScoreDataTemp[2]++;
      } else if (6 <= health_score && health_score < 8) {
        healthScoreDataTemp[3]++;
      } else if (8 <= health_score && health_score <= 10) {
        healthScoreDataTemp[4]++;
      }
    }

    if (ingredientDataTemp[first_ingredient_type]) {
      ingredientDataTemp[first_ingredient_type]++;
    } else {
      ingredientDataTemp[first_ingredient_type] = 1;
    }

    red_flags.forEach(flag => {
      if (badIngredientDataTemp[flag]) {
        badIngredientDataTemp[flag]++;
      } else {
        badIngredientDataTemp[flag] = 1;
      }
    });

    filteredProductsDataTemp.push({
      product_name: analysis.product_name,
      brand: brand,
      form_factor: form_factor,
      primary_protein_source: primary_protein_source,
      health_score: health_score,
      red_flags: red_flags,
      primary_function: primary_function
    });
  });

  [...data]
    .sort((a, b) => {
      return (
        b.analysis.layer_2_quality.health_score -
        a.analysis.layer_2_quality.health_score
      );
    })
    .slice(0, 10)
    .forEach(item => {
      const analysis = item.analysis;
      const { form_factor } = analysis.layer_1_positioning;
      const { first_ingredient } = analysis.layer_2_quality;

      if (formFactorDataTemp.data[form_factor]) {
        if (formFactorDataTemp.data[form_factor][first_ingredient]) {
          formFactorDataTemp.data[form_factor][first_ingredient]++;
        } else {
          formFactorDataTemp.data[form_factor][first_ingredient] = 1;
        }
      } else {
        formFactorDataTemp.data[form_factor] = {};
        formFactorDataTemp.data[form_factor][first_ingredient] = 1;
      }
      formFactorDataTemp.y.add(form_factor);
      formFactorDataTemp.x.add(first_ingredient);
    });

  marketOverviewData.value = marketOverviewDataTemp;
  healthScoreData.value = healthScoreDataTemp;
  ingredientData.value = ingredientDataTemp;
  formFactorData.value = {
    data: formFactorDataTemp.data,
    y: [...formFactorDataTemp.y],
    x: [...formFactorDataTemp.x]
  };
  badIngredientData.value = badIngredientDataTemp;
  filteredProductsData.value = filteredProductsDataTemp;
};

onMounted(() => {
  // fetchChewyList();
  // handleDataTreating(DEBUG_DATA.data.data);
});

const changeFilteredProduct = product => {
  filteredProduct.value = product;
};

watch(
  () => [filteredProduct.value, filteredProductsData.value],
  (newVal, oldVal) => {
    if (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1]) {
      if (newVal[0] === null) {
        selectedFilteredProductsData.value = newVal[1];
        return;
      }
      selectedFilteredProductsData.value = filteredProductsData.value.filter(
        (item: any) => item?.primary_function === newVal[0]
      );
    }
  }
);
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="text-[36px] font-bold text-[#0a0a0a] mb-[20px]">
      Chewy Market Insights
      <p class="text-[16px] text-[#71717a] font-[500]">
        Comprehensive market analysis for pet food expansion strategy
      </p>
    </div>

    <!-- 搜索卡片 -->
    <el-card shadow="never" style="border-radius: 10px">
      <div
        class="text-[16px] font-bold text-[#0a0a0a] mb-[20px] flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters & Search
      </div>

      <el-form
        ref="searchFormRef"
        :inline="true"
        :model="searchForm"
        class="demo-form-inline"
        label-position="top"
      >
        <el-form-item label="Approved by" prop="brand">
          <el-input
            v-model="searchForm.brand"
            placeholder="e.g. Blue Buffalo, Zesty Paws..."
          />
        </el-form-item>

        <el-form-item label="Function Scenario" prop="scenario">
          <el-select v-model="searchForm.scenario">
            <el-option
              v-for="item in SCENARIO_LIST"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Quality Filters" prop="quality">
          <el-checkbox-group v-model="searchForm.quality" class="flex flex-col">
            <el-checkbox value="clean_label">
              Clean Label Only (Score &gt; 8)
            </el-checkbox>
            <el-checkbox value="hide_red_flags">
              Hide Red Flags (No bad ingredients)
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Active Filters">
          <div class="flex flex-col gap-2">
            <p class="text-sm text-muted-foreground text-[#71717a]">
              Showing
              <span class="font-semibold text-primary">{{
                selectedFilteredProductsData.length
              }}</span>
              of
              {{ overview_info[0] }}
              products
            </p>
            <div>
              <el-button
                type="primary"
                :loading="loading"
                @click="fetchChewyList"
              >
                <span class="font-semibold text-[#ffffff]"> Search </span>
              </el-button>
              <el-button :disabled="loading" @click="resetFilters">
                <span class="font-semibold text-[#0a0a0a]">
                  Reset All Filters
                </span>
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-show="!loading && !firstLoad">
      <!-- 1 -->
      <MarketOverview
        ref="marketOverviewRef"
        class="mt-[20px]"
        :marketOverviewData="marketOverviewData"
        :changeFilteredProduct="changeFilteredProduct"
      />

      <!-- 2 -->
      <HealthScoreAndIngredient
        class="mt-[20px]"
        :healthScoreData="healthScoreData"
        :ingredientData="ingredientData"
      />

      <!-- 3 -->
      <BadIngredient class="mt-[20px]" :badIngredientData="badIngredientData" />

      <!-- 4 -->
      <FormFactor class="mt-[20px]" :formFactorData="formFactorData" />

      <!-- 5 -->
      <FilteredProducts
        v-show="filteredProduct"
        class="mt-[20px]"
        :tableData="selectedFilteredProductsData"
        :filteredProduct="filteredProduct"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.demo-form-inline) {
  justify-content: space-between;
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

:deep(.demo-form-inline .el-form-item__label) {
  color: #0a0a0a;
}
</style>
