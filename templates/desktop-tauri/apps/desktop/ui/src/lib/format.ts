// format.ts: numbers, dates and times by the page's language. Everything goes through Intl, then one rule:
// between a number and its unit stands U+00A0, never U+202F or U+2009 (some Intl outputs use those).
import type { Lang } from "../i18n";

const NBSP = "\u00a0";
const clean = (s: string) => s.replace(/[\u202f\u2009]/g, NBSP);
const loc = (lang: Lang) => (lang === "de" ? "de-DE" : "en-GB");

/** 10.000 (de) / 10,000 (en) */
export function num(lang: Lang, n: number): string {
  return clean(new Intl.NumberFormat(loc(lang)).format(n));
}

/** "2026-10-10" or "2026-10-10T08:12" as a local date */
export function parseDate(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.slice(0, 10).split("-").map(Number);
  const [hh = 0, mm = 0] = iso.slice(11, 16).split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

/** 10.10.2026 (de) / 2026-10-10 (en), as the guide's data page writes them */
export function date(lang: Lang, iso: string): string {
  if (lang === "en") return iso.slice(0, 10);
  const d = parseDate(iso);
  return clean(new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d));
}

/** 08:12, always 24 hours */
export function time(lang: Lang, iso: string): string {
  return clean(
    new Intl.DateTimeFormat(loc(lang), { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(parseDate(iso)),
  );
}

/** 10.10.2026, 08:12: the day and the time of a change */
export function dateTime(lang: Lang, iso: string): string {
  return `${date(lang, iso)}, ${time(lang, iso)}`;
}
