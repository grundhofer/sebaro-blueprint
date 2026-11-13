import { expect, test } from "vitest";
import * as fmt from "./format";

test("numbers follow the language", () => {
  expect(fmt.num("de", 10000)).toBe("10.000");
  expect(fmt.num("en", 10000)).toBe("10,000");
});

test("dates and times", () => {
  expect(fmt.date("de", "2026-10-10")).toBe("10.10.2026");
  expect(fmt.date("en", "2026-10-10")).toBe("2026-10-10");
  expect(fmt.time("de", "2026-10-10T08:12")).toBe("08:12");
  expect(fmt.dateTime("de", "2026-10-28T09:40")).toBe("28.10.2026, 09:40");
});
