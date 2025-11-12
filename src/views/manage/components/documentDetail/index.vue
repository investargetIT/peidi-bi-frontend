<script setup lang="ts">
import Markdown from "@/views/manage/components/markdown/index.vue";
import { MARKDOWN_EXAMPLE } from "@/views/debug/markdown/data/markdown";
import { computed, reactive, ref, watch } from "vue";
import { message } from "@/utils/message";

// props
const props = defineProps({
  documentDetailData: {
    type: Object,
    required: true
  }
});

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

// 分页切换
const handlePageChange = (page: number) => {
  fileSelected.value = page - 1;
};
</script>

<template>
  <div>
    <div class="text-[18px] font-bold text-[#09090b]">文件详情</div>
    <div
      v-if="fileSelected === -1"
      class="text-[14px] text-[#71717a] font-bold"
    >
      未选中文件（点击数据列表，查看文件详情）
    </div>
    <div v-show="fileSelected > -1">
      <div class="text-[14px] text-[#71717a] font-bold">
        {{ fileData.title }}
      </div>
      <div v-show="false" class="flex items-center">
        <div class="text-[14px] text-[#71717a] font-bold mr-[10px]">页码:</div>
        <el-radio-group v-model="fileSelected" class="mt-[20px] mb-[20px]">
          <el-radio-button
            v-for="(item, index) in fileData.markdownList"
            :key="index"
            :label="index + 1"
            :value="index"
          />
        </el-radio-group>
      </div>
      <!--  TODO: 页码过多所以采用新组件 -->
      <div v-show="false" class="mt-[15px] mb-[15px]">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="fileData.markdownList.length"
          :default-page-size="1"
          @change="handlePageChange"
        />
      </div>
      <!-- <el-divider /> -->
      <!-- 更新后重新渲染节点 -->
      <Markdown :height="750" :data="currentMarkdown" />
    </div>
  </div>
</template>
