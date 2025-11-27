<script setup lang="ts">
import ChartCard from "@/components/PdChart/index.vue";
import { onActivated, onMounted, ref } from "vue";
import {
  getAiIntelligenceProductPage,
  getAiIntelligenceProductWordCload
} from "@/api/ppi";
import SolarRefreshBold from "~icons/solar/refresh-bold";
import { COMMENT_RATING_RATIO } from "@/views/ppi/config";
import { message } from "@/utils/message";

// Top 10 Products by Estimated Sales
const top10ProductsCards = ref({
  name: "top10ProductsCards",
  title: "Top 10 Products by Estimated Sales",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    legend: {
      x: "center", //可设定图例在左、右、居中
      y: "bottom" //可设定图例在上、下、居中
    },
    xAxis: {
      type: "value",
      boundaryGap: [0, 0.01],
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed"
        }
      }
    },
    yAxis: {
      type: "category",
      data: [
        // 模拟十个产品
        // "Peanut ButterBones",
        // "Premium ChickenBites",
        // "Beef Jerky Strips",
        // "Salmon Flavor Treats",
        // "Duck & Sweet Potato",
        // "Grain-Free Kibble",
        // "Organic Cat Food",
        // "Small Breed Formula",
        // "Senior Dog Formula",
        // "Puppy Training Treats"
      ],
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed"
        }
      },
      axisLabel: {
        show: true,
        fontSize: 10,
        width: 65,
        formatter: function (value) {
          if (value.length > 24) {
            return `${value.slice(0, 24)}...`;
          }
          return value;
        }
      }
    },
    series: [
      {
        name: "Estimated Sales",
        type: "bar",
        data: [
          // 18203, 23489, 29034, 104970, 131744, 630230, 89000, 45000, 32000,
          // 28000
        ],
        itemStyle: {
          color: "#10B981"
        },
        barWidth: "80%"
      }
    ]
  },
  style: {
    width: "100%",
    height: "700px",
    borderRadius: "10px"
  }
});

// Price Range Distribution
const priceRangeDistributionCards = ref({
  name: "priceRangeDistributionCards",
  title: "Price Range Distribution",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    legend: {
      x: "center", //可设定图例在左、右、居中
      y: "bottom" //可设定图例在上、下、居中
    },
    xAxis: {
      type: "category",
      data: ["$0-$10", "$10-$20", "$20-$50", "$50+"],
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed"
        }
      }
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed"
        }
      }
    },
    series: [
      {
        name: "Number of Products",
        type: "bar",
        data: [100, 200, 300, 400],
        itemStyle: {
          color: "#F59E0B"
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

// Product Keywords Word Cloud
const cloudLoading = ref(false);
const productKeywordsWordCloudCards = ref({
  name: "productKeywordsWordCloudCards",
  title: "Product Keywords Word Cloud",
  text: "",
  option: {
    series: [
      {
        type: "wordCloud",
        //maskImage: maskImage,
        sizeRange: [12, 60], // 增大字体范围
        rotationRange: [0, 0], // 增加旋转角度范围
        rotationStep: 45, // 减小旋转步长
        gridSize: 26, // 减小网格大小，让排列更紧密
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
    height: "500px", // 增加高度以容纳更大的间距
    borderRadius: "10px"
  }
});

//#region 请求逻辑
// 分页获取产品信息 reviewCnt Top10
const fetchProductPageReviewCntTop10 = () => {
  getAiIntelligenceProductPage({
    pageNo: 1,
    pageSize: 10,
    sortStr: JSON.stringify([
      {
        sortName: "reviewCnt",
        sortType: "desc"
      }
    ])
  })
    .then((res: any) => {
      // console.log("获取产品列表Top10成功", res);
      if (res?.code === 200 && res.data) {
        // 解析出产品名称和评论数量 分成两个数组 一个是名称数组 一个是评论数量数组
        const productNames =
          res.data?.records?.map((item: any) => item.title) || [];
        const sales =
          res.data?.records?.map(
            (item: any) => item.reviewCnt * COMMENT_RATING_RATIO
          ) || [];

        top10ProductsCards.value = {
          ...top10ProductsCards.value,
          option: {
            ...top10ProductsCards.value.option,
            yAxis: {
              ...top10ProductsCards.value.option.yAxis,
              data: productNames.reverse()
            },
            series: [
              {
                ...top10ProductsCards.value.option.series[0],
                data: sales.reverse()
              }
            ]
          }
        };
      } else {
        message("获取产品列表Top10失败", { type: "error" });
      }
    })
    .catch(() => {
      message("获取产品列表Top10失败", { type: "error" });
    });
};
// 请求四类价格区间的产品数量 需要用到Promise.all
const fetchProductPriceRangeCnt = () => {
  Promise.all([
    getAiIntelligenceProductPage({
      pageNo: 1,
      pageSize: 1,
      searchStr: JSON.stringify([
        {
          searchName: "amount",
          searchType: "betweenStr",
          searchValue: [0, 10]
        }
      ])
    }),
    getAiIntelligenceProductPage({
      pageNo: 1,
      pageSize: 1,
      searchStr: JSON.stringify([
        {
          searchName: "amount",
          searchType: "betweenStr",
          searchValue: [10, 20]
        }
      ])
    }),
    getAiIntelligenceProductPage({
      pageNo: 1,
      pageSize: 1,
      searchStr: JSON.stringify([
        {
          searchName: "amount",
          searchType: "betweenStr",
          searchValue: [20, 50]
        }
      ])
    }),
    getAiIntelligenceProductPage({
      pageNo: 1,
      pageSize: 1,
      searchStr: JSON.stringify([
        {
          searchName: "amount",
          searchType: "betweenStr",
          searchValue: [50, Number.MAX_SAFE_INTEGER]
        }
      ])
    })
  ])
    .then((res: any[]) => {
      // console.log("价格区间的产品数量", res);
      if (res?.length === 4) {
        // 提取数组res[x].data?.total
        const temp = res.map((item: any) => item.data?.total || 0);
        // console.log("价格区间的产品数量", temp);
        priceRangeDistributionCards.value.option.series[0].data = temp;
      } else {
        message("获取价格区间的产品数量失败", { type: "error" });
      }
    })
    .catch(() => {
      message("获取价格区间的产品数量失败", { type: "error" });
    });
};

// 获取产品词云
const fetchProductKeywordsWordCloud = (refresh: boolean = false) => {
  cloudLoading.value = true;
  getAiIntelligenceProductWordCload({ refresh })
    .then((res: any) => {
      // console.log("产品词云", res, JSON.parse(res.data));
      if (res?.code === 200 && res.data) {
        const productKeywords = JSON.parse(res.data);
        // 修改 {word: 'Dog', frequency: 27} 为 {name: 'Dog', value: 27}
        // 推荐：替换整个对象 用于触发响应式更新
        // productKeywordsWordCloudCards.value = {
        //   ...productKeywordsWordCloudCards.value,
        //   option: {
        //     series: [
        //       {
        //         ...productKeywordsWordCloudCards.value.option.series[0],
        //         data: productKeywords.map((item: any) => ({
        //           name: item.word,
        //           value: item.frequency
        //         }))
        //       }
        //     ]
        //   }
        // };
        productKeywordsWordCloudCards.value.option.series[0].data =
          productKeywords.map((item: any) => ({
            name: item.word,
            value: item.frequency
          }));
        // console.log(
        //   "产品词云",
        //   productKeywordsWordCloudCards.value.option.series[0].data
        // );
      } else {
        message("获取产品词云失败", { type: "error" });
      }
    })
    .catch(() => {
      message("获取产品词云失败", { type: "error" });
    })
    .finally(() => {
      cloudLoading.value = false;
    });
};
//#endregion

// 页面初始化/更新/激活 方法 （组件挂载时调用）
const initComponent = () => {
  fetchProductPageReviewCntTop10();
  fetchProductPriceRangeCnt();
  fetchProductKeywordsWordCloud();
};

onMounted(() => {
  initComponent();
});

// 暴露方法
defineExpose({
  initComponent
});
</script>

<template>
  <!-- 标题 -->
  <div class="text-[36px] font-bold text-[#0a0a0a] mb-[20px]">
    Global Pet Food Intelligence
  </div>
  <div>
    <ChartCard
      :name="top10ProductsCards.name"
      :title="top10ProductsCards.title"
      :text="top10ProductsCards.text"
      :option="top10ProductsCards.option"
      :style="top10ProductsCards?.style"
    />
  </div>
  <div class="mt-[20px]">
    <ChartCard
      :name="priceRangeDistributionCards.name"
      :title="priceRangeDistributionCards.title"
      :text="priceRangeDistributionCards.text"
      :option="priceRangeDistributionCards.option"
      :style="priceRangeDistributionCards?.style"
    />
  </div>
  <div class="mt-[20px]">
    <ChartCard
      :name="productKeywordsWordCloudCards.name"
      :title="productKeywordsWordCloudCards.title"
      :text="productKeywordsWordCloudCards.text"
      :option="productKeywordsWordCloudCards.option"
      :style="productKeywordsWordCloudCards?.style"
    >
      <template #custom-content>
        <el-button
          :icon="SolarRefreshBold"
          color="#000"
          :loading="cloudLoading"
          @click="fetchProductKeywordsWordCloud(true)"
          >统计最新词云</el-button
        >
      </template>
    </ChartCard>
  </div>
</template>
