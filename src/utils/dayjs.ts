import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isYesterday from "dayjs/plugin/isYesterday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import dayjsBusinessDays from "dayjs-business-days2";
import "dayjs/locale/pt-br";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(dayjsBusinessDays);

dayjs.locale("pt-br");

export default dayjs;
