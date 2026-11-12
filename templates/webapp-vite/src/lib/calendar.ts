// calendar.ts: the days of a month as the weeks of a calendar grid, and the steps the keys take. Dates are local
// calendar days, written as ISO "YYYY-MM-DD".
import type { Lang } from "../i18n";
import { parseDate } from "./format";

const pad = (n: number) => String(n).padStart(2, "0");

export function iso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(day: string, n: number): string {
  const d = parseDate(day);
  return iso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

/** The same day n months on, held to the last day of that month. */
export function addMonths(day: string, n: number): string {
  const d = parseDate(day);
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return iso(new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)));
}

/** The first day of the week in a language: 1 = Monday … 7 = Sunday. German weeks start on Monday, English ones
 *  on Sunday. */
export function firstWeekday(lang: Lang): number {
  return lang === "de" ? 1 : 7;
}

/** The column of a day in a week that starts on `first`: 0 … 6. */
export function column(day: string, first: number): number {
  return ((parseDate(day).getDay() || 7) - first + 7) % 7;
}

/** The weeks of the month of `month` ("YYYY-MM" or a day in it): seven places each, null outside the month. */
export function weeks(month: string, first: number): Array<Array<string | null>> {
  const start = `${month.slice(0, 7)}-01`;
  const days = new Date(parseDate(start).getFullYear(), parseDate(start).getMonth() + 1, 0).getDate();
  const places: Array<string | null> = Array.from({ length: column(start, first) }, () => null);
  for (let day = 0; day < days; day++) places.push(addDays(start, day));
  while (places.length % 7) places.push(null);
  return Array.from({ length: places.length / 7 }, (_, week) => places.slice(week * 7, week * 7 + 7));
}
