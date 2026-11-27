// import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";
import { stringify } from "qs";

export const commonUrlApi = (url: string) =>
  // 本地1：`${"http://12.18.1.36:8085"}${url}`
  // 本地2：`${"http://10.162.250.167:9000"}${url}`
  `${"https://api.peidigroup.cn"}${url}`; // 线上

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

/** 周报汇总行（原 sales-summary 数组元素，字段未变） */
export interface DySalesSummaryRow {
  brokerage?: number;
  businessType?: string;
  taxIncludedAmount?: number;
  totalA1?: number;
  totalContractAmount?: number;
  totalFinancialCost?: number;
  trafficFormat?: number;
  trafficFormatName?: string;
  [property: string]: any;
}

/** 未匹配到财务成本的商品（成本按 0 计） */
export interface DyMissingCostItem {
  /** 商家编码（商品档案货号；无档案时回落为旺店通货品ID） */
  merchantCode: string;
  /** 品名 */
  productName: string;
  /** 含税金额合计（赠品行恒为 0） */
  taxIncludedAmount: number;
}

/** 周报接口返回（⚠️ 2026-11 起 data 由数组改为对象） */
export interface DySalesSummaryResult {
  /** 原接口数组，字段不变 */
  summary: DySalesSummaryRow[];
  /** 完全匹配不到财务成本的商品；无缺失时为 []，不缓存 */
  missingCost: DyMissingCostItem[];
  [property: string]: any;
}

/** 查询销售汇总（按流量类型和业务类型分组） */
export const getWdtOrderDetailSalesSummary = (params: {
  configId?: number | string;
  endDate: string;
  selfOperatedInfluencerIds?: string[];
  startDate: string;
  [key: string]: any;
}) => {
  return http.request<DySalesSummaryResult>(
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
  configId?: number | string;
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
  /** 达人名称 */
  influencerName?: string;
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

/** 利润表（商品）单行，按 日期×商品ID 分组 */
export interface DyProductProfitVo {
  /** 营业税金及附加 */
  businessTaxSurcharge?: number;
  /** 渠道净毛利 */
  channelNetProfit?: number;
  /** 毛利 */
  grossProfit?: number;
  /** 毛利率 */
  grossMargin?: number;
  /** 站内佣金 */
  innerCommission?: number;
  /** 物流成本 */
  logisticsCost?: number;
  /** 净毛利率（含税/未税为 0 时为 null） */
  netMargin?: number | null;
  /** 站外佣金 */
  outerCommission?: number;
  /** 平台费用 */
  platformFee?: number;
  /** 订单提交日期 */
  profitDate?: string;
  /** 抖音商品ID（无商品ID归"无商品ID"） */
  productId?: string;
  /** 商品名 */
  productName?: string;
  /** 千川推直播 */
  qcLive?: number;
  /** 千川推商品 */
  qcProduct?: number;
  /** 千川推商品（无ID） */
  qcProductNoId?: number;
  /** 未税收入 */
  taxExcludedAmount?: number;
  /** 含税收入 */
  taxIncludedAmount?: number;
  /** 财务总成本 */
  totalFinancialCost?: number;
  /** 仓储损耗包材 */
  warehouseCost?: number;
  [property: string]: any;
}

/**
 * 利润表（商品）—— 返回全量数组（非分页对象），前端自行分页/排序；
 * 排序 profitDate ASC, productId ASC；服务端按 (startDate, endDate, configId) 缓存 5 分钟。
 */
export const getProductProfit = (params: {
  configId: number | string;
  endDate: string;
  startDate: string;
  [property: string]: any;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/wdt/order-detail/product-profit"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 5
    }
  );
};

/** 利润表（店铺）单行，按 月×店铺名 分组（月报） */
/** 抖音考核单行（对齐人工表 sheet「抖音考核」的列序） */
export interface DyAssessmentVo {
  /** 月份 yyyy-MM */
  month?: string;
  /** 店铺名 */
  shopName?: string;
  /** 考核口径业务类型：自营 / 达播 */
  businessType?: string;
  /** 流量来源编码 1-短视频 2-商品卡 3-直播 4-其他 */
  trafficFormat?: number;
  /** 流量来源名称 */
  trafficFormatName?: string;
  /** 含税收入 */
  taxIncludedAmount?: number;
  /** 未税收入 */
  taxExcludedAmount?: number;
  /** 财务总成本 */
  totalFinancialCost?: number;
  /** 毛利 */
  grossProfit?: number;
  /** 毛利率 */
  grossMargin?: number;
  /** 物流成本 */
  logisticsCost?: number;
  /** 仓储损耗包材 */
  warehouseCost?: number;
  /** 平台费用 */
  platformFee?: number;
  /** 佣金 */
  commission?: number;
  /** 千川投流 */
  qianChuanCost?: number;
  /** 千川投流占比 */
  qianChuanRatio?: number;
  /** 渠道净毛利 */
  channelNetProfit?: number;
  /** 净毛利率 */
  netMargin?: number;
  [property: string]: any;
}

export interface DyShopProfitVo {
  /** 营业税金及附加 */
  businessTaxSurcharge?: number;
  /** 渠道站内营销费用（已扣减短视频补贴） */
  channelInternalMarketing?: number;
  /** 渠道净利 */
  channelNetProfit?: number;
  /** 毛利 */
  grossProfit?: number;
  /** 毛利率（未税收入为 0 时为 null） */
  grossMargin?: number | null;
  /** 站内佣金 */
  innerCommission?: number;
  /** 物流成本 */
  logisticsCost?: number;
  /** 净毛利率（未税收入为 0 时为 null） */
  netMargin?: number | null;
  /** 渠道站外营销费用 */
  outerCommission?: number;
  /** 平台费用 */
  platformFee?: number;
  /** 月份 yyyy-MM */
  profitMonth?: string;
  /** 店铺名 */
  shopName?: string;
  /** 短视频补贴（仅爵宴专营店非 0，用于冲减站内营销费用） */
  shortVideoSubsidy?: number;
  /** 未税收入 */
  taxExcludedAmount?: number;
  /** 含税收入 */
  taxIncludedAmount?: number;
  /** 外部采购成本 */
  totalFinancialCost?: number;
  /** 仓储损耗包材 */
  warehouseCost?: number;
  [property: string]: any;
}

/**
 * 利润表（店铺）—— 按 月×店铺名 分组，返回全量数组（非分页对象），前端自行分页/排序；
 * 与利润表（达人）/（商品）同参数：startDate / endDate / configId。
 */
export const getShopProfit = (params: {
  configId: number | string;
  endDate: string;
  startDate: string;
  [property: string]: any;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/wdt/order-detail/shop-profit"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 5
    }
  );
};

/**
 * 抖音考核 —— 按 月 返回 店铺×自营达播(考核口径)×流量来源 的考核数据（全量数组，前端自行分页/排序）。
 * 与周报/利润表同源取数，差异：①自营/达播按考核口径重新区分 ②千川投流按对应项目销售额分摊。
 * 返回每月每店固定 8 行（4 流量来源 × 自营/达播，含全 0 行）。
 */
export const getDyAssessment = (params: {
  /** 月份 yyyy-MM */
  yearMonth: string;
  configId: number | string;
  [property: string]: any;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/wdt/order-detail/assessment"),
    {
      params
    },
    {
      timeout: 1000 * 60 * 5
    }
  );
};

/** 达人合同结算规则类型：固定费率 / 阶梯档位 / 人工比值 */
export type DyContractRuleType = "FIXED" | "TIERED" | "MANUAL";

/**
 * 达人合同结算规则状态
 * - PENDING：规则已改、待结算，比例未生效（报表沿用上月比例）
 * - COMPLETED：已结算锁定
 * - INHERITED：未完结月，继承上月比例
 * - PROVISIONAL：新签达人首月，30 天测算
 * - MANUAL：人工直接填比值（保存即生效）
 * - EXPIRED：合同期外，该月不生效
 */
export type DyContractRuleStatus =
  | "PENDING"
  | "COMPLETED"
  | "INHERITED"
  | "PROVISIONAL"
  | "MANUAL"
  | "EXPIRED";

/** 阶梯档位：min 为销售额阈值（含），rate 为费率小数（0.05 表示 5%） */
export interface DyContractRateRule {
  min: number;
  rate: number;
}

/** 新增/更新达人合同请求体 */
export interface DyExpertContractSaveReq {
  /** 更新时必填，新增时不能传 */
  id?: number;
  /** 结算达人 UID（与旺店通达人 ID 一致） */
  settlementDarrenId: string;
  expertNickname?: string;
  douyinId?: string;
  signingUnit?: string;
  /** 新增必填，yyyy-MM-dd */
  contractStartTime?: string;
  /** 新增必填，yyyy-MM-dd */
  contractEndTime?: string;
  /** 开票税率，百分数：6 表示 6%，范围 0~100 */
  taxRate?: number;
  /** 规则类型 */
  ruleType: DyContractRuleType;
  /** FIXED、TIERED 必填，1~5 档 */
  rateRule?: DyContractRateRule[];
  /** MANUAL 必填，人工最终比值，0~1 */
  ratio?: number;
  /** 仅当不传合同起止时间时，按该月生成单行 */
  executionDate?: string;
  sortOrder?: number;
  /** 仅更新接口有效；true 时规则应用到合同覆盖的所有月份 */
  applyToAllMonths?: boolean;
  [property: string]: any;
}

/** 结算预览单行 */
export interface DyExpertContractSettlePreviewItem {
  id?: number;
  settlementDarrenId?: string;
  expertNickname?: string;
  executionDate?: string;
  ruleType?: DyContractRuleType;
  ruleStatus?: DyContractRuleStatus | null;
  /** 该月销售额（取档基数） */
  salesAmount?: number;
  /** 落档费率，MANUAL 为空 */
  rate?: number | null;
  /** 结算后的比值 */
  ratio?: number;
  /** 当前库中比值 */
  currentRatio?: number;
  /** 该月订单是否覆盖到月末 */
  dataReady?: boolean;
  /** 是否会被结算 */
  willSettle?: boolean;
  skipReason?: string | null;
  [property: string]: any;
}

/** 执行结算返回 */
export interface DyExpertContractSettleResult {
  month: string;
  dataReady: boolean;
  settledCount: number;
  skippedCount: number;
  skipped?: string[];
  [property: string]: any;
}

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

/** 批量新增抖音达人合同（按合同周期自动展开每月一行） */
export const postDyExpertContractBatch = (data: DyExpertContractSaveReq[]) => {
  return http.request(
    "post",
    commonUrlApi("/oms/dy/dy-expert-contract/batch"),
    {
      data
    }
  );
};

/** 批量更新抖音达人合同（默认仅更新当前行，applyToAllMonths=true 时应用到整份合同） */
export const postDyExpertContractUpdate = (data: DyExpertContractSaveReq[]) => {
  return http.request("post", commonUrlApi("/oms/dy/dy-expert-contract"), {
    data
  });
};

/** 删除抖音达人合同（逻辑删除，单行） */
export const postDyExpertContractDelete = (id: number) => {
  return http.request(
    "post",
    commonUrlApi(`/oms/dy/dy-expert-contract/delete/${id}`)
  );
};

/** 结算预览（只读） */
export const getDyExpertContractSettlePreview = (params: {
  month: string;
  [property: string]: any;
}) => {
  return http.request(
    "get",
    commonUrlApi("/oms/dy/dy-expert-contract/settle/preview"),
    { params }
  );
};

/** 执行结算（人工触发） */
export const postDyExpertContractSettle = (data: {
  month: string;
  force?: boolean;
  [property: string]: any;
}) => {
  return http.request(
    "post",
    commonUrlApi("/oms/dy/dy-expert-contract/settle"),
    { data }
  );
};

/** 保存抖音周报费用配置（带 id=更新该条；无 id=新增，同月同名会拒绝） */
export const postDyWeeklyConfigSave = (data: any) => {
  return http.request("post", commonUrlApi("/oms/dy-weekly-config/save"), {
    data
  });
};

/** 回显配置（按主键 id） */
export const getDyWeeklyConfig = (params: {
  id: number | string;
  [property: string]: any;
}) => {
  return http.request("get", commonUrlApi("/oms/dy-weekly-config/get"), {
    params
  });
};

/** @deprecated 已改为按 id 回显，请使用 getDyWeeklyConfig({ id }) */
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
  configId?: number | string;
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
