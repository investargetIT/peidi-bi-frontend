/**
 * 计算百分比 商品曝光率、商品点击率等
 * @param count 次数
 * @param countSum 次数汇总
 * @param decimalPlaces 保留小数位数
 * @returns 百分比
 */
export const calculatePercentage = (
  count: number,
  countSum: number,
  decimalPlaces: number = 2
) => {
  if (countSum === 0) {
    return 0;
  }
  if (!count) return 0;
  return ((count / countSum) * 100).toFixed(decimalPlaces);
};
