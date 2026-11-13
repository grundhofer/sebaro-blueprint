// sort.ts: the order of a table's rows by one column. A value that is missing (null) goes last in both
// directions: a gap is never 0. Rows that compare equal keep their order.
import type { Lang } from "../i18n";

export type Direction = "ascending" | "descending";
export type SortValue = number | string | null;

/** The first press on a column: numbers and dates from the largest, words from A. */
export function firstDirection(values: SortValue[]): Direction {
  return values.some((value) => typeof value === "number") ? "descending" : "ascending";
}

/** The places of the rows in their new order: `order[0]` is the index of the row that stands first. */
export function sortOrder(values: SortValue[], direction: Direction, lang: Lang): number[] {
  const collator = new Intl.Collator(lang, { numeric: true, sensitivity: "base" });
  const sign = direction === "ascending" ? 1 : -1;
  return values
    .map((value, at) => ({ value, at }))
    .sort((a, b) => {
      if (a.value === null || b.value === null) return a.value === b.value ? a.at - b.at : a.value === null ? 1 : -1;
      const c =
        typeof a.value === "number" && typeof b.value === "number"
          ? a.value - b.value
          : collator.compare(String(a.value), String(b.value));
      return c !== 0 ? sign * c : a.at - b.at;
    })
    .map((row) => row.at);
}
