<script setup lang="ts">
import { computed, onMounted } from "vue";
import type { TopSubredditsItem } from "../index.vue";

// props
const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  list: {
    type: Array as PropType<TopSubredditsItem[]>,
    default: () => []
  },
  style: {
    type: Object,
    default: () => ({ width: "700px" })
  }
});
</script>

<template>
  <el-card shadow="never" :style="style">
    <div class="text-[16px] font-bold text-[#09090B]">{{ title }}</div>

    <!-- 排名列表 -->
    <div>
      <div
        v-for="(item, index) in list"
        :key="index"
        class="flex items-center justify-between mt-[36px]"
      >
        <div class="flex items-center">
          <div class="text-[24px] font-[700] text-[#71717A] mr-[36px]">
            {{ item.rank }}
          </div>
          <div>
            <div class="text-[16px] font-[700] text-[#09090B]">
              {{ item.name }}
            </div>
            <div class="text-[14px] text-[#71717A]">
              {{ item.members }} members
            </div>
          </div>
        </div>
        <div class="text-[18px] font-[700]">{{ item.posts }} posts</div>
      </div>
    </div>
  </el-card>
</template>
