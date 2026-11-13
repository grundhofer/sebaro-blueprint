// og-pages.mjs: the page list of one language for the share images (WEB-09), in the format of
// public/sebaro/brand/og/pages.schema.json. Plain JavaScript, so scripts/og.mjs reads it with Node alone.
import { SITE, PAGES } from "../site.mjs";
import { wordsOf, urlOf, ogIdOf } from "./languages.mjs";

/** One page of the list: its own title and description; a page below a header word also names its path. */
function entry(page, lang) {
  const s = wordsOf(lang);
  const own = s.pages[page.key];
  const e = { id: ogIdOf(page.id, lang), url: urlOf(lang, page.path), title: own.title, description: own.description };
  if (page.type) e.type = page.type;
  if (page.nav && page.key !== page.nav) e.path = [SITE.name, s.nav[page.nav], own.crumb ?? own.title];
  if (own.readingMinutes) e.readingMinutes = own.readingMinutes;
  if (own.date) e.date = own.date;
  return e;
}

/** The site and every page in `lang`, a code of LANGUAGES (src/site.mjs). */
export function ogPages(lang) {
  return {
    site: { product: SITE.product, name: SITE.name, origin: SITE.origin, lang },
    pages: PAGES.map((page) => entry(page, lang)),
  };
}
