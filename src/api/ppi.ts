// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8091"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

export interface ProductNewData {
  amount: string | number;
  channel: string;
  id: string | number;
  longAmount: string | number;
  reviewCnt: string | number;
  star: string | number;
  title: string;
}
/** 增加新产品 */
export const postAiIntelligenceProductNew = (data: ProductNewData) => {
  return http.request("post", commonUrlApi("/ai/intelligence/product/new"), {
    data
  });
};

/** 分页获取产品信息 */
export const getAiIntelligenceProductPage = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request("get", commonUrlApi("/ai/intelligence/product/page"), {
    params
  });
};

/** 获取产品词云 */
export const getAiIntelligenceProductWordCload = (params: {
  refresh?: boolean;
}) => {
  return http.request(
    "get",
    commonUrlApi("/ai/intelligence/product/word-cload"),
    {
      params
    }
  );
};
