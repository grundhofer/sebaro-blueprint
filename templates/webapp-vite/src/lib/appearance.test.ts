import { afterEach, expect, test } from "vitest";
import { readSetting, storedTheme, writeSetting } from "./appearance";

afterEach(() => writeSetting("tone", null));

test("the other mode than the system's is stored; the system's own mode never", () => {
  expect(storedTheme("dark", "light")).toBe("dark");
  expect(storedTheme("light", "light")).toBeNull();
  expect(storedTheme("light", "dark")).toBe("light");
  expect(storedTheme("dark", "dark")).toBeNull();
});

test("a setting stands on <html> and in the storage, where theme-init.js reads it", () => {
  writeSetting("tone", "warm");
  expect(document.documentElement.getAttribute("data-sb-tone")).toBe("warm");
  expect(localStorage.getItem("sb-tone")).toBe("warm");
  expect(readSetting("tone")).toBe("warm");
  writeSetting("tone", null);
  expect(document.documentElement.hasAttribute("data-sb-tone")).toBe(false);
  expect(localStorage.getItem("sb-tone")).toBeNull();
});
