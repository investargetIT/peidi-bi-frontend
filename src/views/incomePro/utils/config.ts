import dayjs from "dayjs";

// 获取最近的一个周日的日期
export const getLastSunday = (): string => {
  const now = dayjs();
  const lastSunday = now.subtract(1, "week").endOf("week");
  return lastSunday.format("YYYY-MM-DD");
};
