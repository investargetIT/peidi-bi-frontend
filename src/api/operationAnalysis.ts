// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8085"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

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
