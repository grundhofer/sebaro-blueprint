import { expect, test } from "vitest";
import { resources } from "./i18n";

/** Every key of a resource tree as a path: "list.title", "samples.0.note". */
function keys(node: unknown, at = ""): string[] {
  if (node === null || typeof node !== "object") return [at];
  return Object.entries(node).flatMap(([key, value]) => keys(value, at ? `${at}.${key}` : key));
}

test("German and English have the same keys", () => {
  expect(keys(resources.en.translation)).toEqual(keys(resources.de.translation));
});
