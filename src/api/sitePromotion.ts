// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8091"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取ads-product-promotion-dail数据 */
export const getBiAdsProductPromotionDaily = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
  sortStr?: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/ads-product-promotion-dail"),
    {
      params
    }
  );
};

/** 获取bi_product_sales_daily数据 */
export const getBiMidProductMappingList = () => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/mid-product-mapping/list"),
    {}
  );
};

export interface MidProductInfo {
  id?: number;
  productId: string;
  productLine: string;
  productShortName: string;
}

/** 新增bi_mid_product_mapping数据 */
export const postBiMidProductMappingNew = (data: MidProductInfo) => {
  return http.request("post", commonUrlApi("/oms/bi/mid-product-mapping/new"), {
    data
  });
};

/** 修改bi_mid_product_mapping数据 */
export const postBiMidProductMappingUpdate = (data: MidProductInfo) => {
  return http.request(
    "post",
    commonUrlApi("/oms/bi/mid-product-mapping/update"),
    {
      data
    }
  );
};

/** 删除bi_mid_product_mapping数据 */
export const postBiMidProductMappingDelete = (data: {
  id: string | number;
}) => {
  return http.request(
    "post",
    commonUrlApi("/oms/bi/mid-product-mapping/delete"),
    {
      data
    }
  );
};

/** 获取ads-product-promotion-dail汇总数据 */
export const getAdsProductPromotionDailSummary = (params: {
  searchStr?: string;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/bi/ads-product-promotion-dail/sum"),
    {
      params
    }
  );
};
