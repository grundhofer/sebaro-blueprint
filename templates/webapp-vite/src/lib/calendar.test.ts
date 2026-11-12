import { expect, test } from "vitest";
import { addDays, addMonths, column, weeks } from "./calendar";

test("steps by days and months", () => {
  expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
  expect(addMonths("2026-10-09", -12)).toBe("2025-10-09");
});

test("October 2026 in weeks that start on Monday and on Sunday", () => {
  const monday = weeks("2026-10", 1);
  expect(monday).toHaveLength(5);
  expect(monday[0]).toEqual([null, null, null, "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]);
  expect(monday[4][5]).toBe("2026-10-31");
  expect(weeks("2026-10", 7)[0]).toEqual([null, null, null, null, "2026-10-01", "2026-10-02", "2026-10-03"]);
  expect(column("2026-10-10", 1)).toBe(5);
  expect(column("2026-10-10", 7)).toBe(6);
});
