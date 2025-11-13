import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8091"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取rfm模型 */
export const getBiRfm = (params: {
  date: string;
  endTime: string;
  startTime: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/rfm"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 2
    }
  );
};
