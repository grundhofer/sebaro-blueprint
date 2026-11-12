import { describe, expect, test } from "vitest";
import { PAGES, SITE } from "../strings.mjs";
import { ogPages } from "./og-pages.mjs";

const page = (lang: string, id: string) => ogPages(lang).pages.find((p) => p.id === id);

describe("ogPages", () => {
  test("every page with a title of its own stands in the list of its language, once", () => {
    const ids = ["de", "en"].flatMap((lang) => ogPages(lang).pages.map((p) => p.id));
    expect(ids.sort()).toEqual(PAGES.map((p) => p.id).sort());
    expect(ogPages("en").pages.map((p) => p.id)).toEqual(["start-en"]);
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

  test("a header word and a page outside the header have no path", () => {
    expect(page("de", "projekte")).not.toHaveProperty("path");
    expect(page("de", "impressum")).not.toHaveProperty("path");
  });

  test("a language without pages gives an empty list", () => {
    expect(ogPages("fr").pages).toEqual([]);
  });
});
