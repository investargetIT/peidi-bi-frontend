<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import RowCol from "@/views/manage/components/dataDialog/rowCol.vue";
import {
  FormInstance,
  FormRules,
  UploadFile,
  UploadInstance
} from "element-plus";
import SolarUploadMinimalisticOutline from "~icons/solar/upload-minimalistic-outline";
import TablerFile from "~icons/tabler/file";
import RiUser3Line from "~icons/ri/user-3-line";
import RiInformation2Fill from "~icons/ri/information-2-fill";
import { commonUrlApi, postMilvusUpdate } from "@/api/vdb";
import { message } from "@/utils/message";
import * as dd from "dingtalk-jsapi";
import { SYSTEM_CONFIG } from "@/constants";
import { formatToken, getToken } from "@/utils/auth";
import { ddAuthFun } from "@/views/manage/utils/ddAuth";

const props = defineProps({
  // 保存回调函数
  saveCallback: {
    type: Function as PropType<(data: FormData) => void>,
    required: true
  },
  // 取消回调函数
  cancelCallback: {
    type: Function as PropType<() => void>,
    required: true
  },
  // 表单数据
  formData: {
    // 不强制数据类型，组件自己遍历对象得到表单字段
    type: Object,
    default: () => {}
  },
  // 表单类型 添加和编辑上传文件样式不同
  formType: {
    type: String as PropType<"add" | "edit">,
    required: true
  }
});

// 获取文档状态枚举
const docStatusEnum = inject<any[]>("docStatusEnum");

// 获取文档类型枚举
const reportTypeEnum = inject<any[]>("reportTypeEnum");

// 当前选择的表单类别
const selectedForm = ref("t-basic");
const formRef = ref<FormInstance>();

/**
 * 表单字段规划 - 按类别分组
 *
 * 基本信息 (t-basic)
 * - 文档标题: 文档的名称
 * - 文档描述: 文档的详细说明
 * - 文档类型: 文档的分类类型
 * - 文档路径: 文档存储路径
 * - 报告日期: 文档生成日期
 * - 到期日期: 文档有效期截止日期
 * - 语言: 文档使用的语言
 * - 文档状态: 文档当前状态（草稿/发布/归档等）
 *
 * 产品信息 (t-product)
 * - 产品名称/系列名: 产品名称或系列名称
 * - 品牌: 产品品牌
 * - SKU/料号: 产品唯一标识码
 * - 规格/净含量: 产品规格参数
 * - 批次/LOT: 生产批次号
 *
 * 系统信息 (t-system)
 * - 报告编号/唯一文件号: 系统生成的唯一标识
 * - 来源系统: 文档来源系统名称
 * - 文档版本号: 文档版本信息
 * - 文件哈希(完整性校验): 文件完整性校验值
 * - 访问控制: 文档访问权限设置
 *
 * 扩展信息 (t-extend)
 * - 自定义标签: 用户自定义标签
 * - 标准/法规编号: 相关标准或法规编号
 * - 入库时间: 文档入库时间戳
 * - 扩展元数据(JSON格式): 额外的元数据信息
 */

// 表单数据类型定义
interface FormData {
  // 基本信息
  documentTitle: string; // 文档标题 ✅(已使用)
  documentDescription: string; // 文档描述
  documentType: string; // 文档类型 ✅
  documentPath: string; // 文档路径
  reportDate: string; // 报告日期 ✅
  expiryDate: string; // 到期日期 ✅
  language: string; // 语言 ✅
  documentStatus: string; // 文档状态 ✅
  reportType: string; // 文档类型 -报告类型 ✅

  // 产品信息
  productName: string; // 产品名称/系列名 ✅
  brand: string; // 品牌 ✅
  sku: string; // SKU/料号 ✅
  specification: string; // 规格/净含量 ✅
  batchLot: string; // 批次/LOT ✅

  // 系统信息
  reportNumber: string; // 报告编号/唯一文件号 ✅
  sourceSystem: string; // 来源系统 ✅
  documentVersion: string; // 文档版本号 ✅
  fileHash: string; // 文件哈希(完整性校验) ✅
  accessControl: string; // 访问控制 ✅
  accessControlUsers: string; // 访问控制用户

  // 扩展信息
  customTags: string; // 自定义标签
  standardNumber: string; // 标准/法规编号
  storageTime: string; // 入库时间
  extendedData: string; // 扩展元数据(JSON格式)
}

const form = reactive<FormData>({
  // 基本信息
  documentTitle: "",
  documentDescription: "",
  documentType: "",
  documentPath: "",
  reportDate: "",
  expiryDate: "",
  language: "",
  documentStatus: "",
  reportType: "",

  // 产品信息
  productName: "",
  brand: "",
  sku: "",
  specification: "",
  batchLot: "",

  // 系统信息
  reportNumber: "",
  sourceSystem: "",
  documentVersion: "",
  fileHash: "",
  accessControl: "",
  accessControlUsers: "",

  // 扩展信息
  customTags: "",
  standardNumber: "",
  storageTime: "",
  extendedData: ""
});

const formRules = reactive<FormRules<FormData>>({
  documentTitle: [
    { required: true, message: "请输入文档标题", trigger: "blur" }
  ],
  documentDescription: [
    {
      required: false,
      message: "请输入文档描述",
      trigger: "blur"
    }
  ],
  reportType: [{ required: true, message: "请选择文档类型", trigger: "blur" }],
  documentPath: [{ required: true, message: "请上传文档", trigger: "blur" }]
});

// 表单访问控制是否全选
const isAccessControlAllSelected = ref(false);

//#region 上传文档逻辑 也是数据上传逻辑
// 上传文档 请求参数
const uploadRequest = ref({});

const uploadLoading = ref(false);
const uploadRef = ref<UploadInstance>(null);
// 上传文档 文件列表
const uploadFileList = ref<UploadFile[]>([]);
// 计算属性 判断是否显示上传按钮 true不显示 false显示
const hasUploadFile = computed(() => {
  // 编辑模式下不显示上传按钮
  if (props.formType === "edit") return true;
  // 如果是添加模式，且有上传文件，不显示上传按钮
  if (uploadFileList.value.length > 0) return true;
  // 其他情况显示上传按钮
  return false;
});
// 处理删除上传文件 并触发hasUploadFile变化
const handleDeleteUploadFile = () => {
  uploadFileList.value = [];
};
// 监听uploadFileList变化
watch(
  () => uploadFileList.value,
  (newVal, oldVal) => {
    // 只有在uploadFileList真正发生变化时才更新
    if (newVal !== oldVal) {
      // 如果有值就截取格式给documentType，截取最后一个.后的字符串
      if (newVal.length > 0) {
        console.log("watch uploadFileList", newVal);
        form.documentType =
          newVal[0]?.name?.split(".")?.[
            newVal[0]?.name?.split(".").length - 1
          ] || "";
        // TODO: 这里只是简单的截取文件名，后续需要根据实际情况处理
        form.documentPath = newVal[0]?.name || "";
      } else {
        form.documentType = "";
      }
    }
  },
  { deep: true, immediate: true }
);
// 上传文档 成功回调
const handleUploadSuccess = (res: any) => {
  uploadLoading.value = false;
  console.log("上传文档 成功回调", res);
  if (res?.code === 200) {
    message("上传文档成功", { type: "success" });
    // 执行保存回调函数
    props.saveCallback(form);
    // 对接后端返回的文件路径 暂时不处理，在watch中直接赋值
    // 上传成功后，将返回的文件路径赋值给form.documentPath
    // form.documentPath = res.data?.filePath || "";
  } else {
    message(res.msg || "上传文档失败", { type: "error" });
  }
};
// 上传文档 错误回调
const handleUploadError = (err: any) => {
  uploadLoading.value = false;
  console.log("上传文档 错误回调", err);
  message("上传文档失败", { type: "error" });
};
// 上传文档 变化回调
const handleUploadChange = (file: any) => {
  // console.log("上传文档 变化回调 file", JSON.stringify(file));
  if (file.response) {
    return;
  }
  const { name, type, size, lastModified } = file;
  const dotIndex = file.name.lastIndexOf(".");
  const fileNameWithoutExtension = file.name.slice(0, dotIndex);
  const fileExtension = file.name.slice(dotIndex);
  let fileName = `${fileNameWithoutExtension}_${Date.now()}${fileExtension}`; // 如果可以上传多个文件，这里需要用fileList.forEach()处理
  let f: any = new File([file.raw], fileName, {
    type: type,
    lastModified: lastModified
  });
  f.uid = file.uid; // new File 没有uid属性，会导致组件底层报错，这里手动加上
  file.raw = f; // 用f替换file的数据
  // console.log("上传文档 变化回调 uploadRef.value", uploadRef.value);
  // uploadRef.value.submit();
  // uploadLoading.value = true;
  // console.log("上传文档 变化回调 file.raw", file.raw);
};
//#endregion

// 监听formData变化，如果newVal不为空，则在newVal中遍历出form对象里存在的字段，赋值给form
watch(
  () => props.formData,
  (newVal, oldVal) => {
    // 只有在formData真正发生变化时才更新
    if (newVal !== oldVal) {
      // console.log("formData变化，先清空form再更新");

      // 先清空form
      Object.keys(form).forEach(key => {
        form[key] = "";
      });

      // 如果newVal不为空，则赋值给form
      if (newVal && Object.keys(newVal).length > 0) {
        // Object.keys(form).forEach(key => {
        //   if (
        //     newVal[key] !== undefined &&
        //     newVal[key] !== null &&
        //     newVal[key] !== ""
        //   ) {
        //     form[key] = newVal[key];
        //   }
        // });
        /** ############################################################################################ **/
        // 手动赋值
        const metedate = JSON.parse(newVal.metedate || "{}"); // 解析metedate字段，默认值为空对象
        form.accessControlUsers = metedate.accessControlUsers || ""; // 访问控制用户
        form.documentPath = metedate.documentPath || "";
        form.documentDescription = metedate.documentDescription || "";
        form.documentTitle = newVal.title || ""; // 文档标题
        form.reportType = newVal.reportType || ""; // 报告类型
        form.expiryDate = newVal.expireDate || ""; // 到期日期
        form.reportDate = newVal.reportDate || ""; // 报告日期
        form.productName = newVal.productName || ""; // 产品名称
        form.reportNumber = newVal.reportId || ""; // 报告编号
        form.sourceSystem = newVal.sourceSystem || ""; // 来源系统
        form.documentVersion = newVal.version || ""; // 文档版本
        form.fileHash = newVal.checksum || ""; // 文件哈希值
        form.brand = newVal.brand || ""; // 品牌
        form.sku = newVal.sku || ""; // SKU
        form.specification = newVal.spec || ""; // 规格
        form.batchLot = newVal.batchNo || ""; // 批次号
        //TODO: 语言和文档类型 稍后写
        form.language = newVal.lang || ""; // 语言
        form.documentStatus = newVal.docStatus || ""; // 文档状态
        // 处理访问控制
        form.accessControl = newVal.visibility || ""; // 访问控制
        if (newVal.visibility === "all") {
          isAccessControlAllSelected.value = true;
        } else {
          isAccessControlAllSelected.value = false;
        }
        /** ############################################################################################ **/
      }
      // 调试的时候快速保存用
      // handleSave();
    }
  },
  { deep: true, immediate: true }
);

// 表单清空操作
const clearForm = () => {
  // console.log("清空表单数据");
  // 遍历表单数据，将所有字段设为空字符串
  formRef.value?.resetFields();
  // 清空上传文件列表
  uploadFileList.value = [];
  // 清空上传请求数据
  uploadRequest.value = {};
  // 清空勾选访问控制
  isAccessControlAllSelected.value = false;
  // 回到基本信息表单
  selectedForm.value = "t-basic";
};

// visibility 的逻辑计算处理
const calculateVisibility = () => {
  if (isAccessControlAllSelected.value) return "all";
  if (form.accessControl === "") return "all";
  return form.accessControl;
};

// 处理保存操作 用function定义是为了在上面调用
function handleSave() {
  // 校验表单数据
  formRef.value?.validate(valid => {
    if (valid) {
      // console.log("表单数据有效，执行保存操作");
      /** ############################################################################################ **/
      // 处理上传数据uploadRequest

      if (props.formType === "add") {
        // 添加模式
        uploadRequest.value = {
          metedate: JSON.stringify({
            documentPath: form.documentPath,
            documentDescription: form.documentDescription,
            accessControlUsers: form.accessControlUsers
          }),
          visibility: calculateVisibility(),
          title: form.documentTitle,
          reportType: form.reportType,
          expireDate: form.expiryDate,
          reportDate: form.reportDate,
          productName: form.productName,
          reportId: form.reportNumber,
          sourceSystem: form.sourceSystem,
          version: form.documentVersion,
          checksum: form.fileHash,
          brand: form.brand,
          sku: form.sku,
          spec: form.specification,
          batchNo: form.batchLot,
          lang: form.language,
          docStatus: form.documentStatus === "" ? "有效" : form.documentStatus // 文档状态 空字符串默认有效
        };
        uploadRef.value.submit();
      } else if (props.formType === "edit") {
        // 编辑模式
        uploadRequest.value = {
          ...props.formData,
          metedate: JSON.stringify({
            documentPath: form.documentPath,
            documentDescription: form.documentDescription,
            accessControlUsers: form.accessControlUsers
          }),
          visibility: calculateVisibility(),
          title: form.documentTitle,
          reportType: form.reportType,
          expireDate: form.expiryDate,
          reportDate: form.reportDate,
          productName: form.productName,
          reportId: form.reportNumber,
          sourceSystem: form.sourceSystem,
          version: form.documentVersion,
          checksum: form.fileHash,
          brand: form.brand,
          sku: form.sku,
          spec: form.specification,
          batchNo: form.batchLot,
          lang: form.language,
          docStatus: form.documentStatus === "" ? "有效" : form.documentStatus // 文档状态 空字符串默认有效
        };
        fetchUpdate();
      }
      /** ############################################################################################ **/
      // console.log("uploadRef.value", uploadRef.value);

      uploadLoading.value = true;
    } else {
      // 表单数据无效，提示用户
      console.log("表单数据无效，提示用户");
      // 目前只有基本信息需要必填，所有跳到基本信息
      selectedForm.value = "t-basic";
    }
  });
}
// 处理取消操作
const handleCancel = () => {
  clearForm();
  // 执行取消回调函数
  props.cancelCallback();
};

// 更新知识库方法
const fetchUpdate = async () => {
  try {
    const res: any = await postMilvusUpdate(uploadRequest.value);
    console.log("更新知识库", res);
    if (res.code === 200) {
      message("更新知识库成功", { type: "success" });
      // 刷新数据
      props.saveCallback();
    } else {
      message(res.msg || "更新知识库失败", { type: "error" });
    }
    uploadLoading.value = false;
  } catch (error) {
    message("更新知识库失败", { type: "error" });
    uploadLoading.value = false;
  }
};

//#region 添加访问控制逻辑 调用钉钉工具
// 处理全选访问控制操作
const hanldeAccessControlAllSelected = val => {
  if (val) {
    form.accessControl = "all";
  } else {
    form.accessControl = "";
  }
  form.accessControlUsers = "";
  // console.log(
  //   "form.accessControl",
  //   form.accessControl,
  //   form.accessControlUsers,
  //   val
  // );
};
// 权限控制提示文字 计算属性
const accessControlTip = computed(() => {
  if (isAccessControlAllSelected.value) {
    return "已选择 所有 用户";
  }
  if (form.accessControl.length > 0) {
    const accessControlList = form.accessControl.split(",");
    // console.log("accessControlList", accessControlList);
    return `已选择 ${accessControlList.length} 位用户`;
  }
  return "点击选择可访问此文档的用户";
});
// 处理添加访问控制操作
const handleAddAccessControl = () => {
  // 判断是否在钉钉环境下
  if (!navigator.userAgent.includes("DingTalk")) {
    message("当前环境不是钉钉，无法添加访问控制", { type: "error" });
    return;
  }
  // 在钉钉环境下调用钉钉工具
  try {
    dd.ready(() => {
      dd.biz.contact.choose({
        multiple: true, //是否多选：true多选 false单选； 默认true
        users: form.accessControl.split(","), //默认选中的用户列表，员工userid；成功回调中应包含该信息
        corpId: SYSTEM_CONFIG.DINGTALK_CORP_ID, //企业id
        max: 1500, //人数限制，当multiple为true才生效，可选范围1-1500
        onSuccess: function (data) {
          console.log("data", data);
          /*
          data结构
          [
            {
              name: "张三", //姓名
              avatar: "http://g.alicdn.com/avatar/zhangsan.png ", //头像图片url，可能为空
              emplId: "0573" //员工userid
            }
          ];
        */
          // 处理选择的用户，将emplId拼接为逗号分隔的字符串
          if (data.length > 0) {
            form.accessControl = data.map(item => item.emplId).join(",");
            form.accessControlUsers = data.map(item => item.name).join(",");
          }
          // alert("dd successs: " + JSON.stringify(data));
        },
        onFail: function (err) {
          // alert("添加访问控制失败: " + err);
        }
      });
    });
  } catch (error) {
    // alert("添加访问控制失败: " + error);
  }
};
//#endregion

// 文件名省略方法
const ellipsisFileName = (fileName: string, maxLength: number = 10) => {
  if (!fileName) {
    return "";
  }
  if (fileName.length <= maxLength) {
    return fileName;
  }
  return fileName.substring(0, maxLength) + "...";
};

onMounted(() => {
  // 初始化钉钉权限
  if (navigator.userAgent.includes("DingTalk")) {
    ddAuthFun();
  }
});

defineExpose({
  clearForm
});
</script>

<template>
  <!-- 表单类别选择 -->
  <div>
    <el-radio-group v-model="selectedForm">
      <el-radio-button label="基本信息" value="t-basic" />
      <el-radio-button label="产品信息" value="t-product" />
      <el-radio-button label="系统信息" value="t-system" />
      <!-- <el-radio-button label="扩展信息" value="t-extend" /> -->
    </el-radio-group>
  </div>

  <!-- 信息表单 -->
  <div class="mt-[20px]">
    <el-form
      ref="formRef"
      style="max-width: 600px"
      :model="form"
      label-width="auto"
      label-position="top"
      :rules="formRules"
    >
      <!-- 类别 -基本信息 -->
      <div v-show="selectedForm === 't-basic'">
        <el-form-item label="文档标题" prop="documentTitle">
          <el-input v-model="form.documentTitle" placeholder="输入文档标题" />
        </el-form-item>
        <el-form-item label="文档描述" prop="documentDescription">
          <el-input
            v-model="form.documentDescription"
            type="textarea"
            placeholder="输入文档描述内容"
          />
        </el-form-item>

        <RowCol>
          <template #left>
            <el-form-item v-show="false" label="文档类型" prop="documentType">
              <el-input
                v-model="form.documentType"
                placeholder="上传文档后自动识别"
                disabled
              />
              <div class="text-[12px] text-[#71717a]">
                系统将根据文件名自动识别文档类型
              </div>
            </el-form-item>
            <el-form-item label="文档类型" prop="reportType">
              <el-select v-model="form.reportType" placeholder="选择文档类型">
                <el-option
                  v-for="item in reportTypeEnum"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>
          <template #right>
            <!--           
              上传文档逻辑：
                由upload+alert组合实现
                1. 编辑时，不显示upload按钮， 并且alert中不显示x
                2. 添加时，如果没有上传文件，显示upload按钮；如果有上传文件，显示alert并且显示x
            -->
            <el-form-item label="上传文档" prop="documentPath">
              <!-- 显隐逻辑抽离到计算属性 -->
              <div v-show="!hasUploadFile" class="w-full h-[32px]">
                <!-- 上传数据全靠这个接口，参数放到data.request中 -->
                <el-upload
                  ref="uploadRef"
                  v-model:file-list="uploadFileList"
                  :action="commonUrlApi('/ai/milvus/new')"
                  :data="{
                    request: JSON.stringify(uploadRequest)
                  }"
                  :headers="{
                    Authorization: formatToken(getToken().accessToken)
                  }"
                  :limit="1"
                  :auto-upload="false"
                  accept=".pdf,.docx,.doc,.xlsx,.xls"
                  :on-success="handleUploadSuccess"
                  :on-change="handleUploadChange"
                  :on-error="handleUploadError"
                >
                  <el-button>
                    <IconifyIconOffline
                      :icon="SolarUploadMinimalisticOutline"
                      class="w-[18px] h-[18px] text-[#09090B]"
                    />
                    <span class="ml-[5px] text-[#09090B]">选择文件</span>
                  </el-button>
                </el-upload>
              </div>

              <div
                v-show="hasUploadFile"
                class="peidi-manage-data-dialog-upload-alert w-full"
              >
                <el-alert
                  :title="
                    props.formType === 'add'
                      ? ellipsisFileName(uploadFileList[0]?.name)
                      : ellipsisFileName(form.documentPath)
                  "
                  type="info"
                  :closable="props.formType === 'add'"
                  style="
                    padding-top: 3px;
                    padding-bottom: 3px;
                    border: 1px solid #e5e7eb;
                  "
                  show-icon
                  @close="handleDeleteUploadFile"
                >
                  <template #icon> <TablerFile /> </template>
                </el-alert>
              </div>

              <div class="text-[12px] text-[#71717a]">
                支持 PDF, DOCX, DOC, XLSX, XLS 格式
              </div>
            </el-form-item>
          </template>
        </RowCol>

        <RowCol>
          <template #left
            ><el-form-item label="报告日期" prop="reportDate">
              <el-date-picker
                v-model="form.reportDate"
                type="date"
                format="YYYY/MM/DD"
                placeholder="年/月/日"
              />
            </el-form-item>
          </template>
          <template #right
            ><el-form-item label="到期日期" prop="expiryDate">
              <el-date-picker
                v-model="form.expiryDate"
                type="date"
                format="YYYY/MM/DD"
                placeholder="年/月/日"
              />
            </el-form-item>
          </template>
        </RowCol>

        <RowCol>
          <template #left>
            <el-form-item label="语言" prop="language">
              <el-select
                v-model="form.language"
                placeholder="选择语言"
                clearable
              >
                <el-option label="中文" value="zh" />
                <el-option label="英文" value="en" />
              </el-select>
            </el-form-item>
          </template>
          <template #right>
            <el-form-item label="文档状态" prop="documentStatus">
              <el-select
                v-model="form.documentStatus"
                placeholder="选择文档状态"
                clearable
              >
                <el-option
                  v-for="item in docStatusEnum"
                  :key="item.id"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select> </el-form-item
          ></template>
        </RowCol>
      </div>

      <!-- 类别 -产品信息 -->
      <div v-show="selectedForm === 't-product'">
        <el-form-item label="产品名称/系列名" prop="productName">
          <el-input v-model="form.productName" placeholder="输入产品名称" />
        </el-form-item>

        <RowCol>
          <template #left>
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="输入品牌名称" />
            </el-form-item>
          </template>
          <template #right>
            <el-form-item label="SKU/料号" prop="sku">
              <el-input
                v-model="form.sku"
                placeholder="输入SKU编号"
              /> </el-form-item
          ></template>
        </RowCol>

        <RowCol>
          <template #left>
            <el-form-item label="规格/净含量" prop="specification">
              <el-input
                v-model="form.specification"
                placeholder="如: 1L, 500ml"
              />
            </el-form-item>
          </template>
          <template #right>
            <el-form-item label="批次/LOT" prop="batchLot">
              <el-input
                v-model="form.batchLot"
                placeholder="输入批次号"
                type="number"
              />
            </el-form-item>
          </template>
        </RowCol>
      </div>

      <!-- 类别 -系统信息 -->
      <div v-show="selectedForm === 't-system'">
        <el-form-item label="报告编号/唯一文件号" prop="reportNumber">
          <el-input v-model="form.reportNumber" placeholder="输入报告编号" />
        </el-form-item>

        <RowCol>
          <template #left>
            <el-form-item label="来源系统" prop="sourceSystem">
              <el-input
                v-model="form.sourceSystem"
                placeholder="如: PLM, CRM, QMS"
              />
            </el-form-item>
          </template>
          <template #right>
            <el-form-item label="文档版本" prop="documentVersion">
              <el-input
                v-model="form.documentVersion"
                placeholder="如: v1.0, v2.1"
              /> </el-form-item
          ></template>
        </RowCol>

        <!-- <el-form-item label="文件哈希(完整性校验)" prop="fileHash">
          <el-input
            v-model="form.fileHash"
            placeholder="文件的MD5或SHA256哈希值"
          />
        </el-form-item> -->
        <el-form-item label="访问控制" prop="accessControl">
          <!-- <el-input
            v-model="form.accessControl"
            placeholder="如: engineering/manufacturing, public"
          /> -->
          <!-- <el-button class="w-[100%] text-left" size="large" :icon="RiUser3Line"
            >添加访问控制</el-button
          > -->
          <div class="w-[100%] flex items-center">
            <el-checkbox
              v-model="isAccessControlAllSelected"
              label="全部用户"
              size="large"
              @change="hanldeAccessControlAllSelected"
            />
            <div
              class="ml-[10px] flex items-center text-[12px] text-[#71717a] bg-[#f5f5f5] rounded-[5px] px-[5px] py-[2px] h-[24px]"
            >
              <IconifyIconOffline
                :icon="RiInformation2Fill"
                class="w-[16px] h-[16px] mr-[3px]"
              />若要单独添加访问控制，请先取消选择全部用户
            </div>
          </div>
          <div
            v-show="!isAccessControlAllSelected"
            class="w-[100%] flex items-center text-[#000] border border-[#71717a35] rounded-[5px] px-[10px] py-[5px] cursor-pointer hover:bg-[#71717a15]"
            @click="handleAddAccessControl"
          >
            <IconifyIconOffline :icon="RiUser3Line" />
            <div class="ml-[5px]">添加访问控制</div>
          </div>
          <div class="w-[100%] text-[12px] text-[#71717a]">
            {{ accessControlTip }}
          </div>
          <div
            v-show="
              !isAccessControlAllSelected && form.accessControlUsers.length > 0
            "
            class="w-[100%] text-[12px] text-[#71717a]"
          >
            已选择用户: {{ form.accessControlUsers }}
          </div>
        </el-form-item>
      </div>

      <!-- 类别 -扩展信息 -->
      <!-- <div v-show="selectedForm === 't-extend'">
        <el-form-item label="自定义标签" prop="customTags">
          <el-input
            v-model="form.customTags"
            placeholder="使用逗号分隔多个标签"
          />
          <div class="text-[12px] text-[#71717a]">
            例如: safety,chemicals,msds
          </div>
        </el-form-item>
        <el-form-item label="标准/法规编号" prop="standardNumber">
          <el-input
            v-model="form.standardNumber"
            placeholder="如: GB/T 16483-2008, ISO 9001:2015"
          />
        </el-form-item>
        <el-form-item label="入库时间" prop="storageTime">
          <el-date-picker
            v-model="form.storageTime"
            type="datetime"
            format="YYYY/MM/DD HH:mm"
            placeholder="年/月/日 --:--"
          />
        </el-form-item>
        <el-form-item label="扩展元数据" prop="extendedData">
          <el-input
            v-model="form.extendedData"
            type="textarea"
            placeholder='{"key": "value"}'
          />
          <div class="text-[12px] text-[#71717a]">输入有效的JSON格式数据</div>
        </el-form-item>
      </div> -->

      <!-- 提交按钮 -->
      <el-form-item>
        <div class="w-[100%] mt-[20px] flex justify-end">
          <el-button size="large" @click="handleCancel">取消</el-button>
          <el-button
            size="large"
            type="primary"
            :loading="uploadLoading"
            @click="handleSave"
            >保存</el-button
          >
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-radio-group) {
  flex-wrap: nowrap;
}

:deep(.el-radio-button__inner) {
  padding-right: 51px;
  padding-left: 51px;
  font-size: 14px;
  font-weight: bold;
  color: #09090b;
}

:deep(.el-form-item__label) {
  color: #09090b;
}

.peidi-manage-data-dialog-upload-alert {
  .el-alert--info {
    height: 32px;
  }

  :deep(.el-alert__close-btn) {
    top: 8px;
  }
}
</style>
