// site.mjs: the site, its languages and its pages. Read by the layout and the pages, the share images (scripts/og.mjs),
// the build test of the languages (scripts/languages.mjs) and the tests. Plain JavaScript, so the build scripts read it
// with Node alone.
import de from "./strings/de.mjs";
import en from "./strings/en.mjs";

export const SITE = {
  name: "Beispielseite",
  origin: "https://example.org",
  /** product id of the share images (WEB-09): the umbrella sign of sebaro as a placeholder, see README */
  product: "studio",
};

/** The languages, in the order of the language link (core rule 26, WEB-10). The first is at the site root, every other
 *  under /<code>/ with the same pages at the same paths. A further language: its words in src/strings/<code>.mjs, its
 *  pages under src/pages/<code>/, and its import and entry here. */
export const LANGUAGES = [
  { code: "de", strings: de },
  { code: "en", strings: en },
];

/** Every page with a title of its own, by its path below the root of a language; every language has every page. For
 *  the share images (WEB-09), the language link and the header word of a page. */
export const PAGES = [
  { id: "start", path: "", key: "start", type: "website" },
  { id: "apps", path: "apps/", key: "apps", nav: "apps" },
  { id: "projekte", path: "projekte/", key: "projects", nav: "projects" },
  { id: "csv", path: "projekte/liste-als-csv/", key: "article", nav: "projects" },
  { id: "ueber", path: "ueber/", key: "about", nav: "about" },
  { id: "kontakt", path: "kontakt/", key: "contact", nav: "contact" },
  { id: "impressum", path: "impressum/", key: "imprint" },
  { id: "datenschutz", path: "datenschutz/", key: "privacy" },
  { id: "barrierefreiheit", path: "barrierefreiheit/", key: "accessibility" },
];
