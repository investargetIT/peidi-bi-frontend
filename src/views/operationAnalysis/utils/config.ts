export const DATA_TIME = "2026.1~2026.3";

export const SIZE_CONFIG = {
  XS: {
    name: "XS",
    // 通用字体
    fontSize: 12,
    // L2 小号字体
    fontSizeL2: 9,
    fontWeight: "normal",
    rotate: 45,
    pieRadius: ["25%", "40%"]
  },
  MD: {
    name: "MD",
    fontSize: 16,
    fontSizeL2: 14,
    fontWeight: "bold",
    rotate: 0,
    pieRadius: ["45%", "70%"]
  }
};

// 数据格式： 建立统一的数据格式，应对Excel数据格式的差异
export const DATA_FORMAT = {
  E1: {
    income_pie: [
      { value: 431, name: "主粮", itemStyle: { color: "#118DFF" } },
      { value: 6215, name: "零食", itemStyle: { color: "#12239E" } },
      { value: 342, name: "其他收入", itemStyle: { color: "#E66C37" } }
    ],
    income_bar: {
      xAxisData: ["主粮", "零食", "其他收入"],
      series: [
        {
          name: "完成率",
          color: "#118DFF",
          data: [81, 107, 21]
        },
        {
          name: "全年进度",
          color: "#12239E",
          data: [5, 19, 4]
        },
        {
          name: "同比",
          color: "#E66C37",
          data: [17, 16, -53]
        }
      ]
    },
    // 用来判断利润正负的标识
    profit_flag: -1,
    profit_pie: [
      {
        value: 821,
        name: "利润",
        itemStyle: { color: "#12239E" }
      }
    ],
    profit_bar: {
      xAxisData: ["利润"],
      series: [
        {
          name: "完成率",
          color: "#118DFF",
          data: [91]
        },
        {
          name: "全年进度",
          color: "#12239E",
          data: [23]
        },
        {
          name: "同比",
          color: "#E66C37",
          data: [-18]
        }
      ]
    }
  },
  E2: {
    indicators_bar: {
      xAxisData: [
        "哈宠团队",
        "天猫团队",
        "京东拼多多团队",
        "抖音团队",
        "线下分销",
        "EKA",
        "商超",
        "跨境电商",
        "Vivaland"
      ],
      series: [
        {
          name: "本期累计",
          type: "bar",
          color: "#12239E",
          data: [814, 1834, 1030, 823, 361, 777, 1884, 27, 1]
        },
        {
          name: "去年同期",
          type: "bar",
          color: "#118DFF",
          data: [756, 1970, 771, 761, 298, 780, 1388, 0, 0]
        },
        {
          name: "达成情况",
          type: "line",
          yAxisIndex: 1,
          color: "#E66C37",
          data: [126, 85, 115, 98, 120, 114, 139, 49, 12]
        },
        {
          name: "达成进度",
          type: "line",
          yAxisIndex: 1,
          color: "#E044A7",
          data: [26, 13, 24, 16, 17, 18, 30, 8, 0]
        }
      ]
    }
  },
  E3: {
    pd_pie: [
      { value: 6433, name: "爵宴", itemStyle: { color: "#12239E" } },
      { value: 308, name: "SMB/⻮能", itemStyle: { color: "#118DFF" } },
      { value: 503, name: "好适嘉", itemStyle: { color: "#E66C37" } },
      { value: 1, name: "Vivaland", itemStyle: { color: "#E044A7" } }
    ],
    pd_bar: {
      xAxisData: ["爵宴", "SMB/⻮能", "好适嘉", "Vivaland"],
      series: [
        {
          name: "进度",
          color: "#118DFF",
          data: [16, 15, 10, 0]
        },
        {
          name: "同比",
          color: "#12239E",
          data: [16, -20, 20, 0]
        }
      ]
    },
    meatyway_pie: [
      {
        value: 4883,
        name: "爵宴⻛⼲零⻝",
        itemStyle: { color: "#198E44" }
      },
      { value: 578, name: "爵宴湿粮", itemStyle: { color: "#C1F087" } },
      { value: 348, name: "爵宴⻛⼲粮", itemStyle: { color: "#BDD643" } },
      { value: 121, name: "爵宴烘焙粮", itemStyle: { color: "#3EF882" } },
      { value: 504, name: "爵宴冻⼲", itemStyle: { color: "#21C149" } }
    ],
    meatyway_bar: {
      xAxisData: [
        "爵宴⻛⼲零⻝",
        "爵宴湿粮",
        "爵宴⻛⼲粮",
        "爵宴烘焙粮",
        "爵宴冻⼲"
      ],
      series: [
        {
          name: "进度",
          color: "#C1F087",
          data: [20, 19, 7, 3, 17]
        },
        {
          name: "同比",
          color: "#198E44",
          data: [13, 22, -13, 0, 51]
        },
        {
          name: "毛利率",
          color: "#BDD643",
          data: [28, 38, 37, 26, 42]
        }
      ]
    },
    healthy_pie: [
      { value: 215, name: "好适嘉湿粮", itemStyle: { color: "#EC8FCA" } },
      { value: 120, name: "好适嘉⼲粮", itemStyle: { color: "#E8D166" } },
      { value: 89, name: "好适嘉冻⼲", itemStyle: { color: "#D64550" } },
      {
        value: 79,
        name: "好适嘉其他 + 零食",
        itemStyle: { color: "#9071CE" }
      }
    ],
    healthy_bar: {
      xAxisData: [
        "好适嘉湿粮",
        "好适嘉⼲粮",
        "好适嘉冻⼲",
        "好适嘉其他 + 零食"
      ],
      series: [
        {
          name: "进度",
          color: "#E68F96",
          data: [12, 10, 9, 8]
        },
        {
          name: "同比",
          color: "#EC8FCA",
          data: [-8, 74, 191, -10]
        },
        {
          name: "毛利率",
          color: "#C163CA",
          data: [29, 58, 40, 40]
        }
      ]
    }
  },
  E4: {
    eliminating_walmart_info: ["37.53%", "-0.69%", "29.34%", "1.37%"],
    cost_structure_bar: {
      xAxisData: [
        "商品成本率",
        "履约费率",
        "营销费率",
        "人力成本率",
        "管理费率"
      ],
      series: [68.2, 8, 23.7, 9.8, 0.4]
    },
    synchronous_change_bar: {
      xAxisData: [
        "商品成本率",
        "履约费率",
        "营销费率",
        "人力成本率",
        "管理费率"
      ],
      series: [1.02, -0.3, 0.32, -0.11, -0.09]
    }
  }
};
