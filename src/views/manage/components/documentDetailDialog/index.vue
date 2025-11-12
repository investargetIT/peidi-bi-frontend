<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import Markdown from "@/views/manage/components/markdown/index.vue";

// props
const props = defineProps({
  documentDetailData: {
    type: Object,
    required: true
  }
});

const dialogVisible = ref(false);
const showDocumentDetailDialog = () => {
  dialogVisible.value = true;
};
const closeDocumentDetailDialog = () => {
  dialogVisible.value = false;
};

//#region 源数据处理逻辑
// 当前选中文件页数
const fileSelected = ref(-1);
// 文件数据
const fileData = reactive({
  title: "",
  markdownList: []
});

watch(
  () => props.documentDetailData,
  (newVal, oldVal) => {
    if (newVal !== oldVal && newVal) {
      fileData.title = newVal.title;
      fileData.markdownList = newVal.markdownList || [];
      // 初始化选中第一个文件
      fileSelected.value = fileData.markdownList.length > 0 ? 0 : -1;
    }
    console.log("fileSelected", fileSelected.value);
  },
  { deep: true, immediate: true }
);

// text文本处理函数
const extractMarkdownCodeBlock = (reportString: string): string => {
  // 定义开始和结束的标识符
  const startMarker = "```markdown";
  const endMarker = "```";

  // 查找开始位置
  const startIndex = reportString.indexOf(startMarker);
  if (startIndex === -1) {
    // throw new Error("未找到markdown代码块开始标识符");
    // message("未找到markdown代码块开始标识符", { type: "warning" });
    // FIXME: message会导致页面渲染异常，所以这里使用console.log
    console.log("未找到markdown代码块开始标识符");
    return reportString;
  }

  // 计算内容开始位置（跳过开始标识符）
  const contentStartIndex = startIndex + startMarker.length;

  // 查找结束位置（从内容开始位置之后查找）
  const endIndex = reportString.indexOf(endMarker, contentStartIndex);
  if (endIndex === -1) {
    // throw new Error("未找到markdown代码块结束标识符");
    // message("未找到markdown代码块结束标识符", { type: "warning" });
    console.log("未找到markdown代码块结束标识符");
    return reportString;
  }

  // 截取并返回代码块内容（不包含开始和结束标识符）
  return reportString.substring(contentStartIndex, endIndex).trim();
};

// computed更新当前markdown文本
const currentMarkdown = computed(() => {
  if (fileSelected.value > -1 && fileData.markdownList.length > 0) {
    const index = Number(fileSelected.value);
    // console.log(
    //   "currentMarkdown",
    //   index,
    //   extractMarkdownCodeBlock(fileData.markdownList[index]?.text)
    // );
    return extractMarkdownCodeBlock(fileData.markdownList[index]?.text);
    // return fileData.markdownList[index]?.text;
  }
  return "";
});
//#endregion

// 暴露方法
defineExpose({
  showDocumentDetailDialog,
  closeDocumentDetailDialog
});
</script>

<template>
  <el-dialog v-model="dialogVisible" fullscreen append-to-body>
    <div class="text-[18px] font-bold text-[#09090b]">文件详情</div>
    <div class="text-[14px] text-[#71717a] font-bold mb-[10px]">
      {{ fileData.title }}
    </div>
    <Markdown :height="800" :data="currentMarkdown" />
  </el-dialog>
</template>
