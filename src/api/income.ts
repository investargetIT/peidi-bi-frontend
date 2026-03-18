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
