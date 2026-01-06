// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8085"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取商品评论问题 */
export const getShuyunNickPage = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/shuyunNick-page"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 15
    }
  );
};
