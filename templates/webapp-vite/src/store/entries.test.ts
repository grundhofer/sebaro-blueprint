import { beforeEach, expect, test } from "vitest";
import { seed } from "../lib/entries";
import { useEntries } from "./entries";

const titles = () => useEntries.getState().entries.map((entry) => entry.title);

beforeEach(() =>
  useEntries.setState({ entries: seed([1, 2, 3, 4].map((n) => ({ title: `Beispiel ${n}`, note: "" }))) }),
);

test("a new entry gets the next id and is the user's own", () => {
  const id = useEntries.getState().add({ title: "Keller", category: "home", due: "", effort: 90, note: "", steps: [] });
  expect(id).toBe("5");
  expect(useEntries.getState().entries.at(-1)).toMatchObject({ title: "Keller", state: "open", demo: false });
});

test("a changed example is no example any more", () => {
  useEntries.getState().change("2", { state: "done" });
  expect(useEntries.getState().entries[1]).toMatchObject({ state: "done", demo: false });
});

test("restoring adds what is missing and keeps the rest; the store is kept on this device", () => {
  useEntries.getState().remove(["4"]);
  expect(titles()).toHaveLength(3);
  expect(useEntries.getState().restoreExamples()).toHaveLength(1);
  expect(useEntries.getState().restoreExamples()).toHaveLength(0);
  expect(titles()).toHaveLength(4);
  expect(JSON.parse(localStorage.getItem("musterapp-entries") ?? "{}").state.entries).toHaveLength(4);
});
