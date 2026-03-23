<script setup lang="ts">
import { getBiProductTrafficMonitor } from "@/api/littleRedBook";
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import TableCard from "./components/tableCard/index.vue";

const tableData = ref([]);

//#region 请求相关
const fetchBiProductTrafficMonitor = () => {
  getBiProductTrafficMonitor({
    pageNo: 1,
    pageSize: 10e3
  })
    .then((res: any) => {
      if (res.code === 200) {
        console.log(
          "获取bi_product_traffic_monitor数据成功:",
          res.data.records
        );
        formatData(res.data.records);
      } else {
        ElMessage.error("获取bi_product_traffic_monitor数据失败:" + res?.msg);
      }
    })
    .catch((err: any) => {
      ElMessage.error("获取bi_product_traffic_monitor数据失败:" + err?.message);
    });
};
//#endregion

// 数据处理
const formatData = (data: any) => {
  const temp = {};

  data.forEach((item: any) => {
    if (!temp[item.productName]) {
      temp[item.productName] = [[], []]; // 第一个数组为老品，第二个数组为新品
    }
    if (item.type === "老品") {
      temp[item.productName][0].push(item);
    } else if (item.type === "新品") {
      temp[item.productName][1].push(item);
    }
  });

  tableData.value = Object.keys(temp)
    .map(key => {
      const oldArray = temp[key][0];
      const newArray = temp[key][1];
      const maxLength = Math.max(oldArray.length, newArray.length);

      // 补齐长度，使用空标识填充
      const old_ = [...oldArray];
      const new_ = [...newArray];

      while (old_.length < maxLength) {
        old_.push(null); // 或用 {} 或其他空标识
      }
      while (new_.length < maxLength) {
        new_.push(null); // 或用 {} 或其他空标识
      }

      return {
        name: key,
        old: old_,
        new: new_
      };
    })
    .filter(
      item =>
        !(
          item.name === "null" &&
          item.old.length === 0 &&
          item.new.length === 0
        )
    );
  console.log("整理过后的数据：", tableData.value);
};

onMounted(() => {
  fetchBiProductTrafficMonitor();
});
</script>

<template>
  <div>
    <TableCard :data="tableData" />
  </div>
</template>
