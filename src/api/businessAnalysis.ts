// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

// 测试环境地址
// const commonUrlApi = (url: string) => `${"http://12.18.1.36:8085"}${url}`;
// 生产环境地址
const commonUrlApi = (url: string) => `${"https://api.peidigroup.cn"}${url}`;

/** 获取经营分析会核心指标达成总览 */
export const getBusinessAnalysisOverviewList = (params: { date?: string }) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/business-analysis-overview/list"),
    {
      params
    }
  );
};

/** 获取经营分析会团队指标达成 */
export const getBusinessAnalysisGroupList = (params: { date?: string }) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/business-analysis-group/list"),
    {
      params
    }
  );
};

/** 获取经营分析会产品结构 */
export const getBusinessAnalysisProductList = (params: { date?: string }) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/business-analysis-product/list"),
    {
      params
    }
  );
};

/** 获取经营分析会成本结构 */
export const getBusinessAnalysisCostList = (params: { date?: string }) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/business-analysis-cost/list"),
    {
      params
    }
  );
};

/** 团队配置表 */
export interface BiTeamConfig {
  /** 配置信息(JSON格式) */
  configJson?: string;
  /** 创建时间 */
  createAt?: string;
  id?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 团队名称 */
  teamName?: string;
  /** 更新时间 */
  updateAt?: string;
  [property: string]: any;
}

/** 团队收入指标表 */
export interface BiTeamIncomeTarget {
  /** 达成情况(%) = ROUND((本期累计/预算指标)*100,0) */
  achievementStatus?: number;
  /** 年度预算(万元) */
  annualTarget?: number;
  /** 创建时间 */
  createAt?: string;
  id?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 去年同期收入(万元) */
  lastYearIncome?: number;
  /** 达成进度(%) = ROUND((本期累计/年度预算)*100,0) */
  progress?: number;
  /** 统计日期 */
  statisticsDate?: string;
  /** 预算指标(万元) */
  targetAmount?: number;
  /** 关联团队配置（查询时填充） */
  teamConfig?: BiTeamConfig;
  /** 团队名称id */
  teamConfigId?: number;
  /** 更新时间 */
  updateAt?: string;
  /** 同比(%) = ROUND(((本期累计-去年同期)/去年同期*100),0) */
  yearOnYear?: number;
  [property: string]: any;
}

/** 查询所有团队配置列表 */
export const getTeamConfigList = () => {
  return http.request<ApiResponse<BiTeamConfig[]>>(
    "get",
    commonUrlApi("/oms/bi/team-config/list")
  );
};

/** 新增团队配置 */
export const addTeamConfig = (data: BiTeamConfig) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/team-config/new"),
    {
      data
    }
  );
};

/** 更新团队配置 */
export const updateTeamConfig = (data: BiTeamConfig) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/team-config/update"),
    {
      data
    }
  );
};

/** 删除团队配置 */
export const deleteTeamConfig = (data: BiTeamConfig) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/team-config/delete"),
    {
      data
    }
  );
};

/** 查询所有团队收入指标列表 */
export const getTeamIncomeTargetList = () => {
  return http.request<ApiResponse<BiTeamIncomeTarget[]>>(
    "get",
    commonUrlApi("/oms/bi/team-income-target/list")
  );
};

/** 新增团队收入指标 */
export const addTeamIncomeTarget = (data: BiTeamIncomeTarget) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/team-income-target/new"),
    {
      data
    }
  );
};

/** 更新团队收入指标 */
export const updateTeamIncomeTarget = (data: BiTeamIncomeTarget) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/team-income-target/update"),
    {
      data
    }
  );
};

/** 删除团队收入指标 */
export const deleteTeamIncomeTarget = (data: BiTeamIncomeTarget) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/team-income-target/delete"),
    {
      data
    }
  );
};

/** 产品类别树形结构 */
export interface BiProductCategoryTree {
  /** 品牌 */
  brand?: string;
  /** 类别编码 */
  categoryCode?: string;
  /** 层级：1-一级，2-二级，3-三级 */
  categoryLevel?: number;
  /** 类别名称 */
  categoryName?: string;
  /** 路径（如：/爵宴/风干零食） */
  categoryPath?: string;
  /** 类别类型：产品类/系列/单品 */
  categoryType?: string;
  /** 子节点（用于批量导入树形结构） */
  children?: BiProductCategoryTree[];
  /** 创建时间 */
  createAt?: string;
  id?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 父级类别编码（null表示根节点） */
  parentCode?: string;
  /** 父级ID */
  parentId?: number;
  /** ID路径（如：1/2/3） */
  pathIds?: string;
  /** 产品线 */
  productLine?: string;
  /** 排序 */
  sortOrder?: number;
  /** 更新时间 */
  updateAt?: string;
  [property: string]: any;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  success: boolean;
  data: T;
}

/** 查询所有产品类别列表 */
export const getProductCategoryTreeList = () => {
  return http.request<ApiResponse<BiProductCategoryTree[]>>(
    "get",
    commonUrlApi("/oms/bi/product-category-tree/list")
  );
};

/** 新增产品类别 */
export const addProductCategoryTree = (data: BiProductCategoryTree) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/product-category-tree/new"),
    {
      data
    }
  );
};

/** 更新产品类别 */
export const updateProductCategoryTree = (data: BiProductCategoryTree) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/product-category-tree/update"),
    {
      data
    }
  );
};

/** 删除产品类别 */
export const deleteProductCategoryTree = (data: BiProductCategoryTree) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/product-category-tree/delete"),
    {
      data
    }
  );
};

/** 成本类别分组表 */
export interface BiCostCategoryGroup {
  /** 创建时间 */
  createdAt?: string;
  /** 分组代码：COST/FEE/ADJUST */
  groupCode?: string;
  /** 分组名 */
  groupName?: string;
  id?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 分组排序 */
  sortOrder?: number;
  /** 更新时间 */
  updatedAt?: string;
  [property: string]: any;
}

/** 查询所有成本类别分组列表 */
export const getCostCategoryGroupList = () => {
  return http.request<ApiResponse<BiCostCategoryGroup[]>>(
    "get",
    commonUrlApi("/oms/bi/cost-category-group/list")
  );
};

/** 新增成本类别分组 */
export const addCostCategoryGroup = (data: BiCostCategoryGroup) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/cost-category-group/new"),
    {
      data
    }
  );
};

/** 更新成本类别分组 */
export const updateCostCategoryGroup = (data: BiCostCategoryGroup) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/cost-category-group/update"),
    {
      data
    }
  );
};

/** 删除成本类别分组 */
export const deleteCostCategoryGroup = (id: number) => {
  return http.request<ApiResponse>(
    "get",
    commonUrlApi("/oms/bi/cost-category-group/delete"),
    {
      params: { id }
    }
  );
};

/** 成本结构表 */
export interface BiCostCategory {
  /** 成本类别分组ID（关联bi_cost_category_group表的id字段） */
  categoryGroupId?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 本期累计 */
  currentCost?: number;
  /** 关联的分组信息（非持久化） */
  group?: BiCostCategoryGroup;
  id?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 排序序号 */
  sortOrder?: number;
  /** 更新时间 */
  updatedAt?: string;
  /** 同比变化(%) */
  yoyChange?: number;
  [property: string]: any;
}

/** 关联查询成本类别及其分组信息 */
export const getCostCategoryListWithGroup = () => {
  return http.request<ApiResponse<BiCostCategory[]>>(
    "get",
    commonUrlApi("/oms/bi/cost-category/listWithGroup")
  );
};

/** 新增成本类别 */
export const addCostCategory = (data: BiCostCategory) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/cost-category/new"),
    {
      data
    }
  );
};

/** 更新成本类别 */
export const updateCostCategory = (data: BiCostCategory) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/cost-category/update"),
    {
      data
    }
  );
};

/** 删除成本类别 */
export const deleteCostCategory = (id: number) => {
  return http.request<ApiResponse>(
    "get",
    commonUrlApi("/oms/bi/cost-category/delete"),
    {
      params: { id }
    }
  );
};

/** 指标达成总表配置表 */
export interface BiIndicatorSummaryConfig {
  /** 配置名称 */
  configName?: string;
  /** 创建时间 */
  createdAt?: string;
  id?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 排序 */
  sortOrder?: number;
  /** 更新时间 */
  updatedAt?: string;
  [property: string]: any;
}

/** 搜索查询指标达成总表配置列表 */
export const getIndicatorSummaryConfigList = (params?: {
  searchStr?: string;
}) => {
  return http.request<ApiResponse<BiIndicatorSummaryConfig[]>>(
    "get",
    commonUrlApi("/oms/bi/indicator-summary-config/list"),
    { params }
  );
};

/** 新增指标达成总表配置 */
export const addIndicatorSummaryConfig = (data: BiIndicatorSummaryConfig) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/indicator-summary-config/new"),
    { data }
  );
};

/** 更新指标达成总表配置 */
export const updateIndicatorSummaryConfig = (
  data: BiIndicatorSummaryConfig
) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/indicator-summary-config/update"),
    { data }
  );
};

/** 删除指标达成总表配置 */
export const deleteIndicatorSummaryConfig = (id: number) => {
  return http.request<ApiResponse>(
    "get",
    commonUrlApi("/oms/bi/indicator-summary-config/delete"),
    {
      params: { id }
    }
  );
};

/** 指标达成总览表 */
export interface BiIndicatorSummary {
  /** 全年预算 */
  annualBudget?: number;
  /** 全年进度(%) */
  annualProgress?: number;
  /** 完成率(%) */
  completionRate?: number;
  /** 关联的配置信息（非持久化） */
  config?: BiIndicatorSummaryConfig;
  /** 创建时间 */
  createdAt?: string;
  /** 当期实际 */
  currentActual?: number;
  /** 当期预算 */
  currentBudget?: number;
  /** 增减率(%) */
  growthRate?: number;
  id?: number;
  /** 指标达成总表配置id */
  indicatorSummaryConfigId?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 去年同期 */
  lastYearActual?: number;
  /** 更新时间 */
  updatedAt?: string;
  [property: string]: any;
}

/** 搜索查询指标达成总览列表 */
export const getIndicatorSummaryList = (params?: { searchStr?: string }) => {
  return http.request<ApiResponse<BiIndicatorSummary[]>>(
    "get",
    commonUrlApi("/oms/bi/indicator-summary/list"),
    { params }
  );
};

/** 新增指标达成总览 */
export const addIndicatorSummary = (data: BiIndicatorSummary) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/indicator-summary/new"),
    { data }
  );
};

/** 更新指标达成总览 */
export const updateIndicatorSummary = (data: BiIndicatorSummary) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/indicator-summary/update"),
    { data }
  );
};

/** 删除指标达成总览 */
export const deleteIndicatorSummary = (id: number) => {
  return http.request<ApiResponse>(
    "get",
    commonUrlApi("/oms/bi/indicator-summary/delete"),
    {
      params: { id }
    }
  );
};

/** 产品类别收入对照数据表 */
export interface BiProductCategoryIncome {
  /** 年度预算 */
  annualTarget?: number;
  /** 关联产品类别树ID */
  biProductCategoryTreeId?: number;
  /** 关联产品类别树名称（查询时填充） */
  categoryName?: string;
  child?: BiProductCategoryIncome[];
  /** 达成进度(%) */
  completionProgress?: number;
  /** 创建时间 */
  createAt?: string;
  /** 收入 */
  currentIncome?: number;
  /** 毛利率(%) */
  grossProfitRate?: number;
  id?: number;
  /** 占比(%) */
  incomeRatio?: number;
  /** 是否删除：0-未删除，1-已删除 */
  isDel?: number;
  /** 父级ID（汇总记录ID，明细数据关联汇总） */
  parentId?: number;
  /** 更新时间 */
  updateAt?: string;
  /** 同比变化(%) */
  yearOnYearChange?: number;
  [property: string]: any;
}

/** 查询所有产品类别收入列表（关联类别名称） */
export const getProductCategoryIncomeList = () => {
  return http.request<ApiResponse<BiProductCategoryIncome[]>>(
    "get",
    commonUrlApi("/oms/bi/product-category-income/list")
  );
};

/** 新增产品类别收入 */
export const addProductCategoryIncome = (data: BiProductCategoryIncome) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/product-category-income/new"),
    { data }
  );
};

/** 更新产品类别收入 */
export const updateProductCategoryIncome = (data: BiProductCategoryIncome) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/product-category-income/update"),
    { data }
  );
};

/** 删除产品类别收入 */
export const deleteProductCategoryIncome = (data: BiProductCategoryIncome) => {
  return http.request<ApiResponse>(
    "post",
    commonUrlApi("/oms/bi/product-category-income/delete"),
    { data }
  );
};
