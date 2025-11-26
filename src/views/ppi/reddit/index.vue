<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import DataCard from "@/views/ppi/reddit/dataCard/index.vue";
import ChartCard from "@/components/PdChart/index.vue";
import RankingListCard from "@/views/ppi/reddit/rankingListCard/index.vue";
import DiscussionCard from "@/views/ppi/reddit/discussionCard/index.vue";
import { getAiIntelligenceQuestion, type RedditQuestionItem } from "@/api/ppi";
import _ from "lodash";

// 搜索内容
const searchTopic = ref("");
const showSearchTopic = ref("");

// 获取到的源数据
const redditQuestionItems = ref<RedditQuestionItem[]>([]);

const dataCards = ref([
  {
    title: "Total Discussions",
    value: "0",
    text: "Last 30 days"
  },
  {
    title: "Total Engagement",
    value: "0",
    text: "Upvotes + Comments"
  },
  {
    title: "Active Subreddits",
    value: "0",
    text: "Communities tracked"
  },
  {
    title: "Sentiment Score",
    value: "0%",
    text: "Positive sentiment"
  }
]);

// Discussion Sentiment Distribution
const discussionSentimentDistributionCards = ref({
  name: "discussionSentimentDistributionCards",
  title: "Discussion Sentiment Distribution",
  text: "",
  option: {
    tooltip: {
      trigger: "item"
    },
    legend: {
      top: "bottom",
      left: "center"
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        data: [
          { value: 0, name: "Positive", itemStyle: { color: "#4caf50" } },
          { value: 0, name: "Neutral", itemStyle: { color: "#9e9e9e" } },
          { value: 0, name: "Negative", itemStyle: { color: "#f44336" } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

// Monthly Discussion Trend
const monthlyDiscussionTrendCards = ref({
  name: "monthlyDiscussionTrendCards",
  title: "Monthly Discussion Trend",
  text: "",
  option: {
    tooltip: {
      trigger: "axis"
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed"
        }
      },
      // 12 months
      data: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]
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
        // 12 months discussion trend
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        type: "line",
        smooth: true
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px"
  }
});

// Trending Topics
const trendingTopicsCards = ref({
  name: "trendingTopicsCards",
  title: "Trending Topics",
  text: "",
  option: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    legend: {
      show: false,
      x: "center", //可设定图例在左、右、居中
      y: "bottom" //可设定图例在上、下、居中
    },
    grid: {
      left: 120
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
      data: [],
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
          if (value.length > 14) {
            return `${value.slice(0, 14)}...`;
          }
          return value;
        }
      }
    },
    series: [
      {
        type: "bar",
        data: [],
        itemStyle: {
          color: "#10B981"
        },
        barWidth: "80%"
      }
    ]
  },
  style: {
    width: "100%",
    height: "500px",
    borderRadius: "10px"
  }
});

export interface TopSubredditsItem {
  rank: number;
  name: string;
  members: string;
  posts: string;
}
// Top Subreddits by Activity
const topSubredditsList = ref<TopSubredditsItem[]>([
  // {
  //   rank: 1,
  //   name: "r/dogs",
  //   members: "3.5M",
  //   posts: "1245"
  // },
  // {
  //   rank: 2,
  //   name: "r/pets",
  //   members: "2.1M",
  //   posts: "892"
  // },
  // {
  //   rank: 3,
  //   name: "r/puppy101",
  //   members: "850K",
  //   posts: "567"
  // },
  // {
  //   rank: 4,
  //   name: "r/frugal",
  //   members: "2.8M",
  //   posts: "234"
  // },
  // {
  //   rank: 5,
  //   name: "r/DogCare",
  //   members: "450K",
  //   posts: "178"
  // }
]);

// 讨论数据
export interface DiscussionItem {
  title: string;
  type: string;
  description: string;
  info: {
    subreddit: string;
    author: string;
    date: string;
  };
  likes: number;
  comments: number;
  mentions: string[];
  keywords: string[];
}
const discussionList = ref<DiscussionItem[]>([
  // {
  //   title: "My dog went CRAZY for these new treats!",
  //   type: "positive",
  //   description:
  //     "Finally found treats that my picky eater loves! The peanut butter bones are amazing.",
  //   info: {
  //     subreddit: "r/dogs",
  //     author: "u/happy_dog_mom",
  //     date: "2024-02-01"
  //   },
  //   likes: 892,
  //   comments: 124,
  //   mentions: ["Peanut Butter Bones"],
  //   keywords: ["positive review", "picky eater", "peanut butter"]
  // },
  // {
  //   title: "Chicken treats comparison - Brand A vs Brand B",
  //   type: "positive",
  //   description:
  //     "Did a side-by-side comparison of ingredients and my dog's reaction. Here are my findings...",
  //   info: {
  //     subreddit: "r/dogs",
  //     author: "u/researcher_pet",
  //     date: "2024-02-18"
  //   },
  //   likes: 678,
  //   comments: 156,
  //   mentions: ["Brand A", "Brand B"],
  //   keywords: ["comparison", "ingredients", "analysis"]
  // },
  // {
  //   title: "Pet food recall - what brands are safe?",
  //   type: "neutral",
  //   description:
  //     "With all the recalls lately, which brands do you trust for pet treats?",
  //   info: {
  //     subreddit: "r/pets",
  //     author: "u/safety_first",
  //     date: "2024-02-10"
  //   },
  //   likes: 567,
  //   comments: 201,
  //   mentions: [],
  //   keywords: ["safety", "recalls", "trust"]
  // },
  // {
  //   title: "Best value dog treats on Amazon?",
  //   type: "neutral",
  //   description:
  //     "Looking for bulk deals on quality dog treats. What's your go-to?",
  //   info: {
  //     subreddit: "r/frugal",
  //     author: "u/smart_shopper",
  //     date: "2024-02-12"
  //   },
  //   likes: 445,
  //   comments: 93,
  //   mentions: ["Brand A", "Brand C"],
  //   keywords: ["value", "amazon", "bulk"]
  // },
  // {
  //   title: "Best dog treats for training? Need recommendations!",
  //   type: "neutral",
  //   description:
  //     "Looking for healthy, small-sized treats that my puppy loves. Tried a few brands but want more options.",
  //   info: {
  //     subreddit: "r/dogs",
  //     author: "u/dog_lover_2024",
  //     date: "2024-01-15"
  //   },
  //   likes: 342,
  //   comments: 87,
  //   mentions: ["Brand A", "Brand B"],
  //   keywords: ["training", "recommendations", "healthy"]
  // }
]);

//#region 请求逻辑
// 获取Reddit问题
const fetchRedditQuestion = (question: string) => {
  // 用then处理异步请求
  getAiIntelligenceQuestion({ question }).then((res: any) => {
    console.log("Reddit问题:", res.data);
    if (res.code === 200) {
      showSearchTopic.value = question;
      redditQuestionItems.value = res.data;

      if (redditQuestionItems.value.length === 0) {
        return;
      }

      const data = res.data;
      // 对数据进行处理
      // 先遍历一遍得到数据统计
      // 数据统计相关对象
      const sentimentCounts = {
        total: data.length, // 总讨论数
        positive: 0, // 正面讨论数
        neutral: 0, // 中性讨论数
        negative: 0, // 负面讨论数
        upvotes: 0, // 点赞数
        comments: 0 // 评论数
      };
      // 社区对象 键值对 键为社区名 值为帖子数组
      const subredditPosts: Record<string, RedditQuestionItem[]> = {};

      data.forEach(item => {
        // 情感统计
        if (item.sentiment === "positive") {
          sentimentCounts.positive++;
        } else if (item.sentiment === "neutral") {
          sentimentCounts.neutral++;
        } else if (item.sentiment === "negative") {
          sentimentCounts.negative++;
        }
        // 点赞数统计
        sentimentCounts.upvotes += item.ups;
        // 评论数统计
        sentimentCounts.comments += item.reviewCnt;
        // 社区统计
        if (!subredditPosts[item.subreddit]) {
          subredditPosts[item.subreddit] = [];
        }
        subredditPosts[item.subreddit].push(item);
      });
      console.log("数据统计:", sentimentCounts);
      console.log("社区统计:", subredditPosts);

      // 再遍历一遍 data数组 筛选出互动度(点赞数+评论数)前10的帖子
      const topPosts = data
        .sort(
          (a, b) =>
            (b.ups as number) +
            (b.reviewCnt as number) -
            (a.ups as number) -
            (a.reviewCnt as number)
        )
        .slice(0, 10);
      console.log("互动度前10的帖子:", topPosts);

      // 二次处理
      // subredditPosts选出值数组长度前5的对象
      const subredditPostsTop5 = Object.entries(subredditPosts)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5);
      console.log("互动度前5的社区:", subredditPostsTop5);

      // ################################################ 顶层卡片 ################################################
      dataCards.value = [
        {
          ...dataCards.value[0],
          value: sentimentCounts.total.toLocaleString()
        },
        {
          ...dataCards.value[1],
          value: (
            sentimentCounts.upvotes + sentimentCounts.comments
          ).toLocaleString()
        },
        {
          ...dataCards.value[2],
          value: Object.keys(subredditPosts).length.toLocaleString()
        },
        {
          ...dataCards.value[3],
          value:
            _.round(
              (sentimentCounts.positive / (sentimentCounts.total || 1)) * 100, // 这里用1是为了避免total为0时的除0错误
              2
            ) + "%"
        }
      ];
      // ################################################ Discussion Sentiment Distribution ################################################
      discussionSentimentDistributionCards.value.option.series[0].data = [
        {
          ...discussionSentimentDistributionCards.value.option.series[0]
            .data[0],
          value: sentimentCounts.positive
        },
        {
          ...discussionSentimentDistributionCards.value.option.series[0]
            .data[1],
          value: sentimentCounts.neutral
        },
        {
          ...discussionSentimentDistributionCards.value.option.series[0]
            .data[2],
          value: sentimentCounts.negative
        }
      ];
      // ################################################ Monthly Discussion Trend ################################################
      monthlyDiscussionTrendCards.value.option.series[0].data = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        sentimentCounts.total,
        0
      ];
      // ################################################ Trending Topics ################################################
      trendingTopicsCards.value = {
        ...trendingTopicsCards.value,
        option: {
          ...trendingTopicsCards.value.option,
          yAxis: {
            ...trendingTopicsCards.value.option.yAxis,
            data: topPosts.map(item => item.title).reverse()
          },
          series: [
            {
              ...trendingTopicsCards.value.option.series[0],
              data: topPosts
                .map(item => (item.ups as number) + (item.reviewCnt as number))
                .reverse()
            }
          ]
        }
      };
      // ################################################ Top Subreddits by Activity ################################################
      topSubredditsList.value = subredditPostsTop5.map((item, index) => ({
        rank: index + 1,
        name: "r/" + item[0].toLowerCase(),
        members: "-",
        posts: item[1].length.toLocaleString()
      }));
      // ################################################ 讨论数据 ################################################
      discussionList.value = topPosts.map((item, index) => ({
        title: item.title,
        type: item.sentiment,
        description: item.selfText,
        info: {
          subreddit: `r/${item.subreddit.toLowerCase()}`,
          author: "",
          date: ""
        },
        likes: item.ups,
        comments: item.reviewCnt,
        mentions: [],
        keywords: []
      }));
    }
  });
};
//#endregion

onMounted(() => {
  // fetchRedditQuestion("");
});

// 处理搜索
const handleSearch = () => {
  fetchRedditQuestion(searchTopic.value);
};

// 处理清除搜索
const handleClearSearch = () => {
  searchTopic.value = "";
};

// 计算属性 -是否显示内容
const isShowContent = computed(() => {
  return redditQuestionItems.value.length !== 0;
});
</script>

<template>
  <!-- 标题 -->
  <div class="text-[36px] font-bold text-[#0a0a0a] mb-[20px]">
    Reddit Market Insights
    <p class="text-[16px] text-[#71717a] font-[500]">
      Comprehensive analysis of pet food discussions across Reddit communities
    </p>
  </div>

  <!-- 搜索卡片 -->
  <el-card shadow="never" style="border-radius: 10px">
    <div class="text-[16px] font-bold text-[#0a0a0a] mb-[20px]">
      Search Topics
    </div>
    <div class="flex items-center">
      <el-input
        v-model="searchTopic"
        class="mr-[12px]"
        placeholder="Enter topic to research (e.g., grain-free, chicken flavor, Blue Buffalo, digestive issues...)"
      />
      <el-button color="#000" @click="handleSearch">Search</el-button>
      <el-button @click="handleClearSearch">Clear</el-button>
    </div>
    <div
      class="bg-[#EFF6FF] p-[10px] rounded-[10px] text-[14px] border border-[#bedbff] mt-[14px] text-[#0a0a0a]"
    >
      Showing results for:
      <span class="font-bold text-[#1447e6]">{{ showSearchTopic }}</span
      ><span class="ml-[8px] text-[#71717a]">
        ({{ redditQuestionItems.length }} discussions found)
      </span>
    </div>
  </el-card>

  <template v-if="isShowContent">
    <!-- 数据卡片 -->
    <div class="mt-[28px]">
      <el-row :gutter="60">
        <el-col v-for="card in dataCards" :key="card.title" :xs="24" :span="6">
          <DataCard
            :title="card.title"
            :value="card.value"
            :text="card.text"
            :style="{ minWidth: '300px', borderRadius: '10px' }"
          />
        </el-col>
      </el-row>
    </div>

    <!-- #region  图表和排行榜卡片 -->
    <div class="mt-[28px]">
      <el-row :gutter="60">
        <el-col :xs="24" :span="12">
          <ChartCard
            :name="discussionSentimentDistributionCards.name"
            :title="discussionSentimentDistributionCards.title"
            :text="discussionSentimentDistributionCards.text"
            :option="discussionSentimentDistributionCards.option"
            :style="discussionSentimentDistributionCards?.style"
          />
        </el-col>
        <el-col :xs="24" :span="12">
          <ChartCard
            :name="monthlyDiscussionTrendCards.name"
            :title="monthlyDiscussionTrendCards.title"
            :text="monthlyDiscussionTrendCards.text"
            :option="monthlyDiscussionTrendCards.option"
            :style="monthlyDiscussionTrendCards?.style"
          />
        </el-col>
      </el-row>
    </div>
    <div class="mt-[28px]">
      <el-row :gutter="60">
        <el-col :xs="24" :span="12">
          <RankingListCard
            :title="'Top Subreddits by Activity'"
            :list="topSubredditsList"
            :style="{ width: '100%', height: '500px', borderRadius: '10px' }"
          />
        </el-col>
        <el-col :xs="24" :span="12">
          <ChartCard
            :name="trendingTopicsCards.name"
            :title="trendingTopicsCards.title"
            :text="trendingTopicsCards.text"
            :option="trendingTopicsCards.option"
            :style="trendingTopicsCards?.style"
          />
        </el-col>
      </el-row>
      <!-- #endregion -->

      <!-- 讨论卡片 -->
      <div class="mt-[28px]">
        <DiscussionCard :list="discussionList" />
      </div>
    </div>
  </template>
</template>
