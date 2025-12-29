<script setup lang="ts">
import { getBiRfmArea, type GetBiRfmParams } from "@/api/rfm";
import { message } from "@/utils/message";
import dayjs from "dayjs";
import { FormInstance, FormRules } from "element-plus";
import { onMounted, reactive, ref } from "vue";

// props
const props = defineProps({
  submit: {
    type: Function,
    default: () => {}
  },
  loading: {
    type: Boolean,
    default: false
  },
  reset: {
    type: Function,
    default: () => {}
  }
});

/**
 * RFM模型搜索参数类型定义
 * RFM (Recency, Frequency, Monetary) 客户价值分析模型
 */
interface RFMSearchForm {
  /** 城市等级 1、2、其他 */
  level?: string[];
  /** 二级城市名称 级联 */
  areaLevel2?: string[];
  // /** 开始时间 - 查询时间范围的开始时间点 */
  // startTime?: string;
  // /** 结束时间 - 查询时间范围的结束时间点 */
  // endTime?: string;
  /** 时间范围 - 查询时间范围的时间范围 */
  timeRange?: string[];
  /** 渠道类型 */
  channel?: string[];
  /** 最近消费时间 */
  lastOrderTime?: string;
  /** 累计消费金额 */
  totalAmount?: string;
  /** 消费频率 */
  totalOrders?: string;
}

const formRef = ref<FormInstance>(null);
// 多选英文逗号分隔
const form = reactive<RFMSearchForm>({
  level: [],
  areaLevel2: [],
  // 默认两年内
  timeRange: [
    dayjs().subtract(2, "year").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD")
  ],
  channel: [],
  lastOrderTime: dayjs("2025/1/1").format("YYYY-MM-DD"),
  totalAmount: "500",
  totalOrders: "4"
});
const rules = reactive<FormRules<RFMSearchForm>>({
  lastOrderTime: [
    { required: true, message: "请选择最近消费时间", trigger: "blur" }
  ],
  totalAmount: [
    { required: true, message: "请输入累计消费金额", trigger: "blur" }
  ],
  totalOrders: [{ required: true, message: "请输入消费频率", trigger: "blur" }]
});

const areaLoading = ref<boolean>(false);
const areaLevel2TreeSleectRef = ref<any>(null);
// 因为存在上海市-上海市这种情况 我需要给一级城市添加一个标识 防止通过二级城市选中一级城市
const AREA_LEVEL_1_FLAG = "areaLevel1";
const areaLevel2AllData = ref<any>({});
const areaLevel2Data = ref([
  // {
  //   label: "一线",
  //   value: "1",
  //   children: [
  //     {
  //       label: "浙江",
  //       value: "浙江",
  //       children: [
  //         {
  //           label: "杭州",
  //           value: "杭州"
  //         }
  //       ]
  //     }
  //   ]
  // }
]);

const timeRangeRef = ref<any>(null);
const timeRangeShortcuts = [
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  }
];

//#region 请求方法集合
// 获取rfm模型城市级联
const fetchAreaLevel2 = () => {
  areaLoading.value = true;
  getBiRfmArea()
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("rfm模型城市级联", res.data);

        // // 数据分类一次
        // const temp = {
        //   "1": [],
        //   "2": [],
        //   "3": [],
        //   其他: []
        // };
        // res.data.forEach((item: any) => {
        //   // temp[item.level] 数组里是否有value为item.areaLevel1的对象 有的话则加入到当前对象的children数组里 没有则创建
        //   const index = temp[item.level].findIndex(
        //     (obj: any) =>
        //       AREA_LEVEL_1_FLAG + obj.value ===
        //       AREA_LEVEL_1_FLAG + item.areaLevel1
        //   );
        //   if (index !== -1) {
        //     temp[item.level][index].children.push({
        //       label: item.areaLevel2,
        //       value: item.areaLevel2
        //     });
        //   } else {
        //     temp[item.level].push({
        //       label: item.areaLevel1,
        //       value: AREA_LEVEL_1_FLAG + item.areaLevel1,
        //       children: [
        //         {
        //           label: item.areaLevel2,
        //           value: item.areaLevel2
        //         }
        //       ]
        //     });
        //   }
        // });

        // 数据分类一次
        const temp = [
          {
            label: "一线",
            value: "1",
            children: []
          },
          {
            label: "二线",
            value: "2",
            children: []
          },
          {
            label: "三线",
            value: "3",
            children: []
          },
          {
            label: "其他",
            value: "其他",
            children: []
          }
        ];
        res.data.forEach((item: any) => {
          // 在temp中找到value为item.level的对象 加入到当前对象的children数组里
          const index = temp.findIndex((obj: any) => obj.value === item.level);
          if (index !== -1) {
            // 在temp[index].children里找是否存在value为item.areaLevel1的对象 有的话则加入到当前对象的children数组里 没有则创建
            const index2 = temp[index].children.findIndex(
              (obj: any) => obj.value === AREA_LEVEL_1_FLAG + item.areaLevel1
            );
            if (index2 !== -1) {
              temp[index].children[index2].children.push({
                label: item.areaLevel2,
                value: item.areaLevel2
              });
            } else {
              temp[index].children.push({
                label: item.areaLevel1,
                value: AREA_LEVEL_1_FLAG + item.areaLevel1,
                children: [
                  {
                    label: item.areaLevel2,
                    value: item.areaLevel2
                  }
                ]
              });
            }
          }
        });

        console.log("fetchAreaLevel2", temp);
        // areaLevel2AllData.value = temp;
        areaLevel2Data.value = temp;
      } else {
        message(res.msg || "获取rfm模型城市级联失败", { type: "error" });
      }
    })
    .catch(err => {
      message(err.message || "获取rfm模型城市级联失败", { type: "error" });
    })
    .finally(() => {
      areaLoading.value = false;
    });
};
//#endregion

//#region 处理城市等级变化
const handleLevelChange = (val: string[]) => {
  // 清空二级城市选择器
  form.areaLevel2 = [];
  // console.log("城市等级变化", val);
  // console.log("areaLevel2AllData", areaLevel2AllData.value);
  // console.log("areaLevel2Data", areaLevel2Data.value);
  // 合并所有选中的城市等级的二级城市数据
  const temp = [];
  val.forEach(item => {
    areaLevel2AllData.value[item].forEach((obj: any) => {
      // 如果temp中已经有obj.value 则加入到当前对象的children数组里 没有则创建
      const index = temp.findIndex((item2: any) => item2.value === obj.value);
      if (index !== -1) {
        temp[index].children.push(...obj.children);
      } else {
        temp.push({
          ...obj,
          children: [...obj.children]
        });
      }
    });
  });
  areaLevel2Data.value = temp;
};
//#endregion

onMounted(() => {
  fetchAreaLevel2();
});

// 重置表单
const handleReset = () => {
  // console.log("form", form);

  formRef.value?.resetFields();
  // 调用重置数据方法
  props.reset();
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  console.log("form:", form);
  // return;
  // 检验表单
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 整理参数
      const params: GetBiRfmParams = {
        lastOrderTime: dayjs(form.lastOrderTime).format("YYYY-MM-DD"),
        totalAmount: form.totalAmount,
        totalOrders: form.totalOrders
      };
      if (form.level && form.level.length > 0) {
        params.level = form.level.join(",");
      }
      if (form.areaLevel2 && form.areaLevel2.length > 0) {
        // 先按拼音排个序，方便缓存
        params.areaLevel2 = [...form.areaLevel2]
          .sort((a: string, b: string) => {
            return a.localeCompare(b);
          })
          .join(",");
      }
      if (form.channel && form.channel.length > 0) {
        params.channel = [...form.channel]
          .sort((a: string, b: string) => {
            return a.localeCompare(b);
          })
          .join(",");
      }
      if (form.timeRange && form.timeRange.length > 0) {
        params.startTime = dayjs(form.timeRange[0]).format("YYYY-MM-DD");
        params.endTime = dayjs(form.timeRange[1]).format("YYYY-MM-DD 23:59:59");
      }

      props.submit(params);
    } else {
      console.log("error submit!", fields);
    }
  });
};
</script>

<template>
  <div class="peidi-rfm-search-bar">
    <el-form
      ref="formRef"
      :model="form"
      :inline="true"
      label-width="130px"
      :rules="rules"
    >
      <!-- RFM -->
      <div class="text-[16px] font-bold text-[#0a0a0a]">RFM</div>
      <el-form-item label="R-最近消费时间" prop="lastOrderTime">
        <el-date-picker
          v-model="form.lastOrderTime"
          type="date"
          placeholder="请选择"
        />
      </el-form-item>
      <el-form-item label="F-消费频率" prop="totalOrders">
        <el-input v-model="form.totalOrders" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="M-累计消费金额" prop="totalAmount">
        <el-input v-model="form.totalAmount" placeholder="请输入" clearable />
      </el-form-item>
      <!-- 搜索条件 -->
      <div class="text-[16px] font-bold text-[#0a0a0a] mt-[20px]">搜索条件</div>
      <el-form-item label="日期区间" prop="timeRange">
        <el-date-picker
          ref="timeRangeRef"
          v-model="form.timeRange"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="timeRangeShortcuts"
        />
      </el-form-item>
      <el-form-item label="渠道" prop="channel">
        <el-select
          v-model="form.channel"
          placeholder="请选择"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
        >
          <el-option label="抖音" value="抖音" />
          <el-option label="淘宝" value="淘宝" />
          <el-option label="京东" value="京东" />
          <el-option label="微盟" value="微盟" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="城市等级" prop="level">
        <el-select
          v-model="form.level"
          placeholder="请选择"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
          @change="handleLevelChange"
        >
          <el-option label="一线" value="1" />
          <el-option label="二线" value="2" />
          <el-option label="三线" value="3" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="城市" prop="areaLevel2">
        <el-tree-select
          ref="areaLevel2TreeSelectRef"
          v-model="form.areaLevel2"
          :data="areaLevel2Data"
          :render-after-expand="false"
          show-checkbox
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          clearable
          :loading="areaLoading"
        />
      </el-form-item>

      <div class="flex justify-end">
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="submitForm(formRef)"
            >查询</el-button
          >
          <el-button :disabled="loading" @click="handleReset">重置</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.peidi-rfm-search-bar .el-input {
  --el-input-width: 220px;
}

.peidi-rfm-search-bar .el-select {
  --el-select-width: 220px;
}

.peidi-rfm-search-bar :deep(.el-date-editor) {
  width: 220px;
}

.peidi-rfm-search-bar :deep(.el-form-item__label) {
  color: #0a0a0a;
}
</style>
