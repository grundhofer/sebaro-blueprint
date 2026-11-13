import { afterEach, expect, test } from "vitest";
import { otherTheme, readSetting, writeSetting } from "./appearance";

afterEach(() => writeSetting("tone", null));

test("a press shows the other mode; the system's own mode is never stored", () => {
  expect(otherTheme(null, "light")).toEqual({ shown: "dark", chosen: "dark" });
  expect(otherTheme("dark", "light")).toEqual({ shown: "light", chosen: null });
  expect(otherTheme(null, "dark")).toEqual({ shown: "light", chosen: "light" });
  expect(otherTheme("light", "dark")).toEqual({ shown: "dark", chosen: null });
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
