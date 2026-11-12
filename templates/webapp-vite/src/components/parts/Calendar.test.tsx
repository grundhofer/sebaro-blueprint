import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Calendar } from "./Calendar";

const entries = { "2026-10-09": [{ time: "07:30", text: "Vitamin D" }] };
const day = (name: RegExp) => screen.getByRole("cell", { name });
const press = (key: string) => fireEvent.keyDown(document.activeElement ?? document.body, { key });

test("the month, today, the chosen day and its list", () => {
  render(<Calendar selected="2026-10-09" today="2026-10-10" entries={entries} none="Nichts eingetragen." />);
  expect(screen.getByRole("grid", { name: "Oktober 2026" })).toBeTruthy();
  expect(screen.getAllByRole("columnheader").map((head) => head.textContent)).toEqual([
    "Mo",
    "Di",
    "Mi",
    "Do",
    "Fr",
    "Sa",
    "So",
  ]);
  expect(day(/Freitag, 9\. Oktober, mit Eintrag/).getAttribute("aria-selected")).toBe("true");
  expect(day(/Samstag, 10\. Oktober, heute/).getAttribute("aria-current")).toBe("date");
  expect(screen.getByRole("heading", { name: "Freitag, 9. Oktober" })).toBeTruthy();
  expect(screen.getByText("Vitamin D")).toBeTruthy();
});

test("the keys move by day, week and month; Enter chooses the day", () => {
  render(<Calendar selected="2026-10-09" today="2026-10-10" entries={entries} none="Nichts eingetragen." />);
  day(/Freitag, 9\. Oktober/).focus();
  press("ArrowRight");
  expect(document.activeElement).toBe(day(/Samstag, 10\. Oktober/));
  press("ArrowDown");
  press("Home");
  expect(document.activeElement).toBe(day(/Montag, 12\. Oktober/));
  press("Enter");
  expect(screen.getByRole("heading", { name: "Montag, 12. Oktober" })).toBeTruthy();
  expect(screen.getByText("Nichts eingetragen.")).toBeTruthy();
  press("PageDown"); // the next month is shown and holds the focus
  expect(screen.getByRole("grid", { name: "November 2026" })).toBeTruthy();
  expect(document.activeElement).toBe(day(/12\. November/));
});

test("the month buttons show another month; an English week starts on Sunday", async () => {
  const { default: i18n } = await import("../../i18n");
  await i18n.changeLanguage("en");
  render(<Calendar selected="2026-10-09" today="2026-10-10" entries={entries} none="Nothing entered." />);
  expect(screen.getAllByRole("columnheader")[0].textContent).toBe("Su");
  fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
  expect(screen.getByRole("grid", { name: "September 2026" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  expect(screen.getAllByRole("cell").find((cell) => cell.tabIndex === 0)?.textContent).toContain("9 October");
});
