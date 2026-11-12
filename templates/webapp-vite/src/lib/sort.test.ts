import { expect, test } from "vitest";
import { firstDirection, sortOrder } from "./sort";

test("numbers start from the largest, words from A", () => {
  expect(firstDirection([1250, null, 38.9])).toBe("descending");
  expect(firstDirection(["Miete", "Bücher"])).toBe("ascending");
});

test("a gap goes last in both directions, equal rows keep their order", () => {
  const amounts = [1250, 412.3, null, 38.9, 412.3];
  expect(sortOrder(amounts, "descending", "de")).toEqual([0, 1, 4, 3, 2]);
  expect(sortOrder(amounts, "ascending", "de")).toEqual([3, 1, 4, 0, 2]);
});

test("words are compared as the language does", () => {
  expect(sortOrder(["Strom", "Äpfel", "Bücher"], "ascending", "de")).toEqual([1, 2, 0]);
});
