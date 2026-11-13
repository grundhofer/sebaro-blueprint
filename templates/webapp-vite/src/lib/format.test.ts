import { expect, test } from "vitest";
import * as fmt from "./format";

test("numbers and money follow the language", () => {
  expect(fmt.num("de", 10000)).toBe("10.000");
  expect(fmt.num("en", 10000)).toBe("10,000");
  expect(fmt.num("de", 7.1, 1)).toBe("7,1");
  expect(fmt.money("de", 12.9)).toBe("12,90 €");
  expect(fmt.money("en", 12.9)).toBe("€12.90");
});

test("U+00A0 stands between a number and its unit", () => {
  expect(fmt.unit("de", 8, "Gläser")).toBe("8 Gläser");
  expect(fmt.percent("de", 60)).toBe("60 %");
  expect(fmt.percent("en", 60)).toBe("60%");
});

test("dates and times", () => {
  expect(fmt.date("de", "2026-10-10")).toBe("10.10.2026");
  expect(fmt.date("en", "2026-10-10")).toBe("2026-10-10");
  expect(fmt.dayMonth("de", "2026-10-04")).toBe("04.10.");
  expect(fmt.dayMonth("en", "2026-10-04")).toBe("4 Oct");
  expect(fmt.dateLong("de", "2026-10-10")).toBe("Samstag, 10. Oktober");
  expect(fmt.monthYear("de", "2026-10-01")).toBe("Oktober 2026");
  expect(fmt.time("de", "2026-10-10T08:12")).toBe("08:12");
  expect(fmt.weekday("de", "2026-10-10")).toBe("Samstag");
  expect(fmt.weekday("en", "2026-10-10", true)).toBe("Sa");
});
