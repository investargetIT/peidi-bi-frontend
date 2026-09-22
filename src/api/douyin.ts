// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";
import { stringify } from "qs";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.36:8085"}${url}`;
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

/** 利润表（达人）—— 按 日期×达人ID 分组，对齐人工表『利润表（达人）』sheet */
export interface InfluencerProfitRequest {
  endDate: string;
  pageNo?: number;
  pageSize?: number;
  selfOperatedInfluencerIds?: string[];
  startDate: string;
  [property: string]: any;
}

/** 利润表（达人）单行，与人工表『利润表（达人）』sheet 对齐 */
export interface DyInfluencerProfitVo {
  /** 营业税金及附加 = 未税*0.09*0.12 */
  businessTaxSurcharge?: number;
  /** 渠道净毛利 = 毛利 - (千川推直播+千川推商品+千川推商品无ID+税金+物流+仓储+平台+站内+站外) */
  channelNetProfit?: number;
  /** 毛利率 = 毛利/未税收入 */
  grossMargin?: number;
  /** 毛利 = 未税收入 - 财务总成本 */
  grossProfit?: number;
  /** 达人ID（无达人ID归"无ID"） */
  influencerId?: string;
  /** 站内佣金 */
  innerCommission?: number;
  /** 物流成本 = 含税*0.0474/1.06 */
  logisticsCost?: number;
  /** 净毛利率 = 渠道净毛利/未税收入 */
  netMargin?: number;
  /** 站外佣金 */
  outerCommission?: number;
  /** 订单提交日期 */
  profitDate?: string;
  /** 千川推直播（整体消耗/1.06） */
  qcLive?: number;
  /** 千川推商品（整体消耗，特殊账号 /1.01/1.06，否则 /1.06） */
  qcProduct?: number;
  /** 千川推商品（无ID） */
  qcProductNoId?: number;
  /** 未税收入 = 含税/1.09 */
  taxExcludedAmount?: number;
  /** 含税收入 */
  taxIncludedAmount?: number;
  /** 财务总成本 */
  totalFinancialCost?: number;
  /** 仓储损耗包材 = 未税*0.04643 */
  warehouseCost?: number;
  [property: string]: any;
}

/** 分页查询利润表（达人）返回 */
export interface InfluencerProfitPage {
  /** 当前页 */
  current?: number;
  /** 查询数据列表 */
  records?: DyInfluencerProfitVo[];
  /** 当前分页总页数 */
  pages?: number;
  /** 每页显示条数，默认 10 */
  size?: number;
  /** 总数 */
  total?: number;
  [property: string]: any;
}

/** 分页查询利润表（达人） */
export const getInfluencerProfit = (params: InfluencerProfitRequest) => {
  return http.request(
    "get",
    commonUrlApi("/oms/wdt/order-detail/influencer-profit"),
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

/** 保存/覆盖抖音周报费用配置（同名同月覆盖） */
export const postDyWeeklyConfigSave = (data: any) => {
  return http.request("post", commonUrlApi("/oms/dy-weekly-config/save"), {
    data
  });
};

/** 回显配置（按 月份+名称） */
export const getDyWeeklyConfig = (params: {
  configName?: string;
  yearMonth?: string;
  [property: string]: any;
}) => {
  return http.request("get", commonUrlApi("/oms/dy-weekly-config/get"), {
    params
  });
};

/** 回显配置（按名称取最新一套） */
export const getDyWeeklyConfigByName = (params: {
  configName?: string;
  [property: string]: any;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/dy-weekly-config/get-by-name"),
    { params }
  );
};

/** 查询全部已保存配置（按月份倒序，供下拉/修改已有配置） */
export const getDyWeeklyConfigList = () => {
  return http.request("get", commonUrlApi("/oms/dy-weekly-config/list"), {});
};

/** 分页查询千川投流数据 */
export const getDyQianChuanPage = (data: any) => {
  return http.request("post", commonUrlApi("/oms/dy/dy-qian-chuan/page"), {
    data
  });
};

/** 批量新增千川投流数据 */
export const postDyQianChuanBatch = (data: any[]) => {
  return http.request("post", commonUrlApi("/oms/dy/dy-qian-chuan/batch"), {
    data
  });
};

/** 批量更新千川投流数据 */
export const postDyQianChuanUpdate = (data: any[]) => {
  return http.request("post", commonUrlApi("/oms/dy/dy-qian-chuan"), {
    data
  });
};

/** 删除千川投流数据（逻辑删除） */
export const postDyQianChuanDelete = (id: number) => {
  return http.request(
    "post",
    commonUrlApi(`/oms/dy/dy-qian-chuan/delete/${id}`)
  );
};

/** 千川投流汇总行（按周分组） */
export interface DyQianChuanSummaryItem {
  /** 日期区间，如 "8.01-8.02" */
  datePeriod: string;
  /** 周数 */
  weekNumber: number;
  /** 流量来源：明细为 短视频/商品卡/直播，合计行为 XX合计/合计 */
  flowSource: string;
  /** 业务类型：明细为 自营/达播，合计行为空字符串 */
  segment: string;
  /** 千川投流金额 */
  qianChuanCost: number;
  /** 千川投流占比（后端未计算，固定为 null） */
  qianChuanRatio: number | null;
}

/** 千川投流汇总查询 */
export const postDyQianChuanSummary = (data: {
  dateEnd?: string;
  dateStart?: string;
  divisor1?: number;
  divisor2?: number;
  [property: string]: any;
}) => {
  return http.request("post", commonUrlApi("/oms/dy/dy-qian-chuan/summary"), {
    data
  });
};
