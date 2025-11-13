<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { RFMCustomerData } from "@/views/RFM/index.vue";
import { TableColumnCtx } from "element-plus";
import dayjs from "dayjs";

//props
const props = defineProps({
  sourceData: {
    type: Array as PropType<RFMCustomerData[]>,
    required: true
  }
});

const tableData = ref<RFMCustomerData[]>([
  // {
  //   // 基础信息字段
  //   id: "", // 客户ID
  //   areaLevel1: "", // 一级行政区：如"黑龙江省"
  //   areaLevel2: "", // 二级行政区：如"七台河市"
  //   level: "", // 客户等级：如"其他"
  //   date: "", // 数据日期：如"2025-11-13"
  //   // 时间相关字段 (R - Recency)
  //   firstOrderTime: "", // 首次消费时间：如"2022-01-01 18:44:09"
  //   lastOrderTime: "", // 最近一次消费时间：如"2025-11-09 11:43:31"
  //   // 金额相关字段 (M - Monetary)
  //   totalAmount: "", // 累计消费金额：总消费金额
  //   lastYearAmount: "", // 近一年消费金额：如36561.93
  //   lastDayAmount: "", // 最近一次消费金额：如27.9
  //   // 频次相关字段 (F - Frequency)
  //   totalOrders: "", // 累计消费频次：总消费次数
  //   lastYearOrders: "" // 近一年消费频次：如347次
  // }
]);

// 监听 sourceData 变化，value变化时更新 tableData
watch(
  () => props.sourceData,
  (newData: RFMCustomerData[]) => {
    //对newData进行排序，先按等级，再按一级行政区，最后按二级行政区
    newData.sort((a, b) => {
      // 先按等级排序
      const levelOrder = ["1", "2", "3", "其他"];
      const aLevelIndex = levelOrder.indexOf(a.level);
      const bLevelIndex = levelOrder.indexOf(b.level);
      if (aLevelIndex !== bLevelIndex) {
        return aLevelIndex - bLevelIndex;
      }
      // 再按一级行政区排序
      if (a.areaLevel1 !== b.areaLevel1) {
        return a.areaLevel1.localeCompare(b.areaLevel1);
      }
      // 最后按二级行政区排序
      return a.areaLevel2.localeCompare(b.areaLevel2);
    });

    tableData.value = newData;
  }
);

// 筛选方法
const filterHandler = (
  value: string,
  row: RFMCustomerData,
  column: TableColumnCtx<RFMCustomerData>
) => {
  const property = column["property"];
  return row[property] === value;
};
// 筛选通用的方法，用于生成筛选器选项，传入筛选的字段名
const generateFilterOptions = (property: keyof RFMCustomerData) => {
  const uniqueValues = [
    ...new Set(tableData.value.map(item => item[property]))
  ];
  return uniqueValues.map(value => ({ text: value, value }));
};
</script>

<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%; color: #09090b"
      :header-cell-style="{ color: '#09090b' }"
      border
      stripe
      height="750"
      size="small"
    >
      <el-table-column
        prop="areaLevel1"
        label="一级行政区"
        :filters="generateFilterOptions('areaLevel1')"
        :filter-method="filterHandler"
        sortable
        min-width="150"
        :resizable="false"
      />
      <el-table-column
        prop="areaLevel2"
        label="二级行政区"
        sortable
        min-width="180"
        :resizable="false"
      />
      <el-table-column
        prop="level"
        label="等级"
        :filters="generateFilterOptions('level')"
        :filter-method="filterHandler"
        sortable
        min-width="100"
        :resizable="false"
      />
      <el-table-column
        prop="firstOrderTime"
        label="首次消费时间"
        sortable
        min-width="160"
        :resizable="false"
      >
        <template #default="scope">
          <div>
            {{ dayjs(scope.row.firstOrderTime).format("YYYY/MM/DD HH:mm:ss") }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastOrderTime"
        label="最近一次消费时间"
        sortable
        min-width="165"
        :resizable="false"
      >
        <template #default="scope">
          <div>
            {{ dayjs(scope.row.lastOrderTime).format("YYYY/MM/DD HH:mm:ss") }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="totalAmount"
        label="累计消费金额"
        sortable
        min-width="135"
        :resizable="false"
      >
        <template #default="scope">
          <div>
            {{ scope.row.totalAmount.toFixed(2) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastYearAmount"
        label="近一年消费金额"
        sortable
        min-width="160"
        :resizable="false"
      >
        <template #default="scope">
          <div>
            {{ scope.row.lastYearAmount.toFixed(2) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastDayAmount"
        label="最近一次消费金额"
        sortable
        min-width="165"
        :resizable="false"
      >
        <template #default="scope">
          <div>
            {{ scope.row.lastDayAmount.toFixed(2) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="totalOrders"
        label="累计消费频次"
        sortable
        min-width="135"
        :resizable="false"
      >
        <template #default="scope">
          <div>
            {{ scope.row.totalOrders }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastYearOrders"
        label="近一年消费频次"
        sortable
        min-width="155"
        :resizable="false"
      >
        <template #default="scope">
          <div>
            {{ scope.row.lastYearOrders }}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
