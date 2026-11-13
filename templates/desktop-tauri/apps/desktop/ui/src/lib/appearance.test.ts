import { afterEach, expect, test } from "vitest";
import { readTheme, readTone, writeSetting } from "./appearance";

afterEach(() => {
  writeSetting("theme", null);
  writeSetting("tone", null);
});

test("a setting stands on <html> and in the storage, where theme-init.js reads it", () => {
  writeSetting("tone", "warm");
  expect(document.documentElement.getAttribute("data-sb-tone")).toBe("warm");
  expect(localStorage.getItem("sb-tone")).toBe("warm");
  expect(readTone()).toBe("warm");
  writeSetting("tone", null);
  expect(document.documentElement.hasAttribute("data-sb-tone")).toBe(false);
  expect(localStorage.getItem("sb-tone")).toBeNull();
  expect(readTone()).toBe("cool");
});

test("no chosen theme means: as the system", () => {
  expect(readTheme()).toBe("system");
  writeSetting("theme", "dark");
  expect(readTheme()).toBe("dark");
});
