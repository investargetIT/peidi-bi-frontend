<script setup lang="ts">
import { inject, ref, watch } from "vue";
import ChartCard from "@/components/PdChart/index.vue";

const props = defineProps({
  sentimentChart: {
    type: Array<{
      name: string;
      type: string;
      data: number[];
    }>,
    require: true
  },
  commentTrendsChart: {
    type: Array<any>,
    require: true
  },
  goodsWordCloud: {
    type: Array<{
      name: string;
      value: number;
    }>,
    require: true
  },
  compareGoodsWordCloud: {
    type: Array<{
      name: string;
      value: number;
    }>,
    require: true
  }
});

const isCompareMode = inject<any>("isCompareMode");

const emotionAnalysisCards = ref({
  name: "emotionAnalysisCards",
  title: "评论情感分析",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: [
          // "非常满意", "满意", "一般", "不满意", "非常不满意"
          "正面",
          "中性",
          "负面"
        ],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: "value"
      }
    ],
    series: [
      // {
      //   name: "本产品",
      //   type: "bar",
      //   data: [10, 52, 200, 334, 390, 330]
      // },
      // {
      //   name: "竞品",
      //   type: "bar",
      //   data: [10, 52, 200, 334, 390, 330]
      // }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  },
  shadow: "always"
});
watch(
  () => [props.sentimentChart, isCompareMode],
  newVal => {
    emotionAnalysisCards.value = {
      ...emotionAnalysisCards.value,
      option: {
        ...emotionAnalysisCards.value.option,
        series: newVal[1]?.value ? newVal[0] : [newVal[0][0]]
      }
    };
    // console.log("emotionAnalysisCards.value", emotionAnalysisCards.value);
  },
  {
    immediate: true,
    deep: true
  }
);

const commentTrendsCards = ref({
  name: "commentTrendsCards",
  title: "评论趋势",
  text: "",
  option: {
    legend: {},
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    xAxis: {
      type: "category",
      data: [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月"
      ]
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: "本产品",
        type: "line",
        stack: "Total",
        data: [
          // 120, 132, 101, 134, 90, 230, 210, 120, 132, 101, 134, 90
        ],
        smooth: true
      },
      {
        name: "竞品",
        type: "line",
        stack: "Total",
        data: [
          // 220, 182, 191, 234, 290, 330, 310, 220, 182, 191, 234, 290
        ],
        smooth: true
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  },
  shadow: "always"
});
// 监听props.commentTrendsChart和isCompareMode.value
watch(
  () => [props.commentTrendsChart, isCompareMode],
  newVal => {
    commentTrendsCards.value = {
      ...commentTrendsCards.value,
      option: {
        ...commentTrendsCards.value.option,
        series: newVal[1]?.value ? newVal[0] : [newVal[0][0]]
      }
    };
    // console.log("commentTrendsCards.value", commentTrendsCards.value);
    // console.log(
    //   "监听commentTrendsChart和isCompareMode.value",
    //   newVal,
    //   newVal[1]
    // );
  },
  {
    immediate: true,
    deep: true
  }
);

const productKeywordsWordCloudCards = ref({
  name: "productKeywordsWordCloudCards",
  title: "",
  text: "",
  option: {
    series: [
      {
        type: "wordCloud",
        //maskImage: maskImage,
        sizeRange: [12, 45], // 增大字体范围
        rotationRange: [0, 0], // 增加旋转角度范围
        rotationStep: 45, // 减小旋转步长
        gridSize: 52, // 减小网格大小，让排列更紧密
        shape: "pentagon",
        width: "100%",
        height: "100%",
        drawOutOfBound: false, // 不绘制超出边界的文字
        layoutAnimation: true, // 启用布局动画
        textStyle: {
          normal: {
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold" // 使用粗体
          },
          color: function (params) {
            // 根据单词的值进行颜色平滑过渡
            const value = params.data.value;
            const minValue = 15.8; // 最小值
            const maxValue = 48.3; // 最大值

            // 计算颜色过渡比例 (0-1)
            const ratio = (value - minValue) / (maxValue - minValue);

            // 定义颜色渐变范围：从蓝色到红色
            const startColor = { r: 54, g: 162, b: 235 }; // 蓝色
            const endColor = { r: 255, g: 99, b: 132 }; // 红色

            // 计算过渡颜色
            const r = Math.round(
              startColor.r + (endColor.r - startColor.r) * ratio
            );
            const g = Math.round(
              startColor.g + (endColor.g - startColor.g) * ratio
            );
            const b = Math.round(
              startColor.b + (endColor.b - startColor.b) * ratio
            );

            return `rgb(${r}, ${g}, ${b})`;
          },
          emphasis: {
            shadowBlur: 15,
            shadowColor: "#333",
            textShadowBlur: 10,
            textShadowColor: "#fff"
          }
        },
        data: [
          // { name: "treats", value: 48.3 },
          // { name: "quality", value: 46.5 },
          // { name: "chicken", value: 45.2 },
          // { name: "product", value: 44.7 },
          // { name: "premium", value: 42.1 },
          // { name: "taste", value: 41.8 },
          // { name: "flavor", value: 41.5 },
          // { name: "training", value: 40.3 },
          // { name: "high", value: 39.1 },
          // { name: "beef", value: 38.7 },
          // { name: "protein", value: 37.4 },
          // { name: "jerky", value: 35.6 },
          // { name: "honey", value: 34.8 },
          // { name: "bones", value: 33.7 },
          // { name: "peanut", value: 32.5 },
          // { name: "friend", value: 32.8 },
          // { name: "flavors", value: 31.2 },
          // { name: "rewarding", value: 30.6 },
          // { name: "bites", value: 29.8 },
          // { name: "butter", value: 28.9 },
          // { name: "furry", value: 28.4 },
          // { name: "salt", value: 27.5 },
          // { name: "sweet", value: 26.9 },
          // { name: "review", value: 26.1 },
          // { name: "strips", value: 25.4 },
          // { name: "potato", value: 24.6 },
          // { name: "providing", value: 24.3 },
          // { name: "flour", value: 23.4 },
          // { name: "breast", value: 22.1 },
          // { name: "smoke", value: 21.9 },
          // { name: "cinnamon", value: 20.7 },
          // { name: "oat", value: 19.6 },
          // { name: "pea", value: 18.3 },
          // { name: "goes", value: 17.5 },
          // { name: "here", value: 16.9 },
          // { name: "glycerin", value: 15.8 },
          // { name: "test", value: 22.7 },
          // { name: "feedback", value: 29.5 },
          // { name: "perfect", value: 36.2 }
        ]
      }
    ]
  },
  style: {
    width: "100%",
    // height: "500px", // 增加高度以容纳更大的间距
    borderRadius: "10px",
    backgroundColor: "#EFF6FF",
    border: 0
  }
});
const competingProductKeywordsWordCloudCards = ref({
  name: "competingProductKeywordsWordCloudCards",
  title: "",
  text: "",
  option: {
    series: [
      {
        type: "wordCloud",
        //maskImage: maskImage,
        sizeRange: [12, 45], // 增大字体范围
        rotationRange: [0, 0], // 增加旋转角度范围
        rotationStep: 45, // 减小旋转步长
        gridSize: 52, // 减小网格大小，让排列更紧密
        shape: "pentagon",
        width: "100%",
        height: "100%",
        drawOutOfBound: false, // 不绘制超出边界的文字
        layoutAnimation: true, // 启用布局动画
        textStyle: {
          normal: {
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold" // 使用粗体
          },
          color: function (params) {
            // 根据单词的值进行颜色平滑过渡
            const value = params.data.value;
            const minValue = 15.8; // 最小值
            const maxValue = 48.3; // 最大值

            // 计算颜色过渡比例 (0-1)
            const ratio = (value - minValue) / (maxValue - minValue);

            // 定义颜色渐变范围：从蓝色到红色
            const startColor = { r: 54, g: 162, b: 235 }; // 蓝色
            const endColor = { r: 255, g: 99, b: 132 }; // 红色

            // 计算过渡颜色
            const r = Math.round(
              startColor.r + (endColor.r - startColor.r) * ratio
            );
            const g = Math.round(
              startColor.g + (endColor.g - startColor.g) * ratio
            );
            const b = Math.round(
              startColor.b + (endColor.b - startColor.b) * ratio
            );

            return `rgb(${r}, ${g}, ${b})`;
          },
          emphasis: {
            shadowBlur: 15,
            shadowColor: "#333",
            textShadowBlur: 10,
            textShadowColor: "#fff"
          }
        },
        data: [
          // { name: "treats", value: 48.3 },
          // { name: "quality", value: 46.5 },
          // { name: "chicken", value: 45.2 },
          // { name: "product", value: 44.7 },
          // { name: "premium", value: 42.1 },
          // { name: "taste", value: 41.8 },
          // { name: "flavor", value: 41.5 },
          // { name: "training", value: 40.3 },
          // { name: "high", value: 39.1 },
          // { name: "beef", value: 38.7 },
          // { name: "protein", value: 37.4 },
          // { name: "jerky", value: 35.6 },
          // { name: "honey", value: 34.8 },
          // { name: "bones", value: 33.7 },
          // { name: "peanut", value: 32.5 },
          // { name: "friend", value: 32.8 },
          // { name: "flavors", value: 31.2 },
          // { name: "rewarding", value: 30.6 },
          // { name: "bites", value: 29.8 },
          // { name: "butter", value: 28.9 },
          // { name: "furry", value: 28.4 },
          // { name: "salt", value: 27.5 },
          // { name: "sweet", value: 26.9 },
          // { name: "review", value: 26.1 },
          // { name: "strips", value: 25.4 },
          // { name: "potato", value: 24.6 },
          // { name: "providing", value: 24.3 },
          // { name: "flour", value: 23.4 },
          // { name: "breast", value: 22.1 },
          // { name: "smoke", value: 21.9 },
          // { name: "cinnamon", value: 20.7 },
          // { name: "oat", value: 19.6 },
          // { name: "pea", value: 18.3 },
          // { name: "goes", value: 17.5 },
          // { name: "here", value: 16.9 },
          // { name: "glycerin", value: 15.8 },
          // { name: "test", value: 22.7 },
          // { name: "feedback", value: 29.5 },
          // { name: "perfect", value: 36.2 }
        ]
      }
    ]
  },
  style: {
    width: "100%",
    // height: "500px", // 增加高度以容纳更大的间距
    borderRadius: "10px",
    backgroundColor: "#FFF7ED",
    border: 0
  }
});

watch(
  () => props.goodsWordCloud,
  (newVal, oldVal) => {
    productKeywordsWordCloudCards.value = {
      ...productKeywordsWordCloudCards.value,
      option: {
        ...productKeywordsWordCloudCards.value.option,
        series: [
          {
            ...productKeywordsWordCloudCards.value.option.series[0],
            data: [...newVal]
          }
        ]
      }
    };
  },
  {
    immediate: true,
    deep: true
  }
);
watch(
  () => props.compareGoodsWordCloud,
  (newVal, oldVal) => {
    competingProductKeywordsWordCloudCards.value = {
      ...competingProductKeywordsWordCloudCards.value,
      option: {
        ...competingProductKeywordsWordCloudCards.value.option,
        series: [
          {
            ...competingProductKeywordsWordCloudCards.value.option.series[0],
            data: [...newVal]
          }
        ]
      }
    };
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<template>
  <div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
        <ChartCard
          class="mt-[20px]"
          :name="emotionAnalysisCards.name"
          :title="emotionAnalysisCards.title"
          :text="emotionAnalysisCards.text"
          :option="emotionAnalysisCards.option"
          :style="emotionAnalysisCards?.style"
          :shadow="emotionAnalysisCards?.shadow"
        />
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
        <ChartCard
          class="mt-[20px]"
          :name="commentTrendsCards.name"
          :title="commentTrendsCards.title"
          :text="commentTrendsCards.text"
          :option="commentTrendsCards.option"
          :style="commentTrendsCards?.style"
          :shadow="commentTrendsCards?.shadow"
        />
      </el-col>
    </el-row>
    <el-card style=" margin-top: 20px;border-radius: 10px">
      <div class="text-[16px] font-bold text-[#09090B]">高频词云</div>
      <el-row :gutter="10">
        <el-col
          :xs="24"
          :sm="24"
          :md="24"
          :lg="isCompareMode ? 12 : 24"
          :xl="isCompareMode ? 12 : 24"
        >
          <div class="text-[14px] text-[#555] mb-[5px] text-center mt-[20px]">
            本产品高频词
          </div>
          <ChartCard
            :name="productKeywordsWordCloudCards.name"
            :title="productKeywordsWordCloudCards.title"
            :text="productKeywordsWordCloudCards.text"
            :option="productKeywordsWordCloudCards.option"
            :style="productKeywordsWordCloudCards?.style"
          />
        </el-col>
        <el-col
          v-if="isCompareMode"
          :xs="24"
          :sm="24"
          :md="24"
          :lg="12"
          :xl="12"
        >
          <div class="text-[14px] text-[#555] mb-[5px] text-center mt-[20px]">
            竞品高频词
          </div>
          <ChartCard
            :name="competingProductKeywordsWordCloudCards.name"
            :title="competingProductKeywordsWordCloudCards.title"
            :text="competingProductKeywordsWordCloudCards.text"
            :option="competingProductKeywordsWordCloudCards.option"
            :style="competingProductKeywordsWordCloudCards?.style"
          />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
