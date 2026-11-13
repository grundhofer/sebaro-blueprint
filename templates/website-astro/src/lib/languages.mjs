// languages.mjs: the words of a language and where a page stands in it (core rule 26, WEB-10), from the list in
// src/site.mjs. Plain JavaScript, so the build scripts read it with Node alone.
import { LANGUAGES } from "../site.mjs";

/** The words of `lang`; a code that is not in LANGUAGES fails loud. */
export function wordsOf(lang) {
  const language = LANGUAGES.find((l) => l.code === lang);
  if (!language) throw new Error(`no language "${lang}" in LANGUAGES (src/site.mjs)`);
  return language.strings;
}

/** The address of the page at `path` (below the root of a language) in `lang`: the first language at the site root,
 *  every other under /<code>/. */
export function urlOf(lang, path) {
  return lang === LANGUAGES[0].code ? `/${path}` : `/${lang}/${path}`;
}

/** The id of a page's share image in `lang`: the page's own id in the first language, `<id>-<code>` in every other. */
export function ogIdOf(id, lang) {
  return lang === LANGUAGES[0].code ? id : `${id}-${lang}`;
}
