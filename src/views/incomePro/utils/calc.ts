import dayjs from "dayjs";

/**
 * 判断警示灯状态
 * 实际值>=(期望值-5%)为绿灯，否则为红灯
 * @param actualValue 实际值 传百分数
 * @param expectedValue 期望值 传百分数
 * @returns "success" | "danger"
 */
export function getWarningLightStatus(
  actualValue: number | string,
  expectedValue: number | string
): "success" | "danger" {
  if (
    actualValue === null ||
    actualValue === undefined ||
    actualValue === "" ||
    expectedValue === null ||
    expectedValue === undefined ||
    expectedValue === ""
  ) {
    return "danger";
  }

  const actual = Number(actualValue);
  const expected = Number(expectedValue);

  if (isNaN(actual) || isNaN(expected)) {
    return "danger";
  }

  if (expected < 0) {
    return "danger";
  }

  const warningLightStatus = actual >= expected - 5 ? "success" : "danger";
  return warningLightStatus;
}

/**
 * 两个数相除
 * @param num1 被除数
 * @param num2 除数
 * @param decimalPlaces 保留小数位数，默认为 2
 * @returns 除法结果，保留指定小数位
 */
export function divide(
  num1: number | string,
  num2: number | string,
  decimalPlaces: number = 2
): number {
  // 空值检查
  if (
    num1 === null ||
    num1 === undefined ||
    num1 === "" ||
    num2 === null ||
    num2 === undefined ||
    num2 === ""
  ) {
    return 0;
  }

  // 类型转换
  const numerator = Number(num1);
  const denominator = Number(num2);

  // NaN 检查
  if (isNaN(numerator) || isNaN(denominator)) {
    return 0;
  }

  // 除零保护
  if (denominator === 0) {
    return 0;
  }

  // 计算结果并保留指定小数位
  const result = numerator / denominator;
  // console.log(result);
  return Number(result.toFixed(decimalPlaces));
}

/**
 * 获取本月第几周
 */
export const getWeekOfMonth = (): number => {
  const now = dayjs();
  const startOfMonth = now.startOf("month");

  // 当前周数 - 月初周数 + 1
  return now.week() - startOfMonth.week() + 1;
};

/**
 * 格式化数字为万单位
 * @param value 数值
 * @returns 格式化后的字符串
 */
export const formatToWan = (value: number) => {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + "万";
  }
  return value.toString();
};
