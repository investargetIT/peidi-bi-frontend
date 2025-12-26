<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  iconHTML: {
    type: String,
    required: true
  },
  changeContent: {
    type: String,
    required: true
  },
  changeIconHTML: {
    type: String,
    required: true
  },
  changeStatus: {
    type: String as PropType<"positive" | "negative">,
    required: true
  },
  competitorName: {
    type: String,
    required: true
  },
  competitorContent: {
    type: String,
    required: true
  },
  competitorChangeContent: {
    type: String,
    required: true
  },
  competitorChangeIconHTML: {
    type: String,
    required: true
  },
  competitorChangeStatus: {
    type: String as PropType<"positive" | "negative">,
    required: true
  }
});
</script>

<template>
  <div class="peidi-taobao-reviewAnalytics-numCard-container">
    <el-card style="border-radius: 10px" class="py-[24px]">
      <div class="flex items-start justify-between">
        <div class="space-y-2 flex-1">
          <div class="text-sm text-muted-foreground">{{ title }}</div>
          <div class="text-3xl font-semibold text-foreground mt-[8px]">
            {{ content }}
          </div>
          <div
            class="text-sm flex items-center gap-1 text-accent mt-[8px]"
            :class="
              changeStatus === 'positive' ? 'peidi-good-num' : 'peidi-bad-num'
            "
          >
            <div class="peidi-svg" v-html="changeIconHTML" />
            {{ changeContent }}
          </div>
          <div class="pt-2 border-t border-border">
            <div class="flex items-center gap-2">
              <div
                class="flex items-center gap-1 text-sm font-medium"
                :class="
                  changeStatus === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                <div class="peidi-svg" v-html="competitorChangeIconHTML" />
                {{ competitorChangeContent }}
              </div>
              <span class="text-xs text-muted-foreground text-[#555]"
                >vs {{ competitorName }}</span
              >
            </div>
            <div class="text-xs text-muted-foreground mt-1 text-[#555]">
              竞品: {{ competitorContent }}
            </div>
          </div>
        </div>
        <div
          class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
        >
          <div class="text-primary" v-html="iconHTML" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.peidi-taobao-reviewAnalytics-numCard-container {
  border: 1px solid transparent;
  border-radius: 10px;

  &:hover {
    border-color: #7fb5fc;
  }

  .peidi-good-num {
    color: oklch(60% 0.2 180deg);
  }

  .peidi-bad-num {
    color: oklch(55.% 0.25 30deg);
  }

  .peidi-svg :deep(svg) {
    width: 16px;
    height: 16px;
  }
}
</style>
