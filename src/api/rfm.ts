// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8085"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

export interface GetBiRfmParams {
  areaLevel2?: string;
  channel?: string;
  totalAmount1: number | string;
  totalAmount2: number | string;
  totalOrders1: number | string;
  totalOrders2: number | string;
  year: string;
}
/** 获取rfm模型 */
export const getBiRfm = (data: GetBiRfmParams) => {
  return http.request(
    "post",
    commonUrlApi("/oms/bi/rfm"),
    {
      data
    },
    {
      timeout: 1000 * 60 * 15
    }
  );
};

/* 获取rfm模型城市级联 */
export const getBiRfmArea = () => {
  return http.request("get", commonUrlApi("/oms/bi/rfm/area"));
};
