<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { postDyWeeklyConfigSave, getDyWeeklyConfigList } from "@/api/douyin";
import { Plus, Edit, Refresh, QuestionFilled } from "@element-plus/icons-vue";

defineOptions({ name: "WeeklyConfig" });

// 已保存配置列表（按月份倒序）
interface ConfigListItem {
  id?: number;
  date?: string;
  configName?: string;
  config?: any;
  [property: string]: any;
}
const configList = ref<ConfigListItem[]>([]);
const loadingList = ref(false);

// 自营达人ID 标签展示：默认收起，数量多时可展开
const showAllIds = ref(false);
const IDs_COLLAPSED_LIMIT = 20;
const visibleIds = computed(() => {
  const list = formData.selfOperatedInfluencerIds || [];
  return showAllIds.value ? list : list.slice(0, IDs_COLLAPSED_LIMIT);
});

// 拉取全部已保存配置
const loadConfigList = async () => {
  loadingList.value = true;
  try {
    const res: any = await getDyWeeklyConfigList();
    let list = res;
    if (res && res.success && res.data !== undefined) list = res.data;
    else if (res && res.data !== undefined) list = res.data;
    configList.value = Array.isArray(list) ? list : [];
  } catch (error) {
    console.error("加载配置列表失败:", error);
    ElMessage.error("加载配置列表失败");
  } finally {
    loadingList.value = false;
  }
};

// 弹窗表单状态
const dialogVisible = ref(false);
const formTitle = ref("新增配置");

// 新增：重置为默认值并打开弹窗
const openCreate = () => {
  Object.assign(formData, defaultForm());
  showAllIds.value = false;
  formTitle.value = "新增配置";
  dialogVisible.value = true;
};

// 点击某条配置，填充到表单便于编辑并打开弹窗
const editConfig = (row: ConfigListItem) => {
  const cfg = row.config;
  const detail =
    cfg && cfg.configName !== undefined
      ? cfg
      : { ...row.config, configName: row.configName };
  formData.configName = row.configName || "";
  formData.yearMonth =
    detail.yearMonth || (row.date && row.date.slice(0, 7)) || "";
  formData.selfOperatedInfluencerIds = detail.selfOperatedInfluencerIds || [];
  if (detail.taxRate !== undefined) formData.taxRate = detail.taxRate;
  if (detail.logisticsRatio1 !== undefined)
    formData.logisticsRatio1 = detail.logisticsRatio1;
  if (detail.logisticsRatio2 !== undefined)
    formData.logisticsRatio2 = detail.logisticsRatio2;
  if (detail.warehouseRatio !== undefined)
    formData.warehouseRatio = detail.warehouseRatio;
  if (detail.platformFeeRatio1 !== undefined)
    formData.platformFeeRatio1 = detail.platformFeeRatio1;
  if (detail.platformFeeRatio2 !== undefined)
    formData.platformFeeRatio2 = detail.platformFeeRatio2;
  if (detail.qcDivisor1 !== undefined) formData.qcDivisor1 = detail.qcDivisor1;
  if (detail.qcDivisor2 !== undefined) formData.qcDivisor2 = detail.qcDivisor2;
  showAllIds.value = false;
  formTitle.value = "编辑配置";
  dialogVisible.value = true;
};

onMounted(() => {
  loadConfigList();
});

// 查看自营达人ID详情
const idsDialogVisible = ref(false);
const idsDialogTitle = ref("");
const idsDialogList = ref<string[]>([]);
const viewIds = (row: ConfigListItem) => {
  idsDialogList.value = row.config?.selfOperatedInfluencerIds || [];
  idsDialogTitle.value = `${row.configName || ""} · 自营达人ID`;
  idsDialogVisible.value = true;
};

// 配置表单（默认值工厂，新增时重置用）
const defaultForm = () => ({
  configName: "",
  yearMonth: "",
  selfOperatedInfluencerIds: [
    "1143971292653752",
    "2159871682941675",
    "247837613127280",
    "94834518773",
    "3467216973730666"
  ],
  taxRate: 1.09,
  logisticsRatio1: 0.0474,
  logisticsRatio2: 1.06,
  warehouseRatio: 0.04643,
  platformFeeRatio1: 0.02226,
  platformFeeRatio2: 1.06,
  qcDivisor1: 1.06,
  qcDivisor2: 1.01
});
const formData = reactive(defaultForm());

const saving = ref(false);

// 达人ID输入相关
const influencerInputValue = ref("");
const handleInfluencerInputConfirm = () => {
  const value = influencerInputValue.value.trim();
  if (value && !formData.selfOperatedInfluencerIds.includes(value)) {
    formData.selfOperatedInfluencerIds.push(value);
  }
  influencerInputValue.value = "";
};
const removeInfluencerId = (index: number) => {
  formData.selfOperatedInfluencerIds.splice(index, 1);
};
const clearAllInfluencerIds = () => {
  formData.selfOperatedInfluencerIds = [];
};

// 达人ID批量编辑
const batchDialogVisible = ref(false);
const batchIdsText = ref("");
const openBatchEdit = () => {
  batchIdsText.value = (formData.selfOperatedInfluencerIds || []).join("\n");
  batchDialogVisible.value = true;
};
const applyBatchEdit = () => {
  // 按换行 / 逗号 / 分号 / 空格拆分并去重、去空
  const ids = Array.from(
    new Set(
      batchIdsText.value
        .split(/[\n,，;；\s]+/)
        .map(s => s.trim())
        .filter(Boolean)
    )
  );
  formData.selfOperatedInfluencerIds = ids;
  batchDialogVisible.value = false;
  ElMessage.success(`已更新 ${ids.length} 个自营达人ID`);
};

// 保存配置
const saveConfig = async () => {
  if (!formData.configName.trim()) {
    ElMessage.warning("请填写配置名称");
    return;
  }
  saving.value = true;
  try {
    const payload: any = {
      configName: formData.configName.trim(),
      yearMonth: formData.yearMonth,
      selfOperatedInfluencerIds: formData.selfOperatedInfluencerIds,
      taxRate: formData.taxRate,
      logisticsRatio1: formData.logisticsRatio1,
      logisticsRatio2: formData.logisticsRatio2,
      warehouseRatio: formData.warehouseRatio,
      platformFeeRatio1: formData.platformFeeRatio1,
      platformFeeRatio2: formData.platformFeeRatio2,
      qcDivisor1: formData.qcDivisor1,
      qcDivisor2: formData.qcDivisor2
    };
    const res: any = await postDyWeeklyConfigSave(payload);
    if (res === true || (res && res.success !== false)) {
      ElMessage.success("配置保存成功");
      dialogVisible.value = false;
      loadConfigList();
    } else {
      ElMessage.error("保存失败");
    }
  } catch (error) {
    console.error("保存配置失败:", error);
    ElMessage.error("保存配置失败");
  } finally {
    saving.value = false;
  }
};
</script>
<template>
  <div class="weekly-config">
    <!-- 已保存配置列表（主视图） -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-[6px]">
            <span>已保存配置（按月份倒序）</span>
            <el-tooltip
              content="配置供抖音周报/利润表/千川通过 configName 选用计算"
              placement="top"
            >
              <el-icon color="#909399"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div>
            <el-button type="primary" @click="openCreate">
              <el-icon class="mr-[4px]"><Plus /></el-icon>
              新增配置
            </el-button>
            <el-button :loading="loadingList" @click="loadConfigList">
              <el-icon class="mr-[4px]"><Refresh /></el-icon>
              刷新列表
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loadingList"
        :data="configList"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="configName" label="配置名称" min-width="140" />
        <el-table-column prop="date" label="配置月份" min-width="100">
          <template #default="{ row }">
            {{ (row.date || "").slice(0, 7) }}
          </template>
        </el-table-column>
        <el-table-column label="自营达人" min-width="120">
          <template #default="{ row }">
            <el-link
              v-if="(row.config?.selfOperatedInfluencerIds || []).length > 0"
              type="primary"
              :underline="false"
              @click="viewIds(row)"
            >
              查看 {{ (row.config?.selfOperatedInfluencerIds || []).length }} 个
              ID
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="未税比例" width="100" align="center">
          <template #default="{ row }">{{
            row.config?.taxRate ?? "-"
          }}</template>
        </el-table-column>
        <el-table-column label="物流比例1" width="100" align="center">
          <template #default="{ row }">
            {{ row.config?.logisticsRatio1 ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column label="仓储比例" width="100" align="center">
          <template #default="{ row }">
            {{ row.config?.warehouseRatio ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column label="平台比例1" width="100" align="center">
          <template #default="{ row }">
            {{ row.config?.platformFeeRatio1 ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editConfig(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 配置表单（弹窗） -->
    <el-dialog
      v-model="dialogVisible"
      :title="formTitle"
      width="760px"
      destroy-on-close
    >
      <el-form
        :model="formData"
        :inline="true"
        label-width="110px"
        class="peidi-weekly-config"
      >
        <el-form-item label="配置名称">
          <el-input
            v-model="formData.configName"
            placeholder="输入配置名称，如 2026-08"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="所属月份">
          <el-date-picker
            v-model="formData.yearMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="自营达人ID">
          <div class="influencer-input-wrapper">
            <div
              v-if="formData.selfOperatedInfluencerIds.length > 0"
              class="tag-list-scroll"
            >
              <div class="tag-list">
                <el-tag
                  v-for="(id, index) in visibleIds"
                  :key="id"
                  closable
                  @close="removeInfluencerId(index)"
                >
                  {{ id }}
                </el-tag>
                <el-tag
                  v-if="
                    !showAllIds &&
                    formData.selfOperatedInfluencerIds.length >
                      IDs_COLLAPSED_LIMIT
                  "
                  type="info"
                  effect="plain"
                  class="cursor-pointer"
                  @click="showAllIds = true"
                >
                  +{{
                    formData.selfOperatedInfluencerIds.length -
                    IDs_COLLAPSED_LIMIT
                  }}
                  更多
                </el-tag>
              </div>
              <div
                v-if="
                  formData.selfOperatedInfluencerIds.length >
                  IDs_COLLAPSED_LIMIT
                "
                class="text-right mt-[4px]"
              >
                <el-link
                  type="primary"
                  :underline="false"
                  @click="showAllIds = !showAllIds"
                >
                  {{ showAllIds ? "收起" : "展开全部" }}
                </el-link>
              </div>
            </div>
            <div class="input-row">
              <el-input
                v-model="influencerInputValue"
                placeholder="回车添加单个ID"
                style="width: 200px"
                @keydown.enter.prevent="handleInfluencerInputConfirm"
                @blur="handleInfluencerInputConfirm"
              />
              <el-button
                type="primary"
                plain
                size="small"
                @click="openBatchEdit"
              >
                批量编辑
              </el-button>
              <el-button
                v-if="formData.selfOperatedInfluencerIds.length > 0"
                type="danger"
                size="small"
                text
                style="white-space: nowrap"
                @click="clearAllInfluencerIds"
              >
                清除全部
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-divider style="margin: 8px 0" />
        <el-form-item label="未税收入比例">
          <el-input-number
            v-model="formData.taxRate"
            :min="0"
            :precision="3"
            :step="0.01"
          />
        </el-form-item>
        <el-form-item label="物流比例1">
          <el-input-number
            v-model="formData.logisticsRatio1"
            :min="0"
            :precision="4"
            :step="0.001"
          />
        </el-form-item>
        <el-form-item label="物流比例2">
          <el-input-number
            v-model="formData.logisticsRatio2"
            :min="0"
            :precision="3"
            :step="0.01"
          />
        </el-form-item>
        <el-form-item label="仓储损耗比例">
          <el-input-number
            v-model="formData.warehouseRatio"
            :min="0"
            :precision="5"
            :step="0.0001"
          />
        </el-form-item>
        <el-form-item label="平台比例1">
          <el-input-number
            v-model="formData.platformFeeRatio1"
            :min="0"
            :precision="5"
            :step="0.0001"
          />
        </el-form-item>
        <el-form-item label="平台比例2">
          <el-input-number
            v-model="formData.platformFeeRatio2"
            :min="0"
            :precision="3"
            :step="0.01"
          />
        </el-form-item>
        <el-form-item label="千川除数1">
          <el-input-number
            v-model="formData.qcDivisor1"
            :min="0"
            :precision="3"
            :step="0.01"
          />
        </el-form-item>
        <el-form-item label="千川除数2">
          <el-input-number
            v-model="formData.qcDivisor2"
            :min="0"
            :precision="3"
            :step="0.01"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveConfig">
          保存配置
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑自营达人ID -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量编辑自营达人ID"
      width="600px"
      append-to-body
    >
      <div class="mb-[10px] text-sm text-[#909399]">
        每行一个ID，也支持逗号/分号/空格分隔；保存时会自动去重、去空。当前共
        {{ (formData.selfOperatedInfluencerIds || []).length }} 个。
      </div>
      <el-input
        v-model="batchIdsText"
        type="textarea"
        :rows="12"
        placeholder="每行一个达人ID"
      />
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applyBatchEdit">应用</el-button>
      </template>
    </el-dialog>

    <!-- 自营达人ID 详情 -->
    <el-dialog
      v-model="idsDialogVisible"
      :title="idsDialogTitle"
      width="520px"
      append-to-body
    >
      <div class="mb-[10px] text-sm text-[#909399]">
        共 {{ idsDialogList.length }} 个自营达人ID：
      </div>
      <div v-if="idsDialogList.length" class="ids-detail-list">
        <el-tag
          v-for="id in idsDialogList"
          :key="id"
          size="small"
          style="margin: 0 6px 6px 0"
        >
          {{ id }}
        </el-tag>
      </div>
      <div v-else class="text-sm text-[#909399]">暂无自营达人ID</div>
      <template #footer>
        <el-button type="primary" @click="idsDialogVisible = false"
          >关闭</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* 参考 yuanliBowl 搜索块：内联表单 + 自然宽度 */
.peidi-weekly-config .el-date-editor {
  width: 200px;
}

/* 自营达人ID 标签输入框（inline 下给固定宽度） */
.influencer-input-wrapper {
  width: 480px;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-list-scroll {
  max-height: 110px;
  margin-bottom: 6px;
  overflow-y: auto;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ids-detail-list {
  max-height: 320px;
  overflow-y: auto;
}
</style>
