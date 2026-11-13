import { describe, expect, test } from "vitest";
import { LANGUAGES } from "../site.mjs";
import { ogIdOf, urlOf, wordsOf } from "./languages.mjs";

describe("languages", () => {
  test("German comes first, English is there too (core rule 26)", () => {
    expect(LANGUAGES[0].code).toBe("de");
    expect(LANGUAGES.map((l) => l.code)).toContain("en");
  });

  test("the first language stands at the site root, every other under its code, with the same path", () => {
    expect(urlOf("de", "")).toBe("/");
    expect(urlOf("de", "projekte/liste-als-csv/")).toBe("/projekte/liste-als-csv/");
    expect(urlOf("en", "")).toBe("/en/");
    expect(urlOf("en", "projekte/liste-als-csv/")).toBe("/en/projekte/liste-als-csv/");
  });

  test("a share image keeps the page's id in the first language and adds the code in every other", () => {
    expect(ogIdOf("csv", "de")).toBe("csv");
    expect(ogIdOf("csv", "en")).toBe("csv-en");
  });

  test("the words of a language come from its file; a code that is not in the list fails loud", () => {
    expect(wordsOf("en").theme).toBe("Light or dark");
    expect(() => wordsOf("fr")).toThrow('no language "fr" in LANGUAGES');
  });
});
