import { http } from "@/utils/http";

// 测试环境地址
// const commonUrlApi = (url: string) => `${"http://12.18.1.36:8085"}${url}`
const commonUrlApi = (url: string) => `${"https://api.peidigroup.cn"}${url}`;

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
  /** 本期累计收入(万元) */
  currentIncome?: number;
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

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  success: boolean;
  data: T;
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
