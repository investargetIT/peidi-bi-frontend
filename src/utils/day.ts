// src/utils/dayjs.ts
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/zh-cn";

// 只需要注册一次
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.locale("zh-cn");

export default dayjs;
