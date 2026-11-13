// Every visible word comes from the strings of its language in src/strings/ (TEC-10, D87; README): no page, part or
// layout writes a word into its markup; the words come in through {…} expressions. Read by tests/visible-text.ts (the
// template part of each .astro file, after its frontmatter). And every language of src/site.mjs has every string the
// others have (core rule 26).
import { readdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { LANGUAGES } from "../src/site.mjs";
import { literalWords } from "./visible-text";

const root = new URL("../src/", import.meta.url).pathname;

test("no literal word in the markup of a page, a part or the layout", () => {
  const files = readdirSync(root, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".astro"));
  expect(files.length).toBeGreaterThan(5);
  expect(files.flatMap((f) => literalWords(root + f, `src/${f}`))).toEqual([]);
});

/** Every key of a language's words, objects by key and lists by place, down to each value; an empty string is none. */
function keys(value: unknown, at = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => keys(v, `${at}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => keys(v, at ? `${at}.${k}` : k));
  return typeof value === "string" && !value.trim() ? [] : [at];
}

test("every language has every string the others have", () => {
  const all = [...new Set(LANGUAGES.flatMap((l) => keys(l.strings)))];
  expect(all.length).toBeGreaterThan(100);
  for (const { code, strings } of LANGUAGES) {
    const own = new Set(keys(strings));
    expect(
      all.filter((k) => !own.has(k)),
      `missing in src/strings/${code}.mjs`,
    ).toEqual([]);
  }
});
