<script setup lang="ts">
import { Close } from "@element-plus/icons-vue";
import { nextTick, ref } from "vue";
import CardList from "./cardList.vue";

const drawer = ref(false);
const cardListRef = ref(null);
let pendingHref: string | null = null;

const handleDrawerOpen = () => {
  if (pendingHref) {
    nextTick(() => {
      cardListRef.value?.updateAnchorPosition(pendingHref);
      pendingHref = null;
    });
  }
};
const openDrawer = (href?: string) => {
  if (href) {
    // console.log("href:", href);
    pendingHref = href;
  }
  drawer.value = true;
};

defineExpose({ openDrawer });
</script>

<template>
  <div>
    <el-drawer
      v-model="drawer"
      size="100%"
      :with-header="false"
      :style="{ background: '#F0F2F5' }"
      @opened="handleDrawerOpen"
    >
      <div>
        <div class="flex justify-between items-center">
          <div class="text-base font-medium text-[var(--dash-text-primary)]">
            目标达成详情
          </div>
          <el-button
            class="w-5 h-5"
            type="default"
            :icon="Close"
            text
            @click="drawer = false"
          />
        </div>

        <div class="mt-4">
          <CardList ref="cardListRef" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.el-drawer__header) {
  margin-bottom: 10px;
}
</style>
