<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Edit,
  Delete,
  Plus,
  Search,
  RefreshLeft
} from "@element-plus/icons-vue";
import {
  getDyExpertContractPage,
  postDyExpertContractBatch,
  postDyExpertContractUpdate,
  postDyExpertContractDelete
} from "@/api/douyin";
import dayjs from "dayjs";

// 搜索表单数据
const searchForm = reactive({
  expertNickname: "",
  douyinId: "",
  signingUnit: "",
  contractStartTimeStart: "",
  contractStartTimeEnd: "",
  contractEndTimeStart: "",
  contractEndTimeEnd: ""
});

// 日期范围的单独引用
const contractStartDateRange = ref<string[]>([]);
const contractEndDateRange = ref<string[]>([]);

// 监听合同起始时间范围变化
watch(contractStartDateRange, newVal => {
  if (newVal && newVal.length === 2) {
    searchForm.contractStartTimeStart = newVal[0];
    searchForm.contractStartTimeEnd = newVal[1];
  } else {
    searchForm.contractStartTimeStart = "";
    searchForm.contractStartTimeEnd = "";
  }
});

// 监听合同结束时间范围变化
watch(contractEndDateRange, newVal => {
  if (newVal && newVal.length === 2) {
    searchForm.contractEndTimeStart = newVal[0];
    searchForm.contractEndTimeEnd = newVal[1];
  } else {
    searchForm.contractEndTimeStart = "";
    searchForm.contractEndTimeEnd = "";
  }
});

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增达人合同");
const isEdit = ref(false);
const currentExpert = ref<any>(null);

// 达人基础信息
const expertForm = reactive({
  settlementDarrenId: "",
  expertNickname: "",
  douyinId: ""
});

// 合同历史列表
const contractHistoryList = ref<any[]>([]);

// 合同历史编辑对话框
const contractDialogVisible = ref(false);
const isEditContract = ref(false);
const currentContractIndex = ref(-1);
const contractForm = reactive({
  signingUnit: "",
  contractStartTime: "",
  contractEndTime: "",
  executionDate: "",
  ratio: undefined,
  taxRate: undefined,
  settlementRule: "",
  sortOrder: 0
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 构建参数，过滤空值
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    };

    // 只添加有值的字段
    if (searchForm.expertNickname)
      params.expertNickname = searchForm.expertNickname;
    if (searchForm.douyinId) params.douyinId = searchForm.douyinId;
    if (searchForm.signingUnit) params.signingUnit = searchForm.signingUnit;
    if (searchForm.contractStartTimeStart)
      params.contractStartTimeStart = searchForm.contractStartTimeStart;
    if (searchForm.contractStartTimeEnd)
      params.contractStartTimeEnd = searchForm.contractStartTimeEnd;
    if (searchForm.contractEndTimeStart)
      params.contractEndTimeStart = searchForm.contractEndTimeStart;
    if (searchForm.contractEndTimeEnd)
      params.contractEndTimeEnd = searchForm.contractEndTimeEnd;

    const res: any = await getDyExpertContractPage(params);
    if (res.success) {
      tableData.value = res.data?.records || [];
      pagination.total = res.data?.total || 0;
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1;
  loadData();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    expertNickname: "",
    douyinId: "",
    signingUnit: "",
    contractStartTimeStart: "",
    contractStartTimeEnd: "",
    contractEndTimeStart: "",
    contractEndTimeEnd: ""
  });
  contractStartDateRange.value = [];
  contractEndDateRange.value = [];
  handleSearch();
};

// 分页变化
const handleCurrentChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  loadData();
};

// 打开新增对话框
const handleAdd = () => {
  dialogTitle.value = "新增达人合同";
  isEdit.value = false;
  currentExpert.value = null;
  Object.assign(expertForm, {
    settlementDarrenId: "",
    expertNickname: "",
    douyinId: ""
  });
  contractHistoryList.value = [];
  dialogVisible.value = true;
};

// 打开编辑对话框
const handleEdit = (row: any) => {
  dialogTitle.value = "编辑达人合同";
  isEdit.value = true;
  currentExpert.value = row;
  Object.assign(expertForm, {
    settlementDarrenId: row.settlementDarrenId,
    expertNickname: row.expertNickname,
    douyinId: row.douyinId
  });
  contractHistoryList.value = [...(row.contractList || [])];
  dialogVisible.value = true;
};

// 打开合同历史对话框 - 保留原功能
const handleViewHistory = (row: any) => {
  // 可以直接复用编辑功能，或者保持独立的历史查看
  handleEdit(row);
};

// 新增合同历史
const handleAddContract = () => {
  isEditContract.value = false;
  currentContractIndex.value = -1;
  Object.assign(contractForm, {
    signingUnit: "",
    contractStartTime: "",
    contractEndTime: "",
    executionDate: "",
    ratio: undefined,
    taxRate: undefined,
    settlementRule: "",
    sortOrder: contractHistoryList.value.length
  });
  contractDialogVisible.value = true;
};

// 编辑合同历史
const handleEditContract = (index: number) => {
  isEditContract.value = true;
  currentContractIndex.value = index;
  const contract = contractHistoryList.value[index];
  Object.assign(contractForm, {
    signingUnit: contract.signingUnit || "",
    contractStartTime: contract.contractStartTime || "",
    contractEndTime: contract.contractEndTime || "",
    executionDate: contract.executionDate || "",
    ratio: contract.ratio,
    taxRate: contract.taxRate,
    settlementRule: contract.settlementRule || "",
    sortOrder: contract.sortOrder || index
  });
  contractDialogVisible.value = true;
};

// 保存合同历史
const handleSaveContract = () => {
  if (isEditContract.value && currentContractIndex.value !== -1) {
    // 编辑模式
    contractHistoryList.value[currentContractIndex.value] = {
      ...contractHistoryList.value[currentContractIndex.value],
      ...contractForm
    };
  } else {
    // 新增模式
    contractHistoryList.value.push({
      ...contractForm,
      settlementDarrenId: expertForm.settlementDarrenId,
      expertNickname: expertForm.expertNickname,
      douyinId: expertForm.douyinId
    });
  }
  contractDialogVisible.value = false;
};

// 删除合同历史
const handleDeleteContract = (index: number) => {
  contractHistoryList.value.splice(index, 1);
};

// 保存达人信息和所有合同
const handleSave = async () => {
  if (contractHistoryList.value.length === 0) {
    ElMessage.warning("请至少添加一条合同记录");
    return;
  }

  try {
    // 为每个合同历史补充达人基础信息
    const contractsToSave = contractHistoryList.value.map(contract => ({
      ...contract,
      settlementDarrenId: expertForm.settlementDarrenId,
      expertNickname: expertForm.expertNickname,
      douyinId: expertForm.douyinId
    }));

    let res: any;
    if (isEdit.value) {
      // 编辑模式 - 这里假设接口支持批量更新，或者我们需要处理逻辑
      // 实际项目中可能需要根据后端接口调整
      res = await postDyExpertContractUpdate(contractsToSave);
    } else {
      // 新增模式
      res = await postDyExpertContractBatch(contractsToSave);
    }

    if (res.success) {
      ElMessage.success(isEdit.value ? "编辑成功" : "新增成功");
      dialogVisible.value = false;
      loadData();
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  }
};

// 删除合同 - 这里改为删除达人的所有合同，或者需要调整逻辑
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定要删除该达人的合同吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    // 这里需要根据实际后端接口调整，可能需要删除该达人的所有合同
    const res: any = await postDyExpertContractDelete(row.latestContractId);
    if (res.success) {
      ElMessage.success("删除成功");
      loadData();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="expert-contract">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="达人昵称">
              <el-input
                v-model="searchForm.expertNickname"
                placeholder="请输入达人昵称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="抖音号">
              <el-input
                v-model="searchForm.douyinId"
                placeholder="请输入抖音号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="签约单位">
              <el-input
                v-model="searchForm.signingUnit"
                placeholder="请输入签约单位"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="合同起始时间">
              <el-date-picker
                v-model="contractStartDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="合同结束时间">
              <el-date-picker
                v-model="contractEndDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><RefreshLeft /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 表格卡片 -->
    <el-card class="table-card" shadow="never">
      <div class="flex justify-between items-center mb-[10px]">
        <div class="text-lg font-medium">达人合同列表</div>
        <div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增达人合同
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <!-- 展开行列 -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <div class="mb-2 font-medium">合同历史列表：</div>
              <el-table
                :data="row.contractList || []"
                border
                style="width: 100%"
              >
                <el-table-column type="index" label="#" width="60" />
                <el-table-column
                  prop="signingUnit"
                  label="签约单位"
                  min-width="120"
                />
                <el-table-column
                  prop="contractStartTime"
                  label="合同起始时间"
                  width="130"
                />
                <el-table-column
                  prop="contractEndTime"
                  label="合同结束时间"
                  width="130"
                />
                <el-table-column
                  prop="executionDate"
                  label="执行日期"
                  width="120"
                />
                <el-table-column prop="ratio" label="比值" width="80" />
                <el-table-column prop="taxRate" label="税率" width="80" />
                <el-table-column
                  prop="settlementRule"
                  label="结算规则"
                  min-width="150"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="createdAt"
                  label="创建时间"
                  width="180"
                />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="expertNickname" label="达人昵称" width="150" />
        <el-table-column prop="douyinId" label="抖音号" width="150" />
        <el-table-column
          prop="settlementDarrenId"
          label="结算达人UID"
          width="180"
        />
        <el-table-column prop="signingUnit" label="签约单位" width="150" />
        <el-table-column label="最新合同时间" width="250">
          <template #default="{ row }">
            <div>
              <div>起始: {{ row.latestContractStartTime }}</div>
              <div>结束: {{ row.latestContractEndTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contractCount" label="合同数量" width="100" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1000px"
      :close-on-click-modal="false"
    >
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="text-lg font-medium">基础信息</div>
        </template>
        <el-form :model="expertForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="结算达人UID" required>
                <el-input
                  v-model="expertForm.settlementDarrenId"
                  placeholder="请输入结算达人UID"
                  :disabled="isEdit"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="达人昵称" required>
                <el-input
                  v-model="expertForm.expertNickname"
                  placeholder="请输入达人昵称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="抖音号" required>
                <el-input
                  v-model="expertForm.douyinId"
                  placeholder="请输入抖音号"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="text-lg font-medium">合同历史</div>
            <el-button type="primary" size="small" @click="handleAddContract">
              <el-icon><Plus /></el-icon>
              添加合同
            </el-button>
          </div>
        </template>
        <el-table :data="contractHistoryList" border style="width: 100%">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="signingUnit" label="签约单位" width="150" />
          <el-table-column
            prop="contractStartTime"
            label="合同起始时间"
            width="130"
          />
          <el-table-column
            prop="contractEndTime"
            label="合同结束时间"
            width="130"
          />
          <el-table-column prop="executionDate" label="执行日期" width="120" />
          <el-table-column prop="ratio" label="比值" width="100" />
          <el-table-column prop="taxRate" label="税率" width="100" />
          <el-table-column
            prop="settlementRule"
            label="结算规则"
            show-overflow-tooltip
          />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ $index }">
              <el-tooltip content="编辑" placement="top">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleEditContract($index)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleDeleteContract($index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 合同历史编辑对话框 -->
    <el-dialog
      v-model="contractDialogVisible"
      :title="isEditContract ? '编辑合同' : '新增合同'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="contractForm" label-width="120px">
        <el-form-item label="签约单位" required>
          <el-input
            v-model="contractForm.signingUnit"
            placeholder="请输入签约单位"
          />
        </el-form-item>
        <el-form-item label="合同起始时间" required>
          <el-date-picker
            v-model="contractForm.contractStartTime"
            type="date"
            placeholder="选择起始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="合同结束时间" required>
          <el-date-picker
            v-model="contractForm.contractEndTime"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="执行日期">
          <el-date-picker
            v-model="contractForm.executionDate"
            type="date"
            placeholder="选择执行日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="比值">
          <el-input-number
            v-model="contractForm.ratio"
            :min="0"
            :precision="4"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="开票税率">
          <el-input-number
            v-model="contractForm.taxRate"
            :min="0"
            :precision="4"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结算规则">
          <el-input
            v-model="contractForm.settlementRule"
            type="textarea"
            :rows="3"
            placeholder="请输入结算规则"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="contractForm.sortOrder"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="contractDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveContract">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.expert-contract {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-top: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 表格字体变小 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th),
:deep(.el-table td) {
  padding: 8px 0;
}

/* 间距样式 */
.mb-4 {
  margin-bottom: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.text-lg {
  font-size: 16px;
}

.font-medium {
  font-weight: 500;
}

/* 展开内容样式 */
.expand-content {
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
