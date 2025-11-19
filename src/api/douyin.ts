// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8091"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取抖音业绩数据 */
export const getBiDouyinSales = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
}) => {
  return http.request("get", commonUrlApi("/oms/bi/douyin-sales"), {
    params
  });
};

/** 获取抖音短视频数据 */
export const getBiDouyinVideo = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
}) => {
  return http.request("get", commonUrlApi("/oms/bi/douyin-video"), {
    params
  });
};
