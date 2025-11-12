<script setup lang="ts">
import { onMounted, ref } from "vue";
import { MARKDOWN_EXAMPLE } from "@/views/debug/markdown/data/markdown";
import markdownIt from "markdown-it";
import Vditor from "vditor";
import "vditor/dist/index.css";

//#region MarkdownIt 示例
const mdIt = markdownIt();
const md = mdIt.render(MARKDOWN_EXAMPLE);
//#endregion

//#region Vditor 示例
const vditor = ref();
function initVditor() {
  vditor.value = new Vditor("pridi-debug-vditor", {
    mode: "sv",
    height: 500,
    preview: {
      actions: []
    },
    toolbarConfig: {
      hide: true
    },
    after: () => {
      vditor.value.disabledCache(); // 禁用缓存，否则会导致预览时显示缓存内容
      vditor.value.setValue(MARKDOWN_EXAMPLE);
      const vditorsv: HTMLElement = document.querySelector(
        ".peidi-debug-markdown .vditor-sv"
      );
      vditorsv.style.display = "none";
    }
  });
}
//#endregion

onMounted(() => {
  initVditor();
});
</script>

<template>
  <div class="peidi-debug-markdown">
    <el-divider content-position="left">Vditor 示例 </el-divider>
    <div id="pridi-debug-vditor" />
    <el-divider content-position="left">MarkdownIt 示例 </el-divider>
    <p v-html="md" />
  </div>
</template>
