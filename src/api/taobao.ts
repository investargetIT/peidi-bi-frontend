// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8091"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

export interface GoodsReviewQuestion {
  question: string;
  product: string;
  compareProduct?: string;
  compareProductReviewTime?: string; // 2025-11-01&&2025-11-31
  productReviewTime?: string;
}

/** 获取商品评论问题预时间 */
export const getGoodsReviewQuestionPre = (params: GoodsReviewQuestion) => {
  return http.request(
    "get",
    commonUrlApi("/ai/goods-review/question-pre"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 15
    }
  );
};

/** 获取商品评论问题 */
export const getGoodsReviewQuestion = (params: GoodsReviewQuestion) => {
  return http.request(
    "get",
    commonUrlApi("/ai/goods-review/question"),
    {
      params
    },
    {
      timeout: 0
    }
  );
};

/** 获取枚举 */
// 枚举 -reviewShopName -compareReviewShopName -reviewGoodsType
export const getCommonEnum = (
  type: "reviewShopName" | "compareReviewShopName" | "reviewGoodsType"
) => {
  return http.request("get", commonUrlApi("/ai/common/enum"), {
    params: {
      type
    }
  });
};
