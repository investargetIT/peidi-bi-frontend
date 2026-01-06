// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8085"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 分页获取bi_all_item_price表数据 产品明细 */
export const getAllItemPricePage = (params: {
  pageNo: number | string;
  pageSize: number | string;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/all-item-price"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 15
    }
  );
};

/** 分页获取bi_item_price表数据 市场大盘 */
export const getItemPricePage = (params: {
  pageNo: number | string;
  pageSize: number | string;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/item-price"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 15
    }
  );
};
