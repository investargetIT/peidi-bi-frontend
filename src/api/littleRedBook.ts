// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8085"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取bi_product_traffic_monitor数据 */
export const getBiProductTrafficMonitor = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request("get", commonUrlApi("/oms/bi/product-traffic-monitor"), {
    params
  });
};

/** 获取bi_product_name数据 */
export const getBiProductNameList = () => {
  return http.request("get", commonUrlApi("/oms/bi/product-name/list"), {});
};

/** 新增bi_product_name数据 */
export const createBiProductName = (data: {
  channel?: string;
  date?: string;
  productId: string;
  productName: string;
  type: string;
}) => {
  return http.request("post", commonUrlApi("/oms/bi/product-name/new"), {
    data
  });
};

/** 修改bi_product_name数据 */
export const updateBiProductName = (data: {
  channel?: string;
  date?: string;
  id: number | string;
  productId: string;
  productName: string;
  type: string;
}) => {
  return http.request("post", commonUrlApi("/oms/bi/product-name/update"), {
    data
  });
};

/** 删除bi_product_name数据 */
export const deleteBiProductName = (data: { id: number | string }) => {
  return http.request("post", commonUrlApi("/oms/bi/product-name/delete"), {
    data
  });
};
