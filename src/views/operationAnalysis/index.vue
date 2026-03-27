<script setup lang="ts">
import { ref, onMounted } from "vue";
import E1 from "./components/echartCard/e1.vue";
import E2 from "./components/echartCard/e2.vue";
import E3 from "./components/echartCard/e3.vue";
import E4 from "./components/echartCard/e4.vue";
import { loadExcelFile, type SheetData } from "./utils/excelLoader";
import { ElMessage } from "element-plus";

const excelData = ref<SheetData[]>([]);
const loading = ref(false);

const loadExcelData = async () => {
  loading.value = true;
  try {
    let baseUrl = window.location.href.split("#")[0];
    const sheets = await loadExcelFile(baseUrl + "/static/经营分析指标.xlsx");
    excelData.value = sheets;

    if (sheets.length >= 4) {
      console.log(`成功加载 ${sheets.length} 张工作表`);
    } else {
      console.error(`只加载了 ${sheets.length} 张工作表，预期需要 4 张`);
    }

    console.log(excelData.value);
  } catch (error) {
    console.error("加载 Excel 失败:", error);
    ElMessage.error("加载数据失败，请检查文件是否存在");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadExcelData();
});
</script>

<template>
  <div v-loading="loading">
    <div><E1 :excelData="excelData" /></div>
    <div class="mt-4"><E2 :excelData="excelData" /></div>
    <div class="mt-4"><E3 :excelData="excelData" /></div>
    <div class="mt-4"><E4 :excelData="excelData" /></div>
  </div>
</template>
