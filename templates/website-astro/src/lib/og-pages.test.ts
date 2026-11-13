import { describe, expect, test } from "vitest";
import { LANGUAGES, PAGES, SITE } from "../site.mjs";
import { ogPages } from "./og-pages.mjs";

const page = (lang: string, id: string) => ogPages(lang).pages.find((p) => p.id === id);

describe("ogPages", () => {
  test("every page with a title of its own stands in the list of every language, each with an image of its own", () => {
    for (const { code } of LANGUAGES) expect(ogPages(code).pages).toHaveLength(PAGES.length);
    const ids = LANGUAGES.flatMap(({ code }) => ogPages(code).pages.map((p) => p.id));
    expect(new Set(ids).size).toBe(PAGES.length * LANGUAGES.length);
  });

  test("the list names the site, its product and the language", () => {
    expect(ogPages("en").site).toEqual({ product: SITE.product, name: SITE.name, origin: SITE.origin, lang: "en" });
  });

  test("a start page is a website and has no path", () => {
    expect(page("de", "start")).toEqual({
      id: "start",
      url: "/",
      type: "website",
      title: "Kleine Werkzeuge, ruhig gebaut.",
      description: "Projekte und Notizen von Alex Beispiel, gebaut mit sebaro.",
    });
  });

  test("an article names its path, its reading time and its date", () => {
    expect(page("de", "csv")).toMatchObject({
      path: ["Beispielseite", "Projekte", "Liste als CSV"],
      readingMinutes: 5,
      date: "2026-10-20",
    });
  });

  test("an English page stands under /en/, with its English words", () => {
    expect(page("en", "csv-en")).toMatchObject({
      url: "/en/projekte/liste-als-csv/",
      title: "Save a list as a CSV file",
      path: ["Beispielseite", "Projects", "List as CSV"],
    });
  });

  test("a header word and a page outside the header have no path", () => {
    expect(page("de", "projekte")).not.toHaveProperty("path");
    expect(page("de", "impressum")).not.toHaveProperty("path");
  });

  test("a language that is not in the list fails loud", () => {
    expect(() => ogPages("fr")).toThrow('no language "fr"');
  });
});
