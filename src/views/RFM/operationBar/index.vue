<script setup lang="ts">
import { ref, inject, onMounted, nextTick } from "vue";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import { Search } from "@element-plus/icons-vue";
import SolarChartOutline from "~icons/solar/chart-outline";

// props
const props = defineProps({
  rfmDataLoading: {
    type: Boolean,
    required: true
  }
});

// 获取rfm模型方法
const fetchBiRfm =
  inject<
    (params: { date: string; endTime: string; startTime: string }) => void
  >("fetchBiRfm");

//#region  累计时间段逻辑
// 日期默认为当前一个月
const dateRange = ref<[Date, Date]>([
  dayjs().subtract(1, "month").startOf("day").toDate(),
  dayjs().endOf("day").toDate()
]);
const shortcuts = [
  {
    text: "最近一个月",
    value: () => {
      const end = dayjs().endOf("day").toDate();
      const start = dayjs().subtract(1, "month").startOf("day").toDate();
      return [start, end];
    }
  },
  {
    text: "最近一个季度",
    value: () => {
      const end = dayjs().endOf("day").toDate();
      const start = dayjs().subtract(3, "month").startOf("day").toDate();
      return [start, end];
    }
  },
  {
    text: "最近一年",
    value: () => {
      const end = dayjs().endOf("day").toDate();
      const start = dayjs().subtract(1, "year").startOf("day").toDate();
      return [start, end];
    }
  }
];
//#endregion

//#region  最近一次时间逻辑
const lastOrderTime = ref<Date>(dayjs().endOf("day").toDate()); // 默认为当前时间
//#endregion

// 存放上一次查询的时间 格式为[开始时间, 结束时间, 最近一次时间]
const lastSearchTime = ref<[Date, Date, Date]>([null, null, null]);

const handleSearch = () => {
  if (!dateRange.value) {
    message("请选择日期范围", { type: "warning" });
    return;
  }
  // 如果时间没变化，不请求
  if (
    dayjs(lastSearchTime.value[0]).isSame(dayjs(dateRange.value[0])) &&
    dayjs(lastSearchTime.value[1]).isSame(dayjs(dateRange.value[1])) &&
    dayjs(lastSearchTime.value[2]).isSame(dayjs(lastOrderTime.value))
  ) {
    message("时间未变化，无需查询", { type: "info" });
    return;
  }
  // 更新上一次查询的时间
  lastSearchTime.value = [
    dayjs(dateRange.value[0]).toDate(),
    dayjs(dateRange.value[1]).toDate(),
    dayjs(lastOrderTime.value).toDate()
  ];
  fetchBiRfm({
    date: dayjs(lastOrderTime.value).format("YYYY-MM-DD"),
    endTime: dayjs(dateRange.value[1]).format("YYYY-MM-DD"),
    startTime: dayjs(dateRange.value[0]).format("YYYY-MM-DD")
  });
};

onMounted(() => {
  // 初始化时请求rfm模型
  // fetchBiRfm({
  //   date: dayjs(lastOrderTime.value).format("YYYY-MM-DD"),
  //   endTime: dayjs(dateRange.value[1]).format("YYYY-MM-DD"),
  //   startTime: dayjs(dateRange.value[0]).format("YYYY-MM-DD")
  // });
});

// 锚点
const handleClickAnchor = (e: Event, link: any) => {
  //阻止点击的默认事件修改路由
  e.preventDefault();
  // console.log("点击了锚点", e, link);
  // alert("点击了锚点" + link);
  nextTick(() => {
    if (link) {
      const element = document.getElementById(link);
      // alert("节点" + element);
      element &&
        element.scrollIntoView({
          block: "start",
          behavior: "smooth"
        });
    }
  });
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between flex-wrap">
      <div>
        <Flex>
          <span class="text-[14px]">数据抓取日期: </span>
          <el-date-picker
            v-model="lastOrderTime"
            type="date"
            placeholder="请选择"
            :clearable="false"
            class="mr-[20px]"
            :disabled-date="
              (date: Date) => date > dayjs().endOf('day').toDate()
            "
          />
        </Flex>

        <Flex>
          <span class="text-[14px]">累计周期: </span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="shortcuts"
            :clearable="false"
            class="mr-[20px]"
          />
        </Flex>

        <el-button
          type="primary"
          class="w-[100px]"
          :icon="Search"
          :loading="rfmDataLoading"
          @click="handleSearch"
        >
          查询
        </el-button>
      </div>

      <el-anchor @click="handleClickAnchor">
        <el-anchor-link href="peidi-RFM-analysis">
          <el-button type="primary" class="w-[100px]" :icon="SolarChartOutline">
            图表
          </el-button></el-anchor-link
        >
      </el-anchor>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.el-anchor {
  background-color: transparent;
}

:deep(.el-anchor.el-anchor--vertical .el-anchor__marker) {
  height: 0;
}
</style>
