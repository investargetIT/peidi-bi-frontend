// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";
import { stringify } from "qs";

export const commonUrlApi = (url: string) =>
  `${"http://12.18.1.36:8085"}${url}`;
// `${"https://api.peidigroup.cn"}${url}`;

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

/** 查询销售汇总（按流量类型和业务类型分组） */
export const getWdtOrderDetailSalesSummary = (params: {
  endDate: string;
  selfOperatedInfluencerIds?: string[];
  startDate: string;
  [key: string]: any;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/wdt/order-detail/sales-summary"),
    {
      params,
      paramsSerializer: (params: any) => {
        return stringify(params, { arrayFormat: "repeat" });
      }
    }
  );
};

/** 分页查询抖音达人合同（按结算达人UID分组） */
export const getDyExpertContractPage = (data: {
  contractEndTimeEnd?: string;
  contractEndTimeStart?: string;
  contractStartTimeEnd?: string;
  contractStartTimeStart?: string;
  douyinId?: string;
  expertNickname?: string;
  pageNum?: number;
  pageSize?: number;
  settlementDarrenId?: string;
  signingUnit?: string;
  [property: string]: any;
}) => {
  return http.request("post", commonUrlApi("/oms/dy/dy-expert-contract/page"), {
    data
  });
};

/** 批量新增抖音达人合同 */
export const postDyExpertContractBatch = (data: any[]) => {
  return http.request(
    "post",
    commonUrlApi("/oms/dy/dy-expert-contract/batch"),
    {
      data
    }
  );
};

/** 批量更新抖音达人合同 */
export const postDyExpertContractUpdate = (data: any[]) => {
  return http.request("post", commonUrlApi("/oms/dy/dy-expert-contract"), {
    data
  });
};

/** 删除抖音达人合同（逻辑删除） */
export const postDyExpertContractDelete = (id: number) => {
  return http.request(
    "post",
    commonUrlApi(`/oms/dy/dy-expert-contract/delete/${id}`)
  );
};
