<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { MARKDOWN_EXAMPLE } from "@/views/debug/markdown/data/markdown";
import Vditor from "vditor";
import "vditor/dist/index.css";

// props
const props = defineProps({
  height: {
    type: Number,
    default: 750
  },
  data: {
    type: String,
    required: true
  }
});

// loading状态
const loading = ref(false);

const vditor = ref();
function initVditor() {
  // #pridi-manage-markdown-vditor 不存在时，不初始化
  // if (!document.getElementById("pridi-manage-markdown-vditor")) {
  //   return;
  // }

  loading.value = true;
  vditor.value = new Vditor("pridi-manage-markdown-vditor", {
    mode: "sv",
    height: props.height,
    preview: {
      actions: []
    },
    toolbarConfig: {
      hide: true
    },
    after: () => {
      vditor.value.disabledCache(); // 禁用缓存，否则会导致预览时显示缓存内容
      vditor.value.setValue(props.data);
      const vditorsv: HTMLElement = document.querySelector(
        ".peidi-manage-markdown .vditor-sv"
      );
      vditorsv.style.display = "none";
      const vditorPreview: HTMLElement = document.querySelector(
        ".peidi-manage-markdown .vditor-toolbar"
      );
      vditorPreview.style.display = "none";
      loading.value = false;
    }
  });
}
// 集成到watch中
// onMounted(() => {
//   initVditor();
// });

onBeforeUnmount(() => {
  if (vditor.value) {
    vditor.value.destroy();
  }
});

watch(
  () => props.data,
  (newVal, oldVal) => {
    if (newVal !== oldVal && newVal) {
      // 等待dom更新完成后初始化vditor，否则会导致获取不到dom元素
      nextTick(() => {
        initVditor();
      });
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div
    v-loading="loading"
    element-loading-text="首次加载比较慢，请稍后"
    class="peidi-manage-markdown"
    :style="{ height: height + 'px' }"
  >
    <div v-show="!loading" id="pridi-manage-markdown-vditor" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.vditor-reset) {
  max-width: 100% !important; // 这里important是为了覆盖vditor的样式
}
</style>
