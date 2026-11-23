<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getDyWeeklyConfig, getDyWeeklyConfigList } from "@/api/douyin";
import { View } from "@element-plus/icons-vue";

defineOptions({ name: "ConfigSelector" });

const STORAGE_KEY = "douyin-active-config";

interface ConfigDetail {
  id?: number;
  configName?: string;
  yearMonth?: string;
  selfOperatedInfluencerIds?: string[];
  taxRate?: number;
  logisticsRatio1?: number;
  logisticsRatio2?: number;
  warehouseRatio?: number;
  platformFeeRatio1?: number;
  platformFeeRatio2?: number;
  qcDivisor1?: number;
  qcDivisor2?: number;
  [property: string]: any;
}

const props = defineProps<{
  modelValue?: number | string | null;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", val: number | string): void;
  (e: "change", val: number | string): void;
  (e: "detail-change", detail: ConfigDetail | null): void;
}>();

// 从本地缓存读取已选配置 id（兼容旧版存的是 configName，非数字则忽略）
const readStoredId = (): number | string | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
};

// 配置 id（全局共享，存 localStorage）
const selectedId = ref<number | string | null>(
  props.modelValue ?? readStoredId()
);

// 配置详情
const configDetail = ref<ConfigDetail | null>(null);
const loadingDetail = ref(false);

// 已保存配置选项（供下拉选择）
interface ConfigOption {
  id?: number;
  date?: string;
  configName?: string;
  [property: string]: any;
}
const configOptions = ref<ConfigOption[]>([]);

// 拉取全部已保存配置作为下拉选项
const loadConfigList = async () => {
  try {
    const res: any = await getDyWeeklyConfigList();
    let list = res;
    if (res && res.success && res.data !== undefined) list = res.data;
    else if (res && res.data !== undefined) list = res.data;
    configOptions.value = Array.isArray(list) ? list : [];
  } catch (error) {
    console.error("加载配置列表失败:", error);
  }
};

// 监听外部 modelValue 变化（跨 Tab 共享时同步）
watch(
  () => props.modelValue,
  val => {
    if (val !== selectedId.value) {
      selectedId.value = val ?? null;
      if (val !== undefined && val !== null && val !== "") loadDetail(val);
    }
  }
);

// 确认选择：派发更新、持久化并加载详情
const handleConfirm = async (val?: number | string | null) => {
  const id = val ?? selectedId.value;
  if (id === undefined || id === null || id === "") {
    // 清空选择（clearable）：静默清除，不弹出警告
    handleClear();
    return;
  }
  selectedId.value = id;
  emit("update:modelValue", id);
  emit("change", id);
  localStorage.setItem(STORAGE_KEY, String(id));
  await loadDetail(id);
};

// 清除选择
const handleClear = () => {
  selectedId.value = null;
  configDetail.value = null;
  emit("update:modelValue", "");
  emit("change", "");
  emit("detail-change", null);
  localStorage.removeItem(STORAGE_KEY);
};

// 加载配置详情（按 id）
const loadDetail = async (id: number | string) => {
  if (id === undefined || id === null || id === "") {
    configDetail.value = null;
    return;
  }
  loadingDetail.value = true;
  try {
    const res: any = await getDyWeeklyConfig({ id });
    // 兼容直接返回对象 / { data } / { success, data } 多种结构
    let detail = res;
    if (res && res.success && res.data !== undefined) detail = res.data;
    else if (res && res.data !== undefined) detail = res.data;
    // 后端返回 { id, date, configName, config: {...} }，config 里的字段展开到顶层
    if (detail && typeof detail.config === "object" && detail.config !== null) {
      detail = {
        id: detail.id,
        configName: detail.configName,
        date: detail.date,
        ...detail.config
      };
    }
    configDetail.value = detail || null;
    emit("detail-change", configDetail.value);
  } catch (error) {
    console.error("加载配置详情失败:", error);
    configDetail.value = null;
    emit("detail-change", null);
  } finally {
    loadingDetail.value = false;
  }
};

// 详情弹窗
const detailVisible = ref(false);

// 查看配置详情：加载当前配置并弹出弹窗
const handleViewDetail = async () => {
  if (
    selectedId.value === undefined ||
    selectedId.value === null ||
    selectedId.value === ""
  ) {
    ElMessage.warning("请选择费用配置");
    return;
  }
  await loadDetail(selectedId.value);
  detailVisible.value = true;
};

// 暴露给父组件：重新加载详情 / 获取当前详情
defineExpose({
  loadDetail,
  getDetail: () => configDetail.value
});

// 挂载时加载已保存配置列表，若有本地缓存配置则自动回显详情
onMounted(() => {
  loadConfigList();
  if (
    selectedId.value !== undefined &&
    selectedId.value !== null &&
    selectedId.value !== ""
  ) {
    loadDetail(selectedId.value);
  }
});

// 详情字段展示（key, label）
const detailRows: { key: string; label: string }[] = [
  { key: "yearMonth", label: "所属月份" },
  { key: "taxRate", label: "未税收入比例" },
  { key: "logisticsRatio1", label: "物流成本比例1" },
  { key: "logisticsRatio2", label: "物流成本比例2" },
  { key: "warehouseRatio", label: "仓储损耗包材比例" },
  { key: "platformFeeRatio1", label: "平台费用比例1" },
  { key: "platformFeeRatio2", label: "平台费用比例2" },
  { key: "qcDivisor1", label: "千川投流除数1" },
  { key: "qcDivisor2", label: "千川投流除数2" }
];
</script>

<template>
  <div class="config-selector">
    <div class="flex items-center gap-[10px]">
      <el-select
        v-model="selectedId"
        filterable
        clearable
        default-first-option
        placeholder="选择费用配置"
        style="width: 320px"
        @change="handleConfirm"
        @clear="handleClear"
      >
        <el-option
          v-for="opt in configOptions"
          :key="opt.id"
          :label="
            opt.configName
              ? `${opt.configName}${opt.date ? '（' + opt.date + '）' : ''}`
              : String(opt.id)
          "
          :value="opt.id"
        />
      </el-select>
      <el-button
        type="primary"
        :loading="loadingDetail"
        @click="handleViewDetail"
      >
        <el-icon class="mr-[4px]"><View /></el-icon>
        查看配置详情
      </el-button>
    </div>

    <!-- 配置详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      width="760px"
      append-to-body
      class="peidi-config-detail-dialog"
    >
      <template #header>
        <div class="flex items-center gap-[8px]">
          <el-icon class="detail-header-icon"><View /></el-icon>
          <span class="detail-header-title">配置详情</span>
          <el-tag
            v-if="configDetail && configDetail.configName !== undefined"
            type="primary"
            effect="dark"
            size="small"
          >
            {{ configDetail.configName }}
          </el-tag>
        </div>
      </template>
      <template v-if="configDetail && configDetail.configName !== undefined">
        <div class="detail-summary">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-[#909399]">配置名称</div>
              <div class="text-base font-semibold mt-[4px]">
                {{ configDetail.configName }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-[#909399]">所属月份</div>
              <div class="text-base font-semibold mt-[4px]">
                {{ configDetail.yearMonth || "-" }}
              </div>
            </div>
          </div>
        </div>
        <div class="detail-section-title">计算比例</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item
            v-for="row in detailRows.filter(r => r.key !== 'yearMonth')"
            :key="row.key"
            :label="row.label"
            class="detail-desc-item"
          >
            {{
              configDetail[row.key] !== undefined &&
              configDetail[row.key] !== null
                ? configDetail[row.key]
                : "-"
            }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-section-title mt-[12px]">
          自营达人ID（{{
            configDetail.selfOperatedInfluencerIds?.length || 0
          }}）
        </div>
        <div
          class="detail-ids-box"
          :class="{
            'detail-ids-empty': !(
              configDetail.selfOperatedInfluencerIds &&
              configDetail.selfOperatedInfluencerIds.length
            )
          }"
        >
          <template
            v-if="
              configDetail.selfOperatedInfluencerIds &&
              configDetail.selfOperatedInfluencerIds.length
            "
          >
            <el-tag
              v-for="id in configDetail.selfOperatedInfluencerIds"
              :key="id"
              size="small"
              class="detail-id-tag"
            >
              {{ id }}
            </el-tag>
          </template>
          <span v-else class="text-sm text-[#909399]">暂无自营达人ID</span>
        </div>
      </template>
      <el-empty v-else description="暂无配置详情" />
      <template #footer>
        <el-button type="primary" @click="detailVisible = false"
          >关闭</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.config-selector {
  display: inline-block;
}

/* 弹窗头部 */
.detail-header-icon {
  font-size: 16px;
  color: #409eff;
}

.detail-header-title {
  font-size: 16px;
  font-weight: 600;
}

/* 顶部摘要卡片 */
.detail-summary {
  padding: 14px 16px;
  margin-bottom: 14px;
  background: #f5f7fa;
  border-radius: 6px;
}

/* 分组标题 */
.detail-section-title {
  padding-left: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: #333;
  border-left: 3px solid #409eff;
}

/* 让描述项 label 列固定合适宽度，避免折行 */
:deep(.detail-desc-item .el-descriptions__label) {
  width: 130px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

:deep(.detail-desc-item .el-descriptions__content) {
  font-weight: 600;
  color: #303133;
}

/* 自营达人ID容器 */
.detail-ids-box {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.detail-ids-empty {
  display: block;
}

.detail-id-tag {
  margin: 0;
}
</style>
