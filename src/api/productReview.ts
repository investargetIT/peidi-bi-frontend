// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8091"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取商品评论 */
export const getGoodsEvaluation = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
}) => {
  return http.request("get", commonUrlApi("/oms/bi/goods-evaluation"), {
    params
  });
};

/** 生成ai回复 */
export const postGenerateAiEvaluation = (data: { id: number | string }) => {
  return http.request("post", commonUrlApi("/ai/evaluation/new"), {
    data
  });
};
