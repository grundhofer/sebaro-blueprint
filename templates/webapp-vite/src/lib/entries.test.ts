import { expect, test } from "vitest";
import { check, matches, missingExamples, nextId, seed, toCsv, toDraft, toValues, type Draft } from "./entries";

const samples = ["Eins", "Zwei", "Drei", "Vier"].map((title) => ({ title, note: "" }));
const draft = (values: Partial<Draft>): Draft => ({ ...toDraft(), title: "Keller aufräumen", effort: "90", ...values });

test("the first start has the four examples, marked as sample data", () => {
  const entries = seed(samples);
  expect(entries.map((entry) => [entry.id, entry.title, entry.state, entry.demo])).toEqual([
    ["1", "Eins", "open", true],
    ["2", "Zwei", "open", true],
    ["3", "Drei", "done", true],
    ["4", "Vier", "open", true],
  ]);
  expect(nextId(entries)).toBe("5");
});

test("only the missing examples come back: a deleted one, and one the user changed", () => {
  const entries = seed(samples).filter((entry) => entry.id !== "4");
  entries[1] = { ...entries[1], title: "Meins", demo: false };
  const added = missingExamples(entries, samples);
  expect(added.map((entry) => [entry.id, entry.title])).toEqual([
    ["4", "Zwei"],
    ["5", "Vier"],
  ]);
  expect(missingExamples([...entries, ...added], samples)).toEqual([]);
});

test("the filter and the search", () => {
  const [open, , done] = seed(samples);
  expect(matches(open, "open", "")).toBe(true);
  expect(matches(done, "open", "")).toBe(false);
  expect(matches(done, "done", "")).toBe(true);
  expect(matches(open, "all", "EIN")).toBe(true);
  expect(matches(open, "all", "zzz")).toBe(false);
});

test("a draft says what is wrong with it, field by field", () => {
  expect(check(draft({}))).toEqual({});
  expect(check(draft({ title: " ", effort: "" }))).toEqual({ title: "missing", effort: "missing" });
  expect(check(draft({ effort: "viel" }))).toEqual({ effort: "notNumber" });
  expect(check(draft({ effort: "601" }))).toEqual({ effort: "range" });
  expect(check(draft({ note: "x".repeat(201) }))).toEqual({ note: "tooLong" });
  expect(check(draft({}), true)).toEqual({ due: "noDate" });
});

test("a checked draft becomes the values of an entry", () => {
  expect(toValues(draft({ title: " Keller aufräumen ", effort: " 90 ", steps: ["Regal leeren"] }))).toEqual({
    title: "Keller aufräumen",
    category: "none",
    due: "",
    effort: 90,
    note: "",
    steps: ["Regal leeren"],
  });
});

test("the CSV quotes every field", () => {
  const [entry] = seed([{ title: 'Sagt „ja"', note: "" }, ...samples]);
  expect(toCsv([entry])).toBe(
    'id;title;category;due;effort;note;state\n"1";"Sagt „ja""";"health";"2026-10-30";"5";"";"open"',
  );
});
