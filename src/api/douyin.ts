// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8085"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取抖音业绩数据 */
export const getBiDouyinSales = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request("get", commonUrlApi("/oms/bi/douyin-sales"), {
    params
  });
};

/** 获取抖音业绩数据-商务总和 */
export const getBiDouyinSalesBusinessSum = (params: { searchStr?: string }) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/douyin-sales/business-sum"),
    {
      params
    }
  );
};

/** 获取抖音短视频数据 */
export const getBiDouyinVideo = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/douyin-video"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 5
    }
  );
};

/** 修改抖音短视频数据 */
export const postBiDouyinVideoUpdate = (data: any) => {
  return http.request("post", commonUrlApi("/oms/bi/douyin-video/update"), {
    data
  });
};

/** 获取抖音短视频支付金额总和 */
export const getBiDouyinVideoAmountSum = (params: { searchStr?: string }) => {
  return http.request("get", commonUrlApi("/oms/bi/douyin-video/amount-sum"), {
    params
  });
};

/** 获取所有抖音商品类别 */
export const getBiDouyinVideoType = () => {
  return http.request("get", commonUrlApi("/oms/bi/douyin-video/type"), {});
};

/** 抖音商品类别对应关系 */
export const postBiDouyinVideoTypeUpdateType = (data: {
  id: number;
  productId: string;
  productName: string;
  salesType: string;
}) => {
  return http.request(
    "post",
    commonUrlApi("/oms/bi/douyin-video/update-type"),
    {
      data
    }
  );
};
