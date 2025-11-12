<script setup lang="ts">
import DataCard from "@/views/dashboard/components/dataCard/index.vue";
import RiDatabase2Line from "~icons/ri/database-2-line";
import RiFileTextLine from "~icons/ri/file-text-line";
import RiUser3Line from "~icons/ri/user-3-line";
import RiLineChartLine from "~icons/ri/line-chart-line";
import ChartCard from "@/views/dashboard/components/chartCard/index.vue";
import dayjs from "dayjs";
import HChartCard from "@/views/dashboard/components/hchartCard/index.vue";
import { getCommonEnum, getMilvusDashboard } from "@/api/vdb";
import { onMounted, ref } from "vue";
import { message } from "@/utils/message";

const dataCards = ref([
  {
    title: "知识库集合总数",
    icon: RiDatabase2Line,
    value: "0",
    text: "+0 相比上月"
  },
  {
    title: "知识库数据总量",
    icon: RiFileTextLine,
    value: "0",
    text: "+0 相比上月"
  },
  {
    title: "用户数量",
    icon: RiUser3Line,
    value: "0",
    text: "+0 相比上月"
  },
  {
    title: "查询次数",
    icon: RiLineChartLine,
    value: "0",
    text: "+0 相比上月"
  }
]);

const echartCards = [
  {
    name: "recentActivity",
    title: "最近活动",
    text: "过去7天的系统活动",
    option: {
      tooltip: {
        trigger: "axis"
      },
      xAxis: {
        type: "category",
        // dayjs获取过去7天的日期数组
        data: [
          dayjs().add(-6, "d").startOf("day").format("YYYY-MM-DD"),
          dayjs().add(-5, "d").startOf("day").format("YYYY-MM-DD"),
          dayjs().add(-4, "d").startOf("day").format("YYYY-MM-DD"),
          dayjs().add(-3, "d").startOf("day").format("YYYY-MM-DD"),
          dayjs().add(-2, "d").startOf("day").format("YYYY-MM-DD"),
          dayjs().add(-1, "d").startOf("day").format("YYYY-MM-DD"),
          dayjs().startOf("day").format("YYYY-MM-DD")
        ],
        boundaryGap: false
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          data: [0, 0, 0, 0, 0, 0, 0],
          type: "line",
          smooth: true,
          color: "#2563EB"
        }
      ]
    },
    style: {
      width: "100%"
    }
  }
];

const hchartCard = ref([
  {
    name: "collectionUsage",
    title: "集合使用情况",
    text: "各集合的数据量分布",
    option: {
      credits: {
        enabled: false
      },
      chart: {
        type: "pie",
        options3d: {
          enabled: true,
          alpha: 45,
          beta: 0
        }
      },
      title: {
        text: ""
      },
      accessibility: {
        point: {
          valueSuffix: "%"
        }
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          depth: 35,
          dataLabels: {
            enabled: true,
            format: "{point.name}"
          }
        }
      },
      series: [
        {
          type: "pie",
          name: "占用",
          data: [
            // ["集合1", 10],
            // ["集合2", 10],
            // ["集合3", 10],
            // ["集合4", 10],
            // ["集合5", 10],
            // ["集合6", 10]
          ]
        }
      ]
    },
    style: {
      width: "100%"
    }
  }
]);

// 获取数据总览方法
const fetchMilvusDashboard = () => {
  getMilvusDashboard()
    .then((res: any) => {
      if (res.code === 200) {
        const usageList = res.data?.usageList || [];
        const validList = res.data?.validList || [];
        // 知识库数据总量
        dataCards.value[1].value =
          usageList.reduce((pre, cur) => pre + cur.cnt, 0) || 0;
        //集合使用情况
        hchartCard.value[0].option.series[0].data = usageList.map(item => [
          item.field,
          item.cnt
        ]);
      } else {
        message("获取数据总览失败", { type: "error" });
      }
    })
    .catch(() => {
      message("获取数据总览失败", { type: "error" });
    });
};
// 请求报告类型
const fetchReportTypeEnum = () => {
  getCommonEnum("reportType")
    .then((res: any) => {
      if (res?.code === 200) {
        dataCards.value[0].value = res.data?.length || 0;
      } else {
        message("请求报告类型失败", { type: "error" });
      }
    })
    .catch(() => {
      message("请求报告类型失败", { type: "error" });
    });
};

onMounted(() => {
  fetchMilvusDashboard();
  fetchReportTypeEnum();
});
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="text-[20px] font-bold">系统概览</div>
    <!-- 第一层数据卡片 -->
    <div class="mt-[20px]">
      <el-row :gutter="60">
        <el-col v-for="card in dataCards" :key="card.title" :xs="24" :span="6">
          <DataCard
            :title="card.title"
            :icon="card.icon"
            :value="card.value"
            :text="card.text"
            style="min-width: 300px"
          />
        </el-col>
      </el-row>
    </div>
    <!-- 第二层图表卡片 -->
    <div class="mt-[20px]">
      <el-row :gutter="60">
        <el-col :xs="24" :span="12">
          <ChartCard
            v-for="card in echartCards"
            :key="card.name"
            :name="card.name"
            :title="card.title"
            :text="card.text"
            :option="card.option"
            :style="card?.style"
          />
        </el-col>
        <el-col :xs="24" :span="12">
          <HChartCard
            v-for="card in hchartCard"
            :key="card.title"
            :name="card.title"
            :title="card.title"
            :text="card.text"
            :option="card.option"
            :style="card?.style"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>
