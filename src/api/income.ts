// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8085"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

export interface incomeParams {
  year?: number;
  month?: number;
}

/** bi_financial_income_week */
export const getFinancialIncomeWeekList = (params: incomeParams) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/financial-income-week/list"),
    {
      params
    }
  );
};

/** bi_financial_income_month */
export const getFinancialIncomeMonthList = (params: incomeParams) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/financial-income-month/list"),
    {
      params
    }
  );
};

/** bi_financial_income_target */
export const getFinancialIncomeTargetList = (params: incomeParams) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/financial-income-target/list"),
    {
      params
    }
  );
};

/** 获取货品销售日报表 */
export const getGoodsSalesDayList = (params: {
  endDate: string;
  startDate: string;
}) => {
  return http.request("get", commonUrlApi("/oms/finance/goodsSalesDay"), {
    params
  });
};

/** 获取bi_financial_income_day数据 */
export const getFinancialIncomeDayList = (params: {
  endDate: string;
  startDate: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/financial-income-day/list"),
    {
      params
    }
  );
};

/** 根据日期区间查询每日财务收入目标数据（含渠道系数） */
export const getFinancialIncomeTargetDailyList = (params: {
  endDate: string;
  startDate: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/financial-income-target-daily/list"),
    {
      params
    }
  );
};

/** 获取年业绩期望目标列表 */
export const getYearExpectTargetList = (params: {
  endDate?: string;
  startDate?: string;
  salesChannel?: string;
}) => {
  return http.request("get", commonUrlApi("/oms/bi/year-expect-target/list"), {
    params
  });
};
