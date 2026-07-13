import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;

export const formatTime = (
  date: string | Date | Dayjs,
  timeFormat?: number | null,
  timeZone?: string | null
) => {
  return timeZone
    ? dayjs(date)
        .tz(timeZone)
        .format(timeFormat === 12 ? "h:mma" : "HH:mm")
    : dayjs(date).format(timeFormat === 12 ? "h:mma" : "HH:mm");
};

export const isSupportedTimeZone = (timeZone: string) => {
  try {
    dayjs().tz(timeZone);
    return true;
  } catch {
    return false;
  }
};

export const sortByTimezone = (timezoneA: string, timezoneB: string) => {
  const timezoneAGmtOffset = dayjs.utc().tz(timezoneA).utcOffset();
  const timezoneBGmtOffset = dayjs.utc().tz(timezoneB).utcOffset();

  if (timezoneAGmtOffset === timezoneBGmtOffset) return 0;

  return timezoneAGmtOffset < timezoneBGmtOffset ? -1 : 1;
};

export const isPreviousDayInTimezone = (time: string, timezoneA: string, timezoneB: string) => {
  const timeInTimezoneA = formatTime(time, 24, timezoneA);
  const timeInTimezoneB = formatTime(time, 24, timezoneB);
  if (time === timeInTimezoneB) return false;

  const hoursTimezoneBIsLater = timeInTimezoneB.localeCompare(timeInTimezoneA) === 1;
  const timezoneBIsEarlierTimezone = sortByTimezone(timezoneA, timezoneB) === 1;
  return hoursTimezoneBIsLater && timezoneBIsEarlierTimezone;
};

export const isNextDayInTimezone = (time: string, timezoneA: string, timezoneB: string) => {
  const timeInTimezoneA = formatTime(time, 24, timezoneA);
  const timeInTimezoneB = formatTime(time, 24, timezoneB);
  if (time === timeInTimezoneB) return false;

  const hoursTimezoneBIsEarlier = timeInTimezoneB.localeCompare(timeInTimezoneA) === -1;
  const timezoneBIsLaterTimezone = sortByTimezone(timezoneA, timezoneB) === -1;
  return hoursTimezoneBIsEarlier && timezoneBIsLaterTimezone;
};
