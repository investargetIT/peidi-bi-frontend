<script setup lang="ts">
import { getBiRfmArea, type GetBiRfmParams } from "@/api/rfm";
import { message } from "@/utils/message";
import dayjs from "dayjs";
import { FormInstance, FormRules } from "element-plus";
import { onMounted, reactive, ref } from "vue";

const NUMBER_REGEX = /^\d+(\.\d+)?$/;

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
  /** 渠道类型 */
  channel?: string[];
  /** 最近消费时间 */
  lastOrderTime?: string;
  /** 累计消费金额 */
  totalAmount1?: string;
  totalAmount2?: string;
  /** 消费频率 */
  totalOrders1?: string;
  totalOrders2?: string;
}

const formRef = ref<FormInstance>(null);
// 多选英文逗号分隔
const form = reactive<RFMSearchForm>({
  level: [],
  areaLevel2: [],
  channel: [],
  lastOrderTime: dayjs().subtract(1, "year").format("YYYY"),
  totalAmount1: "200",
  totalAmount2: "500",
  totalOrders1: "2",
  totalOrders2: "4"
});
const rules = reactive<FormRules<RFMSearchForm>>({
  lastOrderTime: [
    { required: true, message: "请选择最近消费时间", trigger: "blur" }
  ],
  totalAmount1: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请输入累计消费金额1"));
        } else if (!NUMBER_REGEX.test(value)) {
          callback(new Error("请输入数字"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  totalAmount2: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请输入累计消费金额2"));
        } else if (!NUMBER_REGEX.test(value)) {
          callback(new Error("请输入数字"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  totalOrders1: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请输入消费频率1"));
        } else if (!NUMBER_REGEX.test(value)) {
          callback(new Error("请输入数字"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  totalOrders2: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请输入消费频率2"));
        } else if (!NUMBER_REGEX.test(value)) {
          callback(new Error("请输入数字"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

const areaLoading = ref<boolean>(false);
// 因为存在上海市-上海市这种情况 我需要给一级城市添加一个标识 防止通过二级城市选中一级城市
const AREA_LEVEL_1_FLAG = "areaLevel1";
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

//#region 请求方法集合
// 获取rfm模型城市级联
const fetchAreaLevel2 = () => {
  areaLoading.value = true;
  getBiRfmArea()
    .then((res: any) => {
      if (res.code === 200) {
        // console.log("rfm模型城市级联", res.data);

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
        totalAmount1: form.totalAmount1,
        totalAmount2: form.totalAmount2,
        totalOrders1: form.totalOrders1,
        totalOrders2: form.totalOrders2,
        year: dayjs(form.lastOrderTime).format("YYYY")
      };
      if (form.areaLevel2 && form.areaLevel2.length > 0) {
        // 先按拼音排个序，方便缓存
        params.areaLevel2 = [...form.areaLevel2]
          .sort((a: string, b: string) => {
            return a.localeCompare(b);
          })
          .map(item => "'" + item + "'")
          .join(",");
      }
      if (form.channel && form.channel.length > 0) {
        params.channel = [...form.channel]
          .sort((a: string, b: string) => {
            return a.localeCompare(b);
          })
          .map(item => "'" + item + "'")
          .join(",");
      }
      console.log("params:", params);
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
      label-width="140px"
      :rules="rules"
    >
      <!-- RFM -->
      <div class="text-[16px] font-bold text-[#0a0a0a]">RFM</div>
      <el-form-item label="客户分类取值期间" prop="lastOrderTime">
        <el-date-picker
          v-model="form.lastOrderTime"
          type="year"
          placeholder="请选择"
          :clearable="false"
          :disabled-date="
            (time: Date) =>
              time.getFullYear() > dayjs().year() || time.getFullYear() < 2022
          "
        />
      </el-form-item>

      <el-form-item label="消费频率1" prop="totalOrders1">
        <el-input v-model="form.totalOrders1" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="累计消费金额1" prop="totalAmount1">
        <el-input v-model="form.totalAmount1" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="消费频率2" prop="totalOrders2">
        <el-input v-model="form.totalOrders2" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="累计消费金额2" prop="totalAmount2">
        <el-input v-model="form.totalAmount2" placeholder="请输入" />
      </el-form-item>
      <!-- 搜索条件 -->
      <div class="text-[16px] font-bold text-[#0a0a0a] mt-[20px]">搜索条件</div>

      <el-form-item label="渠道" prop="channel">
        <el-select
          v-model="form.channel"
          placeholder="请选择（不选表示全部）"
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
          placeholder="请选择（不选表示全部）"
        />
      </el-form-item>

      <div class="flex justify-end">
        <el-form-item>
          <el-button :disabled="loading" @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="submitForm(formRef)"
            >查询</el-button
          >
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
