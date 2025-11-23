<script setup lang="ts">
import { ref } from "vue";
import DataCard from "@/views/ppi/reddit/dataCard/index.vue";
import ChartCard from "@/components/PdChart/index.vue";
import RankingListCard from "@/views/ppi/reddit/rankingListCard/index.vue";
import DiscussionCard from "@/views/ppi/reddit/discussionCard/index.vue";

// 搜索内容
const searchTopic = ref("");

const dataCards = ref([
  {
    title: "Total Discussions",
    value: "8",
    text: "Last 30 days"
  },
  {
    title: "Total Engagement",
    value: "4,242",
    text: "Upvotes + Comments"
  },
  {
    title: "Active Subreddits",
    value: "5",
    text: "Communities tracked"
  },
  {
    title: "Sentiment Score",
    value: "25%",
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
          { value: 2, name: "Positive", itemStyle: { color: "#4caf50" } },
          { value: 4, name: "Neutral", itemStyle: { color: "#9e9e9e" } },
          { value: 2, name: "Negative", itemStyle: { color: "#f44336" } }
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
    xAxis: {
      type: "category",
      boundaryGap: false,
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
      type: "value"
    },
    series: [
      {
        // 12 months discussion trend
        data: [
          820, 932, 901, 934, 1290, 1330, 1320, 1200, 1100, 1000, 900, 800
        ],
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
      data: [
        "Puppy Treats",
        "Recalls & Safety",
        "Grain-Free",
        "PriceComparison",
        "HealthyIngredients",
        "Training Treats"
      ],
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed"
        }
      }
    },
    series: [
      {
        name: "Estimated Sales",
        type: "bar",
        data: [18203, 23489, 29034, 104970, 131744, 630230].sort(
          (a, b) => a - b
        ),
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
const topSubredditsList: TopSubredditsItem[] = [
  {
    rank: 1,
    name: "r/dogs",
    members: "3.5M",
    posts: "1245"
  },
  {
    rank: 2,
    name: "r/pets",
    members: "2.1M",
    posts: "892"
  },
  {
    rank: 3,
    name: "r/puppy101",
    members: "850K",
    posts: "567"
  },
  {
    rank: 4,
    name: "r/frugal",
    members: "2.8M",
    posts: "234"
  },
  {
    rank: 5,
    name: "r/DogCare",
    members: "450K",
    posts: "178"
  }
];

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
  {
    title: "My dog went CRAZY for these new treats!",
    type: "positive",
    description:
      "Finally found treats that my picky eater loves! The peanut butter bones are amazing.",
    info: {
      subreddit: "r/dogs",
      author: "u/happy_dog_mom",
      date: "2024-02-01"
    },
    likes: 892,
    comments: 124,
    mentions: ["Peanut Butter Bones"],
    keywords: ["positive review", "picky eater", "peanut butter"]
  },
  {
    title: "Chicken treats comparison - Brand A vs Brand B",
    type: "positive",
    description:
      "Did a side-by-side comparison of ingredients and my dog's reaction. Here are my findings...",
    info: {
      subreddit: "r/dogs",
      author: "u/researcher_pet",
      date: "2024-02-18"
    },
    likes: 678,
    comments: 156,
    mentions: ["Brand A", "Brand B"],
    keywords: ["comparison", "ingredients", "analysis"]
  },
  {
    title: "Pet food recall - what brands are safe?",
    type: "neutral",
    description:
      "With all the recalls lately, which brands do you trust for pet treats?",
    info: {
      subreddit: "r/pets",
      author: "u/safety_first",
      date: "2024-02-10"
    },
    likes: 567,
    comments: 201,
    mentions: [],
    keywords: ["safety", "recalls", "trust"]
  },
  {
    title: "Best value dog treats on Amazon?",
    type: "neutral",
    description:
      "Looking for bulk deals on quality dog treats. What's your go-to?",
    info: {
      subreddit: "r/frugal",
      author: "u/smart_shopper",
      date: "2024-02-12"
    },
    likes: 445,
    comments: 93,
    mentions: ["Brand A", "Brand C"],
    keywords: ["value", "amazon", "bulk"]
  },
  {
    title: "Best dog treats for training? Need recommendations!",
    type: "neutral",
    description:
      "Looking for healthy, small-sized treats that my puppy loves. Tried a few brands but want more options.",
    info: {
      subreddit: "r/dogs",
      author: "u/dog_lover_2024",
      date: "2024-01-15"
    },
    likes: 342,
    comments: 87,
    mentions: ["Brand A", "Brand B"],
    keywords: ["training", "recommendations", "healthy"]
  }
]);
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
      <el-button color="#000">Search</el-button>
      <el-button>Clear</el-button>
    </div>
    <div
      class="bg-[#EFF6FF] p-[10px] rounded-[10px] text-[14px] border border-[#bedbff] mt-[14px] text-[#0a0a0a]"
    >
      Showing results for:
      <span class="font-bold text-[#1447e6]">{{ searchTopic }}</span
      ><span class="ml-[8px] text-[#71717a]">(0 discussions found)</span>
    </div>
  </el-card>

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
