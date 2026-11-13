// Every page of the site in every language of src/site.mjs, light and dark, at 320, 390 and 1440 px, at 100 % and at
// real 200 % text (checks in sebaro-checks.ts: the page asked for with its HTTP status, heading, view and open
// overlays; no sideways scroll, no cut text or control value, axe 0 violations, no console or CSP error).
import { expect, type Page } from "@playwright/test";
import { LANGUAGES } from "../src/site.mjs";
import { urlOf, wordsOf } from "../src/lib/languages.mjs";
import { checkScreens, type Screen } from "./sebaro-checks";

const openFootnotePopover = async (page: Page) => {
  // a narrow screen (below 64rem, so also 1440 px at 200 % text) opens the note in the popover (BEL-07); a wide one
  // jumps to the note (BEL-02)
  await page.locator("#fnref-1").click();
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"));
};
const narrow = (width: number, scale: number) => width < 64 * 16 * scale;

// the screens of one language: its pages at their addresses, each heading in its words
const screens = (code: string): Screen[] => {
  const t = wordsOf(code);
  const p = t.pages;
  const at = (path: string) => urlOf(code, path);
  return [
    { name: `start-${code}`, path: at(""), heading: p.start.title, view: '[data-sb-view="start"]', overlay: null },
    { name: `apps-${code}`, path: at("apps/"), heading: p.apps.title, view: '[data-sb-view="apps"]', overlay: null },
    {
      name: `projekte-${code}`,
      path: at("projekte/"),
      heading: p.projects.title,
      view: '[data-sb-view="projekte"]',
      overlay: null,
    },
    {
      name: `artikel-${code}`,
      path: at("projekte/liste-als-csv/"),
      heading: p.article.title,
      view: '[data-sb-view="artikel"]',
      overlay: null,
    },
    {
      name: `artikel-fussnote-${code}`,
      path: at("projekte/liste-als-csv/"),
      heading: p.article.title,
      view: '[data-sb-view="artikel"]',
      overlay: (width, scale) => (narrow(width, scale) ? "sb-note-popover" : null),
      prepare: async (page) => {
        await openFootnotePopover(page);
        if (!(await page.evaluate(() => matchMedia("(max-width: 63.99rem)").matches)))
          await expect(page).toHaveURL(/#fn-1$/);
      },
    },
    {
      name: `ueber-${code}`,
      path: at("ueber/"),
      heading: p.about.title,
      view: '[data-sb-view="ueber"]',
      overlay: null,
    },
    {
      name: `kontakt-${code}`,
      path: at("kontakt/"),
      heading: p.contact.title,
      view: '[data-sb-view="kontakt"]',
      overlay: null,
    },
    {
      name: `impressum-${code}`,
      path: at("impressum/"),
      heading: `${p.imprint.title} ${t.demo}`,
      view: '[data-sb-view="impressum"]',
      overlay: null,
    },
    {
      name: `datenschutz-${code}`,
      path: at("datenschutz/"),
      heading: `${p.privacy.title} ${t.demo}`,
      view: '[data-sb-view="datenschutz"]',
      overlay: null,
    },
    {
      name: `barrierefreiheit-${code}`,
      path: at("barrierefreiheit/"),
      heading: `${p.accessibility.title} ${t.demo}`,
      view: '[data-sb-view="barrierefreiheit"]',
      overlay: null,
    },
    // an address that does not exist: the server answers 404 with the site's own page, which holds every language
    // (the h1 in the first) and has a part in this one
    {
      name: `404-${code}`,
      path: at("gibt-es-nicht/"),
      status: 404,
      heading: wordsOf(LANGUAGES[0].code).pages.notFound.title,
      view: `[data-sb-view="nicht-gefunden"] section[lang="${code}"]`,
      overlay: null,
    },
  ];
};

checkScreens(LANGUAGES.flatMap(({ code }) => screens(code)));
