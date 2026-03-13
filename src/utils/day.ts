// src/utils/dayjs.ts
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import "dayjs/locale/zh-cn";

// 只需要注册一次
dayjs.extend(weekOfYear);
dayjs.locale("zh-cn");

export default dayjs;
