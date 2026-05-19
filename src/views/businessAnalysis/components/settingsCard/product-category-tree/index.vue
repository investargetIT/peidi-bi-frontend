<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getProductCategoryTreeList,
  addProductCategoryTree,
  updateProductCategoryTree,
  getProductCategoryIncomeList,
  addProductCategoryIncome,
  updateProductCategoryIncome,
  type BiProductCategoryTree,
  type BiProductCategoryIncome
} from "@/api/businessAnalysis";
import { Plus, Search, Edit, Delete, FolderOpened } from "@element-plus/icons-vue";

const activeTab = ref("income");

// 产品类别树相关
const tableData = ref<BiProductCategoryTree[]>([]);
const treeData = ref<BiProductCategoryTree[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const currentRow = ref<BiProductCategoryTree>({});
const formData = ref<BiProductCategoryTree>({
  categoryName: "",
  categoryCode: "",
  categoryType: "",
  parentCode: null,
  parentId: null,
  sortOrder: 0,
  productLine: "",
  brand: ""
});
const searchText = ref("");

const filteredTableData = computed(() => {
  if (!searchText.value) return tableData.value.sort((a, b) => a.id - b.id);
  return tableData.value
    .filter(
      item =>
        item.categoryName?.includes(searchText.value) ||
        item.categoryCode?.includes(searchText.value) ||
        item.categoryPath?.includes(searchText.value)
    )
    .sort((a, b) => a.id - b.id);
});

const listToTree = (list: BiProductCategoryTree[]): BiProductCategoryTree[] => {
  const map = new Map<number, BiProductCategoryTree>();
  const roots: BiProductCategoryTree[] = [];

  list.forEach(item => {
    map.set(item.id!, { ...item, children: [] });
  });

  list.forEach(item => {
    const node = map.get(item.id!);
    if (!node) return;

    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortTree = (nodes: BiProductCategoryTree[]) => {
    nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };
  sortTree(roots);

  return roots;
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res: any = await getProductCategoryTreeList();
    if (res.success) {
      tableData.value = res.data || [];
      treeData.value = listToTree(res.data || []);
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = (parent?: BiProductCategoryTree) => {
  isEdit.value = false;
  if (parent) {
    formData.value = {
      categoryName: "",
      categoryCode: "",
      categoryType: "",
      parentCode: parent.categoryCode,
      parentId: parent.id,
      categoryLevel: (parent.categoryLevel || 0) + 1,
      sortOrder: 0,
      productLine: parent.productLine || "",
      brand: parent.brand || ""
    };
  } else {
    formData.value = {
      categoryName: "",
      categoryCode: "",
      categoryType: "",
      parentCode: "ROOT",
      parentId: 1,
      categoryLevel: 1,
      sortOrder: 0,
      productLine: "",
      brand: ""
    };
  }
  dialogVisible.value = true;
};

const handleEdit = (row: BiProductCategoryTree) => {
  isEdit.value = true;
  currentRow.value = row;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: BiProductCategoryTree) => {
  try {
    await ElMessageBox.confirm(
      `确认删除产品类别"${row.categoryName}"吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    ElMessage.success("删除功能待接口完善");
    await fetchList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleSubmit = async () => {
  if (!formData.value.categoryName?.trim()) {
    ElMessage.warning("请输入类别名称");
    return;
  }
  if (!formData.value.categoryCode?.trim()) {
    ElMessage.warning("请输入类别编码");
    return;
  }

  if (submitLoading.value) return;
  submitLoading.value = true;

  try {
    const res: any = isEdit.value
      ? await updateProductCategoryTree(formData.value)
      : await addProductCategoryTree(formData.value);

    if (res.success) {
      ElMessage.success(isEdit.value ? "更新成功" : "新增成功");
      dialogVisible.value = false;
      await fetchList();
    } else {
      ElMessage.error(res.msg || (isEdit.value ? "更新失败" : "新增失败"));
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? "更新失败" : "新增失败");
  } finally {
    submitLoading.value = false;
  }
};

// 产品类别收入相关
const incomeTableData = ref<BiProductCategoryIncome[]>([]);
const incomeLoading = ref(false);
const incomeDialogVisible = ref(false);
const incomeIsEdit = ref(false);
const incomeSubmitLoading = ref(false);
const incomeStep = ref(1); // 1: 选择二级节点, 2: 选择子节点并填写表单
const selectedSecondLevelNode = ref<BiProductCategoryTree | null>(null);
const selectedChildNodes = ref<{ node: BiProductCategoryTree; form: BiProductCategoryIncome }[]>([]);
const incomeFormData = ref<BiProductCategoryIncome>({
  biProductCategoryTreeId: undefined,
  currentIncome: undefined,
  incomeRatio: undefined,
  yearOnYearChange: undefined,
  grossProfitRate: undefined,
  annualTarget: undefined,
  completionProgress: undefined
});
const parentEditForm = ref<Partial<BiProductCategoryIncome>>({}); // 父级编辑表单
const incomeSearchText = ref("");

const filterTree = (list: BiProductCategoryIncome[], keyword: string): BiProductCategoryIncome[] => {
  if (!keyword) return list;
  return list
    .map(item => {
      const filteredChildren = item.child ? filterTree(item.child, keyword) : [];
      const match = item.categoryName?.includes(keyword);
      if (match || filteredChildren.length > 0) {
        return { ...item, child: filteredChildren.length > 0 ? filteredChildren : item.child };
      }
      return null;
    })
    .filter(Boolean) as BiProductCategoryIncome[];
};

const filteredIncomeTableData = computed(() => {
  return filterTree(incomeTableData.value, incomeSearchText.value);
});

const fetchIncomeList = async () => {
  incomeLoading.value = true;
  try {
    const res: any = await getProductCategoryIncomeList();
    if (res.success) {
      incomeTableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取列表失败");
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  } finally {
    incomeLoading.value = false;
  }
};

const handleIncomeAdd = () => {
  incomeIsEdit.value = false;
  incomeStep.value = 1;
  selectedSecondLevelNode.value = null;
  selectedChildNodes.value = [];
  parentEditForm.value = {}; // 重置父级表单
  incomeDialogVisible.value = true;
};

// 获取第二级节点（根节点的直接子节点）
const getSecondLevelNodes = computed(() => {
  // 直接取根节点的所有子节点作为第二级节点
  const secondLevelNodes: BiProductCategoryTree[] = [];
  treeData.value.forEach(root => {
    if (root.children && root.children.length > 0) {
      secondLevelNodes.push(...root.children);
    }
  });
  return secondLevelNodes;
});

// 获取选中二级节点的子节点
const getChildNodesOfSelected = computed(() => {
  if (!selectedSecondLevelNode.value) return [];
  return selectedSecondLevelNode.value.children || [];
});

// 选择二级节点
const selectSecondLevelNode = (node: BiProductCategoryTree) => {
  selectedSecondLevelNode.value = node;
  selectedChildNodes.value = [];
  incomeStep.value = 2;
};

// 切换子节点选择
const toggleChildNodeSelection = (node: BiProductCategoryTree) => {
  const index = selectedChildNodes.value.findIndex(item => item.node.id === node.id);
  if (index > -1) {
    selectedChildNodes.value.splice(index, 1);
  } else {
    selectedChildNodes.value.push({
      node,
      form: {
        biProductCategoryTreeId: node.id,
        currentIncome: undefined,
        incomeRatio: undefined,
        yearOnYearChange: undefined,
        grossProfitRate: undefined,
        annualTarget: undefined,
        completionProgress: undefined
      }
    });
  }
};

// 检查节点是否已选中
const isChildNodeSelected = (nodeId: number | undefined) => {
  return selectedChildNodes.value.some(item => item.node.id === nodeId);
};

// 返回上一步
const goBackToStep1 = () => {
  incomeStep.value = 1;
};

// 计算父节点汇总数据
const calculateParentSummary = () => {
  if (selectedChildNodes.value.length === 0 || !selectedSecondLevelNode.value) return null;

  const totalCurrentIncome = selectedChildNodes.value.reduce((sum, item) => sum + (item.form.currentIncome || 0), 0);
  const totalAnnualTarget = selectedChildNodes.value.reduce((sum, item) => sum + (item.form.annualTarget || 0), 0);

  return {
    biProductCategoryTreeId: selectedSecondLevelNode.value.id,
    currentIncome: totalCurrentIncome,
    annualTarget: totalAnnualTarget,
    completionProgress: totalAnnualTarget > 0 ? (totalCurrentIncome / totalAnnualTarget) * 100 : undefined
  };
};

const handleIncomeEdit = (row: BiProductCategoryIncome) => {
  // 只有父节点（有child的节点）可以编辑
  if (!row.child || row.child.length === 0) {
    ElMessage.warning("只能编辑父节点，请选择有子节点的数据进行编辑");
    return;
  }

  incomeIsEdit.value = true;
  incomeStep.value = 2; // 编辑时直接到第二步

  // 保存原始数据
  incomeFormData.value = { ...row };

  // 初始化父级编辑表单（复制除了自动计算的字段外的所有字段）
  parentEditForm.value = {
    yearOnYearChange: row.yearOnYearChange,
    grossProfitRate: row.grossProfitRate
  };

  // 找到对应的二级节点
  const findNode = (nodes: BiProductCategoryTree[], targetId: number | undefined): BiProductCategoryTree | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  selectedSecondLevelNode.value = findNode(treeData.value, row.biProductCategoryTreeId);

  // 填充已有的子节点数据，标记已存在的子节点
  selectedChildNodes.value = [];
  if (row.child && row.child.length > 0) {
    row.child.forEach(childRow => {
      const childNode = findNode(treeData.value, childRow.biProductCategoryTreeId);
      if (childNode) {
        selectedChildNodes.value.push({
          node: childNode,
          form: { ...childRow },
          isExisting: true // 标记已存在的子节点
        });
      }
    });
  }

  incomeDialogVisible.value = true;
};

const handleIncomeDelete = async (row: BiProductCategoryIncome) => {
  try {
    await ElMessageBox.confirm(
      `确认删除产品类别收入"${row.categoryName}"吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    ElMessage.success("删除功能待接口完善");
    await fetchIncomeList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleIncomeSubmit = async () => {
  if (selectedChildNodes.value.length === 0) {
    ElMessage.warning("请至少选择一个子节点");
    return;
  }

  // 验证每个选中的子节点都填写了必要数据
  for (const item of selectedChildNodes.value) {
    if (item.form.currentIncome === undefined || item.form.currentIncome === null) {
      ElMessage.warning(`请填写 ${item.node.categoryName} 的收入`);
      return;
    }
  }

  if (incomeSubmitLoading.value) return;
  incomeSubmitLoading.value = true;

  try {
    // 计算父节点汇总数据
    const parentSummary = calculateParentSummary();

    // 构建提交的数据结构
    const submitData = {
      ...(incomeIsEdit.value ? incomeFormData.value : {}), // 编辑时带上原始数据的 id 等字段
      ...parentSummary,
      ...(incomeIsEdit.value ? parentEditForm.value : {}), // 编辑时合并父级表单数据
      categoryName: selectedSecondLevelNode.value?.categoryName,
      child: selectedChildNodes.value.map(item => ({
        ...item.form,
        categoryName: item.node.categoryName
      }))
    };

    // 根据是新增还是编辑调用不同的接口
    const res: any = incomeIsEdit.value
      ? await updateProductCategoryIncome(submitData)
      : await addProductCategoryIncome(submitData);

    if (res.success) {
      ElMessage.success(incomeIsEdit.value ? "更新成功" : "新增成功");
      incomeDialogVisible.value = false;
      await fetchIncomeList();
    } else {
      ElMessage.error(res.msg || (incomeIsEdit.value ? "更新失败" : "新增失败"));
    }
  } catch (error) {
    ElMessage.error(incomeIsEdit.value ? "更新失败" : "新增失败");
  } finally {
    incomeSubmitLoading.value = false;
  }
};

onMounted(() => {
  fetchList();
  fetchIncomeList();
});
</script>

<template>
  <div class="product-category-tree-wrapper">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="产品类别收入" name="income">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="incomeSearchText"
              placeholder="搜索类别名称"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleIncomeAdd()"
            >新增收入</el-button
          >
        </div>

        <el-card shadow="never" class="table-card">
          <el-table
            v-loading="incomeLoading"
            :data="filteredIncomeTableData"
            border
            stripe
            row-key="id"
            :tree-props="{ children: 'child', hasChildren: 'hasChildren' }"
            default-expand-all
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="categoryName" label="类别名称" min-width="200" />
            <el-table-column prop="currentIncome" label="收入" width="120">
              <template #default="{ row }">
                {{ row.currentIncome?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="incomeRatio" label="占比(%)" width="120">
              <template #default="{ row }">
                {{ row.incomeRatio?.toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column prop="yearOnYearChange" label="同比变化(%)" width="140">
              <template #default="{ row }">
                <el-tag
                  v-if="row.yearOnYearChange !== null && row.yearOnYearChange !== undefined"
                  :type="row.yearOnYearChange >= 0 ? 'success' : 'danger'"
                >
                  {{ row.yearOnYearChange > 0 ? "+" : "" }}{{ row.yearOnYearChange?.toFixed(2) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="grossProfitRate" label="毛利率(%)" width="120">
              <template #default="{ row }">
                {{ row.grossProfitRate?.toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column prop="annualTarget" label="年度预算" width="120">
              <template #default="{ row }">
                {{ row.annualTarget?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="completionProgress" label="达成进度(%)" width="140">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.completionProgress || 0"
                  :color="
                    row.completionProgress && row.completionProgress >= 100
                      ? '#67c23a'
                      : row.completionProgress && row.completionProgress >= 50
                      ? '#e6a23c'
                      : '#f56c6c'
                  "
                />
              </template>
            </el-table-column>
            <el-table-column prop="createAt" label="创建时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <!-- 只有父节点（有child的）显示编辑按钮，不显示删除按钮 -->
                <el-button
                  v-if="row.child && row.child.length > 0"
                  type="primary"
                  link
                  size="small"
                  :icon="Edit"
                  @click="handleIncomeEdit(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-dialog
          v-model="incomeDialogVisible"
          :title="incomeIsEdit ? '编辑产品类别收入' : '新增产品类别收入'"
          width="800px"
        >
          <!-- 步骤1: 选择二级节点（仅新增时显示） -->
          <div v-if="incomeStep === 1 && !incomeIsEdit">
            <div class="step-title">第一步：选择二级节点</div>
            <el-card class="node-selection-card">
              <el-empty v-if="getSecondLevelNodes.length === 0" description="暂无二级节点数据，请先在产品类别树中配置">
                <el-button type="primary" @click="incomeDialogVisible = false; activeTab = 'tree'">去配置</el-button>
              </el-empty>
              <el-space v-else wrap>
                <el-button
                  v-for="node in getSecondLevelNodes"
                  :key="node.id"
                  :type="selectedSecondLevelNode?.id === node.id ? 'primary' : 'default'"
                  @click="selectSecondLevelNode(node)"
                >
                  {{ node.categoryName }}
                </el-button>
              </el-space>
            </el-card>
          </div>

          <!-- 步骤2: 选择子节点并填写表单（新增和编辑共用） -->
          <div v-if="incomeStep === 2">
            <div class="step-title">
              {{ incomeIsEdit ? '编辑子节点数据' : '第二步：选择子节点并填写表单' }}
              <el-button v-if="!incomeIsEdit" link type="primary" @click="goBackToStep1">返回上一步</el-button>
            </div>
            <div class="selected-parent-info">
              当前二级节点：<strong>{{ selectedSecondLevelNode?.categoryName }}</strong>
            </div>

            <!-- 父级表单（新增和编辑都显示） -->
            <el-card class="parent-edit-card">
              <template #header>
                <div class="card-subtitle">父节点数据（收入、年度预算自动计算，其他可编辑）</div>
              </template>
              <el-form label-width="120px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="收入">
                      <el-input-number
                        :model-value="calculateParentSummary()?.currentIncome"
                        :precision="2"
                        disabled
                        style="width: 100%"
                        placeholder="自动计算"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="占比(%)">
                      <el-input-number
                        v-model="parentEditForm.incomeRatio"
                        :precision="2"
                        :step="0.01"
                        style="width: 100%"
                        placeholder="请输入占比"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="同比变化(%)">
                      <el-input-number
                        v-model="parentEditForm.yearOnYearChange"
                        :precision="2"
                        :step="0.01"
                        style="width: 100%"
                        placeholder="请输入同比变化"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="毛利率(%)">
                      <el-input-number
                        v-model="parentEditForm.grossProfitRate"
                        :precision="2"
                        :step="0.01"
                        style="width: 100%"
                        placeholder="请输入毛利率"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="年度预算">
                      <el-input-number
                        :model-value="calculateParentSummary()?.annualTarget"
                        :precision="2"
                        disabled
                        style="width: 100%"
                        placeholder="自动计算"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="达成进度(%)">
                      <div style="padding-top: 8px">
                        <el-progress
                          :percentage="calculateParentSummary()?.completionProgress || 0"
                          :color="
                            calculateParentSummary()?.completionProgress && calculateParentSummary()?.completionProgress >= 100
                              ? '#67c23a'
                              : calculateParentSummary()?.completionProgress && calculateParentSummary()?.completionProgress >= 50
                              ? '#e6a23c'
                              : '#f56c6c'
                          "
                        />
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-card>

            <!-- 子节点选择区 -->
            <el-card class="child-selection-card">
              <div class="card-subtitle">请选择要添加的子节点：</div>
              <el-empty v-if="getChildNodesOfSelected.length === 0" description="该节点下没有子节点">
              </el-empty>
              <el-space v-else wrap>
                <el-button
                  v-for="node in getChildNodesOfSelected"
                  :key="node.id"
                  :type="isChildNodeSelected(node.id) ? 'success' : 'default'"
                  @click="toggleChildNodeSelection(node)"
                >
                  {{ isChildNodeSelected(node.id) ? '✓ ' : '' }}{{ node.categoryName }}
                </el-button>
              </el-space>
            </el-card>

            <!-- 已选子节点表单区 -->
            <div v-if="selectedChildNodes.length > 0" class="child-forms-section">
              <div class="card-subtitle">{{ incomeIsEdit ? '编辑各子节点数据' : '填写各子节点数据' }}：</div>
              <el-card v-for="item in selectedChildNodes" :key="item.node.id" class="child-form-card">
                <template #header>
                  <div class="child-form-header">
                    <span>{{ item.node.categoryName }}</span>
                    <el-button v-if="!item.isExisting" link type="danger" size="small" @click="toggleChildNodeSelection(item.node)">移除</el-button>
                  </div>
                </template>
                <el-form label-width="120px">
                  <el-form-item label="收入">
                    <el-input-number
                      v-model="item.form.currentIncome"
                      :precision="2"
                      :step="1"
                      style="width: 100%"
                      placeholder="请输入收入"
                    />
                  </el-form-item>
                  <el-form-item label="占比(%)">
                    <el-input-number
                      v-model="item.form.incomeRatio"
                      :precision="2"
                      :step="0.01"
                      style="width: 100%"
                      placeholder="请输入占比"
                    />
                  </el-form-item>
                  <el-form-item label="同比变化(%)">
                    <el-input-number
                      v-model="item.form.yearOnYearChange"
                      :precision="2"
                      :step="0.01"
                      style="width: 100%"
                      placeholder="请输入同比变化"
                    />
                  </el-form-item>
                  <el-form-item label="毛利率(%)">
                    <el-input-number
                      v-model="item.form.grossProfitRate"
                      :precision="2"
                      :step="0.01"
                      style="width: 100%"
                      placeholder="请输入毛利率"
                    />
                  </el-form-item>
                  <el-form-item label="年度预算">
                    <el-input-number
                      v-model="item.form.annualTarget"
                      :precision="2"
                      :step="1"
                      style="width: 100%"
                      placeholder="请输入年度预算"
                    />
                  </el-form-item>
                  <el-form-item label="达成进度(%)">
                    <el-input-number
                      v-model="item.form.completionProgress"
                      :precision="2"
                      :step="0.01"
                      style="width: 100%"
                      placeholder="请输入达成进度"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </div>

          <template #footer>
            <el-button @click="incomeDialogVisible = false">取消</el-button>
            <el-button
              v-if="incomeStep === 2"
              type="primary"
              :loading="incomeSubmitLoading"
              @click="handleIncomeSubmit"
              :disabled="selectedChildNodes.length === 0"
            >
              确定
            </el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="产品类别树" name="tree">
        <div class="toolbar">
          <div class="search-bar">
            <el-input
              v-model="searchText"
              placeholder="搜索类别名称/编码/路径"
              clearable
              :prefix-icon="Search"
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Plus" @click="handleAdd()"
            >新增根类别</el-button
          >
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="never" class="tree-card">
              <template #header>
                <div class="card-header">
                  <span>树形结构</span>
                </div>
              </template>
              <el-tree
                :data="treeData"
                :props="{ label: 'categoryName', children: 'children' }"
                node-key="id"
                default-expand-all
                :expand-on-click-node="false"
              >
                <template #default="{ node, data }">
                  <div class="tree-node">
                    <span class="node-label">{{ node.label }}</span>
                    <span class="node-actions">
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click.stop="handleAdd(data)"
                      >
                        新增子节点
                      </el-button>
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click.stop="handleEdit(data)"
                      >
                        编辑
                      </el-button>
                    </span>
                  </div>
                </template>
              </el-tree>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="never" class="table-card">
              <template #header>
                <div class="card-header">
                  <span>列表详情</span>
                </div>
              </template>
              <el-table
                v-loading="loading"
                :data="filteredTableData"
                border
                stripe
                height="500"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="categoryName" label="类别名称" width="150" />
                <el-table-column prop="categoryCode" label="类别编码" width="150" />
                <el-table-column
                  prop="categoryLevel"
                  label="层级"
                  width="80"
                  :formatter="row => `${row.categoryLevel || 0}级`"
                />
                <el-table-column prop="categoryType" label="类别类型" width="100" />
                <el-table-column prop="brand" label="品牌" width="100" />
                <el-table-column prop="productLine" label="产品线" width="120" />
                <el-table-column prop="sortOrder" label="排序" width="80" />
                <el-table-column label="操作" width="80" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      :icon="Edit"
                      @click="handleEdit(row)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-dialog
          v-model="dialogVisible"
          :title="isEdit ? '编辑产品类别' : '新增产品类别'"
          width="600px"
        >
          <el-form label-width="100px">
            <el-form-item label="类别名称">
              <el-input
                v-model="formData.categoryName"
                placeholder="请输入类别名称"
              />
            </el-form-item>
            <el-form-item label="类别编码">
              <el-input
                v-model="formData.categoryCode"
                placeholder="请输入类别编码"
              />
            </el-form-item>
            <el-form-item label="类别类型">
              <el-select
                v-model="formData.categoryType"
                placeholder="请选择类别类型"
                style="width: 100%"
              >
                <el-option label="根节点" value="根节点" />
                <el-option label="品牌" value="品牌" />
                <el-option label="系列" value="系列" />
                <el-option label="单品" value="单品" />
              </el-select>
            </el-form-item>
            <el-form-item label="层级">
              <el-input
                v-model="formData.categoryLevel"
                type="number"
                placeholder="请输入层级"
                disabled
              />
            </el-form-item>
            <el-form-item label="品牌">
              <el-input v-model="formData.brand" placeholder="请输入品牌" />
            </el-form-item>
            <el-form-item label="产品线">
              <el-input v-model="formData.productLine" placeholder="请输入产品线" />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number
                v-model="formData.sortOrder"
                :min="0"
                placeholder="排序"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.product-category-tree-wrapper {
  width: 100%;
  padding: 20px;

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .tree-card,
  .table-card {
    .card-header {
      font-weight: 600;
    }
  }

  .tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 8px;

    .node-label {
      flex: 1;
    }

    .node-actions {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .node-actions {
      opacity: 1;
    }
  }
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-parent-info {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.node-selection-card,
.child-selection-card,
.parent-edit-card {
  margin-bottom: 16px;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.child-forms-section {
  margin-top: 16px;
}

.child-form-card {
  margin-bottom: 16px;
}

.child-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.summary-card {
  margin-top: 16px;
}

.summary-header {
  font-weight: 600;
  color: #67c23a;
}

.summary-content {
  padding: 8px 0;
}
</style>
