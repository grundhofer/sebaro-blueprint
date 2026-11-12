#!/usr/bin/env node
// budgets.mjs: the build test of BLUEPRINT.md (Size and speed) on the built pages in dist/. Last step of
// `npm run build`: prints the sizes of every page and exits 1 above a budget.
//   HTML per page 100 KB · CSS per page 90 KB (every stylesheet the page links, as served)
//   inline script on the start page 1.5 KB · every other script comes from the list below
// A KB is 1000 bytes. dist/sebaro/ is the served copy, not a page of the site.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HTML_MAX = 100_000;
const CSS_MAX = 90_000;
const INLINE_SCRIPT_MAX = 1_500;
const START = "index.html";
const SCRIPTS = ["theme-init", "theme-button", "sb-tone", "sb-print", "sb-controls", "sb-notes", "sb-fit"].map(
  (name) => `/sebaro/js/${name}.js`,
);

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const pages = fs
  .readdirSync(dist, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".html") && f.split(path.sep)[0] !== "sebaro")
  .sort();
if (!pages.length) {
  console.error("budgets: no page in dist/ (npm run build)");
  process.exit(2);
}

const bytes = (n) => n.toLocaleString("en-US");
const over = [];
for (const page of pages) {
  const html = fs.readFileSync(path.join(dist, page), "utf8");
  const sheets = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(
    ([tag]) => /\bhref="([^"]*)"/.exec(tag)?.[1] ?? "",
  );
  let css = 0;
  for (const href of sheets) {
    const file = path.join(dist, href);
    if (href.startsWith("/") && fs.existsSync(file)) css += fs.statSync(file).size;
    else over.push(`${page}: the stylesheet "${href}" is not a file of the site`);
  }
  let inline = 0;
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = /\bsrc="([^"]*)"/.exec(attrs)?.[1];
    if (src === undefined) inline += Buffer.byteLength(body);
    else if (!SCRIPTS.includes(src))
      over.push(`${page}: the script "${src}" is not in the list of scripts/budgets.mjs`);
  }
  const size = Buffer.byteLength(html);
  console.log(
    `budgets: ${page}: HTML ${bytes(size)} · CSS ${bytes(css)} in ${sheets.length} file(s) · inline script ${bytes(inline)}`,
  );
  if (size > HTML_MAX) over.push(`${page}: HTML ${bytes(size)} bytes, budget ${bytes(HTML_MAX)}`);
  if (css > CSS_MAX) over.push(`${page}: CSS ${bytes(css)} bytes, budget ${bytes(CSS_MAX)}`);
  if (page === START && inline > INLINE_SCRIPT_MAX)
    over.push(`${page}: inline script ${bytes(inline)} bytes, budget ${bytes(INLINE_SCRIPT_MAX)}`);
}
for (const line of over) console.error(`budgets: FAIL ${line}`);
console.log(`budgets: ${pages.length} page(s), ${over.length} finding(s)`);
process.exit(over.length ? 1 : 0);
