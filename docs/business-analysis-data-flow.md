# 业务分析模块：接口数据格式 & 数据加工说明

> 适用范围：`/businessAnalysis` 路由下的两个页面
>
> - **业绩每日监控**（`src/views/incomeDaily/`）
> - **经营分析**（`src/views/operationAnalysis/`）

---

## 1. 通用响应包裹（Response Envelope）

所有接口经由 `src/utils/http/index.ts` 的 axios 拦截器封装，**拦截器直接 `return response.data`**，因此前端拿到的结构统一为：

```jsonc
{
  "code": 200,          // 成功标识，业务代码判断 res.code === 200
  "msg": "success",     // 错误提示文案
  "data": {} | []       // 具体业务数据，格式见下文各接口
}
```

> ⚠️ 注意：`code` 100100012 表示"登录过期"，会在拦截器统一拦截，不会走到业务代码。
> 前端所有请求都带登录 token；`commonUrlApi()` 会把路径前缀拼上 `https://api.peidigroup.cn`。

---

## 2. 业绩每日监控（incomeDaily）

### 2.1 页面结构

```
index.vue（入口：发请求 → 加工数据 → provide 给子组件）
├── components/header/index.vue        # 标题栏 + "更新数据截止:{lastDate}"
├── components/dashboard/index.vue     # 本月/年度累计销售额环形图（线上/线下）
├── components/overview/index.vue      # "进度" 卡片：全渠道/线上/线下 的本月、年度进度条
└── components/detailCard/index.vue    # 详情卡片：9 个渠道的展开明细（月/年、周堆叠、同比曲线等）
```

### 2.2 涉及接口（来源 `src/api/income.ts`）

| 前端函数                            | 接口路径                                         | 请求参数                                | 返回 data                    |
| ----------------------------------- | ------------------------------------------------ | --------------------------------------- | ---------------------------- |
| `getFinancialIncomeTargetDailyList` | `GET /oms/bi/financial-income-target-daily/list` | `startDate`, `endDate`（YYYY-MM-DD）    | `{ date: [], lastDate: "" }` |
| `getFinancialIncomeMonthList`       | `GET /oms/bi/financial-income-month/list`        | `year`                                  | `[]`                         |
| `getFinancialIncomeTargetList`      | `GET /oms/bi/financial-income-target/list`       | `year`                                  | `[]`                         |
| `getYearExpectTargetList`           | `GET /oms/bi/year-expect-target/list`            | `startDate`, `endDate`, `salesChannel?` | `[]`                         |

### 2.3 各接口返回字段（按代码实际使用）

**① 每日数据 `financial-income-target-daily/list`**

```jsonc
{
  "code": 200,
  "data": {
    "lastDate": "2026-09-20", // 数据更新截止日期（页面"更新数据截止"展示）
    "date": [
      {
        "date": "2026-09-01", // 日期
        "channel": "天猫", // 渠道名（9 个之一）
        "actualSales": 1000, // 实际销售额
        "backActualSales": 500, // 回补（back）销售额
        "factor": 1.0 // 渠道系数
      }
      // ...
    ]
  }
}
```

**② 月度数据 `financial-income-month/list`**

```jsonc
{
  "code": 200,
  "data": [
    {
      "month": 9, // 月份 1-12
      "income": 123456, // 当月收入
      "channel": "天猫", // 渠道名
      "channelGroup": "线上" // 渠道分组：线上 / 线下
    }
    // 返回全年 12 个月记录
  ]
}
```

**③ 目标数据 `financial-income-target/list`**

```jsonc
{
  "code": 200,
  "data": [
    {
      "month": 9, // 目标目标月份（-1 或 0 代表全年目标？代码里 cyclic = 按 channel 求和即是"年度目标"）
      "target": 200000, // 该渠道该月目标值
      "channel": "天猫"
    }
    // 每月每渠道一条；对某渠道全年所有目标求和 = 年度目标
  ]
}
```

**④ 年期望值 `year-expect-target/list`**

```jsonc
{
  "code": 200,
  "data": [
    {
      "salesChannel": "全渠道", // 渠道：全渠道 / 线上 / 线下 / 天猫...
      "expectValue": 80 // 年期望达成率（%）
    }
  ]
}
```

### 2.4 请求时序（onMounted）

1. 先请求当月每日数据 `{ startDate: 当月1号, endDate: 当月最后一天 }`，取 `lastDate`。
2. 若 `lastDate` 所在月份 ≠ 当前月，**再按 lastDate 的月份重新请求每日数据**（以更新截止月为准）。
3. 依次请求：本年月数据（`year = lastDate.year`）、去年月数据（`year-1`）、本年目标数据、年期望值（`startDate = endDate = lastDate`）。
4. 全部完成后调用 `handleIncomeWeekData()` 和 `handleIncomeData()` 加工数据，`incomeData` 通过 `provide/inject` 下发子组件。

### 2.5 数据加工逻辑

#### (1) 日 → 周聚合 `handleIncomeWeekData()`

```ts
// 每条的"日收入" = backActualSales * factor + actualSales
// 按 (第几周 + 渠道) 分组累加
week = getWeekOfMonth(date); // 本月第几周（基于 ISO 周，周一为一周起点，向上取整）
incomeWeekData = [
  {
    year,
    month,
    week,
    channel,
    income, // 该渠道该周累计收入
    id: null,
    monthExpectation: null,
    yearExpectation: null
  }
];
```

渠道常量 `CHANNEL_CATEGORY`（`utils/constant.ts`）：

```ts
全渠道 = [
  "天猫",
  "京东",
  "抖音",
  "哈宠",
  "跨境电商",
  "Vivaland",
  "销售一组",
  "销售二组",
  "销售三组"
];
线上 = ["天猫", "京东", "抖音", "哈宠", "跨境电商", "Vivaland"];
线下 = ["销售一组", "销售二组", "销售三组"];
```

#### (2) 图表数据 `handleIncomeData()` 生成 `incomeData`（provide 给子组件）

```ts
incomeData = {
  onlineOffChartData: [
    // 环图：本月、年度 各一条
    { online, offline },
    { online, offline } // 年度 = 周数据(全部) + 本年各月数据 汇总
  ],
  projectProgressData: [
    // 概览：本月、年度 各一份，每份 3 条（全渠道/线上/线下）
    [
      { name: "全渠道", status, income, target, expect },
      { name: "线上", status, income, target, expect },
      { name: "线下", status, income, target, expect }
    ],
    [
      /* 年度 */
    ]
  ],
  projectProgressDataDetail: [
    // 详情：本月、年度 各一份，每份 9 渠道
    [
      /* 本月 9 渠道明细 */
    ],
    [
      /* 年度 9 渠道明细 */
    ]
  ]
};
```

**关键计算口径：**

| 字段                                                  | 本月口径                                                                                     | 年度口径                                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `income`                                              | 本月 `incomeWeekData` 内该范围渠道收入之和                                                   | 全部 `incomeWeekData` + 本年 `incomeMonthData`（按月累加到 lastDate 所在月份） |
| `target`                                              | 目标数据里 `month === lastDate 月` 且渠道匹配的和                                            | 目标数据全部月份求和                                                           |
| `expect`（期望%）                                     | `lastDate 的日 / 当月天数`（按时间进度切分）                                                 | `yearExpectTargetData` 按 `salesChannel === name` 取 `expectValue`             |
| `status`（红绿灯）                                    | `progress >= expect - 5` → `"success"`，否则 `"danger"`；其中 `progress = income/target*100` |
| `yearOverYearGrowth`（同比）                          | 本月：`(本月收入 - 去年同月收入)/去年同月收入`，`_.floor`                                    | 年度：`(本年截至上月累计 - 去年同时段累计)/去年`，保留 2 位                    |
| `monthOverMonthGrowth`（环比）                        | `(本月 - 上月)/上月`；1 月特殊取去年 12 月                                                   | 年度暂不计算（被注释）                                                         |
| `allIncomeDetail`                                     | 本月：各周 `{ week, income }` 升序（详情卡片周堆叠图用）                                     | —                                                                              |
| `monthIncomeList`                                     | 本月：各月 `{ month, income }` + 追加本月 `{ month: lastDate月, income: item.income }`       | —                                                                              |
| `yearTarget` / `yearIncome`                           | 本年目标总和 / 本年收入累计                                                                  | —                                                                              |
| `yearOverYearGrowthList` / `monthOverMonthGrowthList` | 12 个月逐月曲线：`{ month, currentYearIncome, lastYearIncome, growthRate }`                  | —                                                                              |

#### (3) 子组件消费（含功能行为）

- **Dashboard（环图）**：取 `onlineOffChartData[0]`（本月）与 `[1]`（年度），圆心文案 = `(online+offline)/10000` 万。
- **ProjectProgress（概览）**：遍历 `["全渠道","线上","线下"]` × `["本月","年度"]`，渲染实际进度条（`income/target`）、期望进度条（`expect%`），灯泡颜色取 `status`。点击跳转 `detailCardRef.initDetailCard(channel)`。
- **DetailCard（详情）**：9 渠道 × 2 时间范围。展示目标达成（含周堆叠 `allIncomeDetail`）、进度（实际/期望）、年度对比信息（同比%）、整体信息 = `monthIncomeList` 柱状图 + 同比/环比折线 + "累计完成 `yearIncome/yearTarget`"。
- **月度图表截断**：月度柱图（本年业绩）与同比/环比折线只展示到**当前自然月**为止——柱图 `data.slice(0, currentMonth)`，同比/环比折线 `data.slice(0, currentMonth - 1)`（当前月无环比、未来月一律不展示）。柱图值 = `_floor(item.income / 10000)`（万元）。
- **周堆叠占比**：详情卡本月"周数据堆叠图"每格的百分比 = `divide(该周income, 该渠道本月income) * 100`，状态 `week_1`~`week_5`（非本周填色的功能性区分）。
- **Achievement 组件**：`index.vue` 里 `v-show="false"` 隐藏（保留 to 抽屉详情的 `openDrawer` 功能但未启用），功能复刻时可忽略。

---

## 3. 经营分析（operationAnalysis）

### 3.1 页面结构

```
index.vue（入口：并发请求 → 把响应映射进 DATA_FORMAT → 分发给 ECharts 卡片）
├── components/echartCard/e1.vue   # 核心指标达成总览（收入饼图 + 完成率/进度/同比柱图 + 利润）
├── components/echartCard/e2.vue   # 团队指标达成（9 团队，本期/去年同期柱 + 达成/进度线）——当前未绑定接口，用内置默认数据
├── components/echartCard/e3.vue   # 产品结构（PD 爵宴/好适嘉/Vivaland 的 pie+bar）
└── components/echartCard/e4.vue   # 成本结构（去除沃尔玛指标 + 成本构成 + 同步变动）
```

> 代码里还保留了 `utils/excelLoader.ts`（ExcelJS 读取 public/xlsx）作为**旧数据源方案**，现在不再启用，改为接口数据 + 前端内存中的 `DATA_FORMAT` 默认结构。

### 3.2 涉及接口（来源 `src/api/operationAnalysis.ts`）

| 前端函数                          | 接口路径                                      | 请求参数             | 返回 data                          |
| --------------------------------- | --------------------------------------------- | -------------------- | ---------------------------------- |
| `getBusinessAnalysisOverviewList` | `GET /oms/bi/business-analysis-overview/list` | `date`（YYYY-MM-01） | `[]`                               |
| `getBusinessAnalysisProductList`  | `GET /oms/bi/business-analysis-product/list`  | `date`               | `[]`                               |
| `getBusinessAnalysisCostList`     | `GET /oms/bi/business-analysis-cost/list`     | `date`               | `[]`                               |
| `getBusinessAnalysisGroupList`    | `GET /oms/bi/business-analysis-group/list`    | `date`               | `[]`（页面当前未调用，留给配置页） |

### 3.3 各接口返回字段（按代码实际使用）

**① 核心指标总览 `business-analysis-overview/list`**

```jsonc
{
  "code": 200,
  "data": [
    {
      "type": "主粮", // 分类：主粮 / 零食 / 其他收入 / 利润 / 自主品牌收入...
      "currentPeriodActual": 6215, // 当期实际（元）
      "completionRate": 107, // 完成率（%）
      "annualProgress": 19, // 全年进度（%）
      "growthRate": 16, // 同比增速（%，可能是 "16%" 字符串）
      "date": "2026-04-01" // 数据所属月份
    }
    // ...
  ]
}
```

**② 产品结构 `business-analysis-product/list`**

```jsonc
{
  "code": 200,
  "data": [
    {
      "product": "爵宴", // 产品名（PD / 爵宴风干零食 / 好适嘉湿粮...）
      "periodCumulativeRevenue": 6433, // 期间累计营收（饼图 value）
      "achievementProgress": 16, // 达成进度（%）
      "yoyChangeRate": 16, // 同比变化（%）
      "grossProfitMargin": 28 // 毛利率（%）—— 只有指定产品组有此字段
    }
    // ...
  ]
}
```

**③ 成本结构 `business-analysis-cost/list`**

```jsonc
{
  "code": 200,
  "data": [
    {
      "type": "商品成本率", // 类型：商品成本率/履约费率/营销费率/人力成本率/管理费率/去除沃尔玛后毛利率/去除沃尔玛后营销费率
      "periodCumulativeCost": 68.2, // 期间累计成本率/费率（%）
      "yoyChangeRate": 1.02 // 同比变动（百分点）
    }
    // ...
  ]
}
```

### 3.4 请求时序（onMounted）

1. `targetDate = 当月 1 号`（`YYYY-MM-01`）。
2. `Promise.all` 并发请求 overview / product / cost。
3. 若 `overview.code === 200 && overview.data.length === 0`（当月还没数据），**自动回退到上月 1 号重新请求**。
4. `dataTime = "YYYY.01 ~ 截止数据月-1"`（页面展示"数据期间"）。
5. 调用 `loadExcelData()`：把接口返回映射进内存 `DATA_FORMAT`（默认带 Excel 示例数值的 ECharts 结构），再通过 props 下发给 E1/E3/E4。

> 由于 `loadExcelData` 只是"就地覆写" `DATA_FORMAT` 的 value，**当接口无数据或新品类出现时**，图表会保留默认示例值（或找不到则保持 0），这一点与"纯接口驱动"的 incomeDaily 不同。

### 3.5 数据加工逻辑（映射关系）

内存统一结构 `DATA_FORMAT`（`utils/config.ts`），ECharts 组件直接消费：

```ts
DATA_FORMAT = {
  E1: {   // 核心指标达成总览
    income_pie:  [ { value, name, itemStyle.color } ],           // 收入饼图：name=type，value=currentPeriodActual
    income_bar:  { xAxisData: [...type], series: [
                    { name: "完成率",   color, data:[completionRate...] },
                    { name: "全年进度", color, data:[annualProgress...] },
                    { name: "同比",     color, data:[growthRate(取数字)...] } ] },
    profit_flag: 1 | -1,                                      // 利润为负 => -1（用于展示绝对值+负号）
    profit_pie:  [ { value: |currentPeriodActual|(利润), ... } ],
    profit_bar:  { xAxisData:["利润"], series:[完成率/全年进度/同比] }
  },
  E3: {   // 产品结构
    pd_pie / meatyway_pie / healthy_pie:  [ { value: periodCumulativeRevenue, name: product } ],
    pd_bar / meatyway_bar / healthy_bar: { xAxisData: [product...], series: [
                    { name: "进度",   data: [achievementProgress...] },
                    { name: "同比",   data: [yoyChangeRate...] },
                    { name: "毛利率", data: [grossProfitMargin...] }   // 仅 meatyway/healthy 有
    ] }
  },
  E4: {   // 成本结构
    eliminating_walmart_info: [ 去除沃尔玛后毛利率periodCumulativeCost, 其yoyChangeRate,
                                去除沃尔玛后营销费率periodCumulativeCost, 其yoyChangeRate ],
    cost_structure_bar:      { xAxisData:[...成本率类型], series:[periodCumulativeCost...] },
    synchronous_change_bar:  { xAxisData:[...成本率类型], series:[yoyChangeRate...] }
  }
}
```

**加工时的两个工具函数：**

- `extractNumber(str|num)`：从 `"2.36%"` 或 `"-2.36%"` 字符串里提取数值；数字直接返回。
- `roundNumber(num, precision=0)`：安全四舍五入（NaN/Inf 兜底为 0）。
- 利润图表：`profit_flag = currentPeriodActual < 0 ? -1 : 1`，展示时用 `flag * value` 还原负数。

**E2 团队指标：** 保留在 `DATA_FORMAT.E2` 中，柱/线由 `e2.vue` 内置数据 `xAxisData = [9 个团队]` 生成，**当前未与 `business-analysis-group` 接口联动**（如需联动需为 E2 补映射逻辑）。

### 3.6 子组件消费

- **e1**：coreCard1（被注释）→ 实际用 coreCard3 收入饼图 + coreCard4 收入柱图 + coreCard5 利润饼图 + coreCard6 利润柱图；饼图/柱图间有 hover 联动（`dispatchAction highlight/downplay`）。
- **e3**：三组产品（PD / 爵宴 / 好适嘉）各自 pie + bar。
- **e4**：三个卡片：去除沃尔玛指标文字卡片 + 成本构成横向条形 + 同步变动条形。
- 所有图表外层由 `ChartCard`（`@/components/PdChart/index.vue`）渲染；`sizeConfig`（XS/MD）根据 `window.innerWidth >= 992` 切换字号和圆环半径。

---

## 4. 常见问题 / 注意事项

1. **日期口径**：业绩每日监控以接口 `lastDate` 为准（月数据只保留 `month < lastDate 月`），若接口更新滞后会自动回退到 lastDate 所在月。
2. **红线/绿线规则**：`getWarningLightStatus(actual, expect)` → `actual >= expect - 5` 为绿（success），否则红（danger）。
3. **经营分析兜底**：当月无数据自动回退上月；映射采用"覆写默认结构"方式，建议新增品类时同步更新 `DATA_FORMAT` 与接口。
4. **环比年度口径**：detailCard 年度"对比信息"只展示同比，环比仅在本月口径计算。
5. **单位**：接口金额都以"元"为单位，页面统一用 `formatIncomeNumber`（<1万千分位，≥1万转"x.xx万"）或环图中心 `(x/10000)万` 展示。
