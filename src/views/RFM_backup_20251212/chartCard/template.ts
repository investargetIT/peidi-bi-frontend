import dayjs from "dayjs";

// 折线图 -测试
export const lineChartTest = {
  name: "lineChartTest",
  title: "折线图 -测试",
  text: "折线图",
  option: {
    tooltip: {
      trigger: "axis"
    },
    xAxis: {
      type: "category",
      // dayjs获取过去7天的日期数组
      data: [
        dayjs().add(-6, "d").startOf("day").format("YYYY-MM-DD"),
        dayjs().add(-5, "d").startOf("day").format("YYYY-MM-DD"),
        dayjs().add(-4, "d").startOf("day").format("YYYY-MM-DD"),
        dayjs().add(-3, "d").startOf("day").format("YYYY-MM-DD"),
        dayjs().add(-2, "d").startOf("day").format("YYYY-MM-DD"),
        dayjs().add(-1, "d").startOf("day").format("YYYY-MM-DD"),
        dayjs().startOf("day").format("YYYY-MM-DD")
      ],
      boundaryGap: false
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        type: "line",
        smooth: true,
        color: "#2563EB"
      }
    ]
  },
  style: {
    width: "50%"
  }
};

// 饼图 -测试
export const pieChartTest = {
  name: "pieChartTest",
  title: "饼图 -测试",
  text: "饼图",
  option: {
    legend: {
      top: "bottom"
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: [50, 200],
        center: ["50%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8
        },
        data: [
          { value: 40, name: "rose 1" },
          { value: 38, name: "rose 2" },
          { value: 32, name: "rose 3" },
          { value: 30, name: "rose 4" },
          { value: 28, name: "rose 5" },
          { value: 26, name: "rose 6" },
          { value: 22, name: "rose 7" },
          { value: 18, name: "rose 8" }
        ]
      }
    ]
  },
  style: {
    width: "50%"
  }
};

// 柱状图 -消费金额
export const barChartAmount = ({
  title = "消费金额",
  yAxisData = [],
  xAxisData = []
}) => {
  return {
    name: "barChartAmount" + title, // 确保name唯一
    title: title,
    text: "",
    option: {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: { show: false },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
        position: "top"
      },
      yAxis: {
        type: "category",
        data: yAxisData,
        axisLabel: {
          inside: false,
          // rotate: 38, //角度倾斜显示
          textStyle: {
            color: "#000",
            fontSize: "11"
          }
        }
      },
      series: [
        {
          name: title,
          type: "bar",
          data: xAxisData
        }
      ]
    },
    style: {
      width: "100%",
      chartMinHeight: "8000px"
    }
  };
};
