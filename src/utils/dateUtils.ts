import { DayOfWeek } from '../types';

export const DAY_NAMES: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const WEEK_DAYS_ORDER: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Timezone-safe parsing of YYYY-MM-DD string to year, month, and day
 */
export function parseYmd(dateStr?: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const clean = String(dateStr).slice(0, 10);
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10), // 1-12
    day: parseInt(match[3], 10), // 1-31
  };
}

/**
 * Timezone-safe creation of Date object at midday (12:00:00) to avoid any DST / midnight day-shifting
 */
export function parseYmdToLocalDate(dateStr?: string): Date {
  const parts = parseYmd(dateStr);
  if (parts) {
    return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
  }
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Returns YYYY-MM-DD formatted string in local time
 */
export function formatYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Autonomously returns current day name and YYYY-MM-DD date string
 */
export function getTodayInfo(): {
  dayName: DayOfWeek;
  dateStr: string;
  dateNumber: number;
} {
  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  return {
    dayName,
    dateStr: formatYmd(now),
    dateNumber: now.getDate(),
  };
}

/**
 * Returns Monday of the week containing the given date (at midday to avoid timezone shifts)
 */
export function getMondayOfWeek(d: Date = new Date()): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export interface DayInfo {
  name: DayOfWeek;
  date: number; // day of month, e.g. 4
  dateStr: string; // YYYY-MM-DD, e.g. '2026-10-04'
  monthShort: string; // e.g. 'OCT'
  isToday: boolean;
}

/**
 * Autonomously generates the 7 days (Monday -> Sunday) of the week,
 * offset by `offsetWeeks` from the current real week.
 */
export function getWeekDays(offsetWeeks: number = 0): DayInfo[] {
  const now = new Date();
  const todayYmd = formatYmd(now);

  const currentMonday = getMondayOfWeek(now);
  if (offsetWeeks !== 0) {
    currentMonday.setDate(currentMonday.getDate() + offsetWeeks * 7);
  }

  return WEEK_DAYS_ORDER.map((name, i) => {
    const dayDate = new Date(currentMonday);
    dayDate.setDate(currentMonday.getDate() + i);

    const dateStr = formatYmd(dayDate);
    const monthShort = dayDate
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase();
    const isToday = dateStr === todayYmd;

    return {
      name,
      date: dayDate.getDate(),
      dateStr,
      monthShort,
      isToday,
    };
  });
}

/**
 * Autonomously returns the YYYY-MM-DD for any DayOfWeek in the current week (or offset week)
 */
export function getYmdForDayOfWeek(dayName: DayOfWeek, offsetWeeks: number = 0): string {
  const monday = getMondayOfWeek(new Date());
  if (offsetWeeks !== 0) {
    monday.setDate(monday.getDate() + offsetWeeks * 7);
  }
  const idx = WEEK_DAYS_ORDER.indexOf(dayName);
  if (idx === -1) {
    return formatYmd(new Date());
  }
  const target = new Date(monday);
  target.setDate(monday.getDate() + idx);
  return formatYmd(target);
}

/**
 * Autonomously returns a map of all 7 days of the week to their YYYY-MM-DD strings
 */
export function getCurrentWeekDayToYmd(offsetWeeks: number = 0): Record<DayOfWeek, string> {
  const days = getWeekDays(offsetWeeks);
  const result = {} as Record<DayOfWeek, string>;
  for (const d of days) {
    result[d.name] = d.dateStr;
  }
  return result;
}

/**
 * Converts a YYYY-MM-DD or ISO string to DayOfWeek autonomously and timezone-safely
 */
export function getDayNameFromDateStr(dateStr?: string): DayOfWeek {
  if (!dateStr) return getTodayInfo().dayName;
  const parts = parseYmd(dateStr);
  if (parts) {
    const d = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
    return DAY_NAMES[d.getDay()] || 'Sunday';
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return DAY_NAMES[d.getDay()] || 'Sunday';
  }
  return getTodayInfo().dayName;
}

/**
 * Formats a date label for pills, e.g. 'Sun, Oct 04'
 */
export function formatDayShortLabel(dateStrOrDayName?: string): string {
  if (!dateStrOrDayName) {
    const today = getTodayInfo();
    return formatDayShortLabel(today.dateStr);
  }

  // If it's already a day name, convert to its date string for this week
  if (DAY_NAMES.includes(dateStrOrDayName as DayOfWeek)) {
    const ymd = getYmdForDayOfWeek(dateStrOrDayName as DayOfWeek);
    return formatDayShortLabel(ymd);
  }

  const parts = parseYmd(dateStrOrDayName);
  if (parts) {
    const d = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
    const shortDay = d.toLocaleString('en-US', { weekday: 'short' });
    const shortMonth = d.toLocaleString('en-US', { month: 'short' });
    const dayNum = String(d.getDate()).padStart(2, '0');
    return `${shortDay}, ${shortMonth} ${dayNum}`;
  }

  const d = new Date(dateStrOrDayName);
  if (!isNaN(d.getTime())) {
    const shortDay = d.toLocaleString('en-US', { weekday: 'short' });
    const shortMonth = d.toLocaleString('en-US', { month: 'short' });
    const dayNum = String(d.getDate()).padStart(2, '0');
    return `${shortDay}, ${shortMonth} ${dayNum}`;
  }

  return dateStrOrDayName;
}

/**
 * Checks whether a given date matches an expected day of week
 */
export function doesDateMatchDay(dateStr: string, expectedDay: DayOfWeek): boolean {
  return getDayNameFromDateStr(dateStr) === expectedDay;
}

/**
 * Safely extracts a YYYY-MM-DD date string from any task object across all supported fields
 */
export function extractTaskYmd(task?: {
  date?: string;
  details?: { isoDate?: string; date?: string; [key: string]: any };
  fixedData?: { day?: string; [key: string]: any };
}): string | null {
  if (!task) return null;
  const candidates = [
    task.date,
    task.fixedData?.day,
    task.details?.date,
    task.details?.isoDate,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      const match = c.trim().match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return match[1];
      }
    }
  }
  return null;
}

/**
 * Returns the YYYY-MM-DD for targetDay within the same week as referenceDateStr
 */
export function getYmdForDayInSameWeek(targetDay: DayOfWeek, referenceDateStr?: string): string {
  let refDate = new Date();
  if (referenceDateStr) {
    const parsed = parseYmd(referenceDateStr);
    if (parsed) {
      refDate = new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0);
    }
  }
  const monday = getMondayOfWeek(refDate);
  const idx = WEEK_DAYS_ORDER.indexOf(targetDay);
  if (idx === -1) return formatYmd(refDate);
  const target = new Date(monday);
  target.setDate(monday.getDate() + idx);
  return formatYmd(target);
}

/**
 * Returns the 7 days of the week containing referenceDateStr
 */
export function getWeekDaysForDate(referenceDateStr?: string): DayInfo[] {
  let refDate = new Date();
  if (referenceDateStr) {
    const parsed = parseYmd(referenceDateStr);
    if (parsed) {
      refDate = new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0);
    }
  }
  const monday = getMondayOfWeek(refDate);
  const todayYmd = formatYmd(new Date());

  return WEEK_DAYS_ORDER.map((name, i) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);

    const dateStr = formatYmd(dayDate);
    const monthShort = dayDate
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase();
    const isToday = dateStr === todayYmd;

    return {
      name,
      date: dayDate.getDate(),
      dateStr,
      monthShort,
      isToday,
    };
  });
}
