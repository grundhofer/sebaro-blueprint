import { expect, test } from "vitest";
import de from "../../../../../i18n/de.json";
import { blank, chars, closeTab, kilobytes, matches, moveTab, seed, words } from "./notes";

const notes = seed(de.samples.notes);
const note = (id: string) => notes.find((one) => one.id === id)!;

test("the examples take their words from the string table", () => {
  expect(notes.map((one) => one.name)).toEqual([
    "Wochenplan",
    "Umzug Checkliste",
    "Gartenplan für das Frühjahr mit Beeten und Pflanzzeiten",
    "27. Oktober",
    "Einkauf",
  ]);
  expect(note("wochenplan").unsaved).toBe(true);
  expect(note("einkauf")).toMatchObject({ folder: null, online: true, trashed: false });
});

test("words, characters and size are counted from the text", () => {
  expect(words(note("einkauf"))).toBe(6);
  expect(chars(note("einkauf"))).toBe("Brot, Äpfel, 2 l Milch, Kaffee.".length);
  expect(kilobytes(note("einkauf"))).toBe(1);
  expect(words(blank(1, "Neue Notiz 1", new Date(2026, 10, 3, 8, 5)))).toBe(0);
});

test("a new note lies in the first folder and carries its day and time", () => {
  expect(blank(2, "Neue Notiz 2", new Date(2026, 10, 3, 8, 5))).toMatchObject({
    id: "neu-2",
    folder: "projekte",
    created: "2026-11-03",
    changed: "2026-11-03T08:05",
  });
});

test("the search reads the name, whatever the case", () => {
  expect(matches(note("garten"), " beeten ")).toBe(true);
  expect(matches(note("garten"), "Umzug")).toBe(false);
});

test("closing the current tab makes its neighbour current", () => {
  expect(closeTab(["a", "b", "c"], "b", "b")).toEqual({ open: ["a", "c"], current: "c" });
  expect(closeTab(["a", "b", "c"], "c", "c")).toEqual({ open: ["a", "b"], current: "b" });
  expect(closeTab(["a"], "a", "a")).toEqual({ open: [], current: null });
  expect(closeTab(["a", "b"], "a", "b")).toEqual({ open: ["a"], current: "a" });
});

test("a tab moves one place and stops at the ends", () => {
  expect(moveTab(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
  expect(moveTab(["a", "b", "c"], "b", 1)).toEqual(["a", "c", "b"]);
  expect(moveTab(["a", "b", "c"], "a", -1)).toEqual(["a", "b", "c"]);
});
