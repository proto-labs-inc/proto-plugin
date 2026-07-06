export const BOOKING_HOST = {
  name: "Maayan Albert",
  email: "maayan.albert@gmail.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
};

export const BOOKING_EVENT = {
  title: "quick chat",
  durationMinutes: 15,
  location: "Cal Video",
  timezone: "America/Los Angeles",
  timezoneLabel: "America/Los_Angeles",
};

export const BOOKING_GUEST = {
  name: "Maayan Albert",
  email: "maayan.albert@gmail.com",
  notes: "",
};

/** July 2026 — Sunday the 5th has a “today” dot; Mon 6 is the default selection. */
export const BOOKING_MONTH = { year: 2026, month: 0 }; // month index set in helpers

export const BOOKING_DEFAULT_DATE = new Date(2026, 6, 6);

export const BOOKING_WEEK_START = new Date(2026, 6, 6);

export const BOOKING_LIST_DAYS = [
  new Date(2026, 6, 6),
  new Date(2026, 6, 7),
  new Date(2026, 6, 8),
  new Date(2026, 6, 9),
  new Date(2026, 6, 10),
  new Date(2026, 6, 13),
];

/** Times shown in month-picker right column for Mon Jul 6. */
export const BOOKING_MONDAY_SLOTS = [
  { hour: 9, minute: 0 },
  { hour: 9, minute: 15 },
  { hour: 9, minute: 30 },
  { hour: 10, minute: 15 },
  { hour: 10, minute: 30 },
  { hour: 10, minute: 45 },
  { hour: 11, minute: 0 },
  { hour: 11, minute: 15 },
  { hour: 11, minute: 30 },
  { hour: 11, minute: 45 },
];

export function getListViewSlots(dayIndex: number) {
  const baseHour = 9;
  const slots = [];
  for (let i = 0; i < 20; i += 1) {
    const totalMinutes = baseHour * 60 + i * 15;
    slots.push({
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    });
  }
  void dayIndex;
  return slots;
}

export const BOOKING_BUSY_BLOCKS = [
  {
    dayOffset: 1,
    startHour: 18,
    endHour: 21,
    label: "Busy",
    timeLabel: "18:00 - 21:00",
  },
  {
    dayOffset: 3,
    startHour: 11,
    endHour: 12,
    label: "Busy",
    timeLabel: "11:00 - 12:00",
  },
];

export function formatBookingTime(
  hour: number,
  minute: number,
  use24h: boolean,
): string {
  if (use24h) {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const minutePart = `:${minute.toString().padStart(2, "0")}`;
  return `${displayHour}${minutePart}${period}`;
}

export function formatBookingDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBookingDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBookingDayHeader(date: Date): string {
  const weekday = date
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase()
    .slice(0, 3);
  const day = date.getDate().toString().padStart(2, "0");
  return `${weekday} ${day}`;
}

export function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

export function formatSlotRange(
  date: Date,
  hour: number,
  minute: number,
  durationMinutes: number,
  use24h: boolean,
): string {
  const endTotal = hour * 60 + minute + durationMinutes;
  const endHour = Math.floor(endTotal / 60);
  const endMinute = endTotal % 60;
  return `${formatBookingTime(hour, minute, use24h)} – ${formatBookingTime(endHour, endMinute, use24h)}`;
}

export function parseTimeLabel(time: string): { hour: number; minute: number } {
  const match = time.match(/^(\d+):?(\d{0,2})(am|pm)$/i);
  if (!match) return { hour: 9, minute: 30 };
  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const period = match[3].toLowerCase();
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return { hour, minute };
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isDateAvailable(date: Date): boolean {
  if (date.getMonth() !== 6 || date.getFullYear() !== 2026) return false;
  if (date.getDate() < 6) return false;
  return !isWeekend(date);
}

export function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date | null; inMonth: boolean }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ date: null, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, inMonth: false });
  }

  return cells;
}
