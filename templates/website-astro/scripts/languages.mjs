#!/usr/bin/env node
// languages.mjs: the build test of BLUEPRINT.md (Text and language) on the built pages in dist/, the step after the
// budgets in `npm run build`. Reads the languages from src/site.mjs: the first at the site root, every other under
// /<code>/ with the same paths. Exits 1, naming the address, when
//   - a page exists in one language and not in another (404.html holds every language and stands once, at the root)
//   - <html lang> is not the language of the page
//   - the head does not name the same page in every language with <link rel="alternate" hreflang>, or names more
//   - the language link does not lead to the same page in every language, in the order of the list
//   - the page's share image (og:image) is not in the build, or another page has the same one
//   node scripts/languages.mjs [folder]     default dist/; another folder to check a copy of it
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGES, SITE } from "../src/site.mjs";
import { urlOf } from "../src/lib/languages.mjs";

const dist = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist"));
const codes = LANGUAGES.map((l) => l.code);
const [first, ...others] = codes;

// every built page with its language and its path below the root of that language ("" for the start page)
const pages = fs
  .readdirSync(dist, { recursive: true, encoding: "utf8" })
  .map((f) => f.split(path.sep).join("/"))
  .filter((f) => f.endsWith(".html") && !f.startsWith("sebaro/") && f !== "404.html")
  .sort()
  .map((file) => {
    const top = file.split("/")[0];
    const lang = others.includes(top) ? top : first;
    const below = lang === first ? file : file.slice(top.length + 1);
    return { file, lang, path: below.replace(/(^|\/)index\.html$/, "$1") };
  });
if (!pages.length) {
  console.error(`languages: no page in ${dist} (npm run build)`);
  process.exit(2);
}

const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const findings = [];
const paths = [...new Set(pages.map((p) => p.path))].sort();
for (const p of paths) {
  const has = codes.filter((lang) => pages.some((q) => q.lang === lang && q.path === p));
  for (const lang of codes.filter((c) => !has.includes(c)))
    findings.push(`${urlOf(lang, p)}: no such page; it exists in ${has.join(", ")}`);
  console.log(`languages: ${has.map((lang) => urlOf(lang, p)).join(" · ")}`);
}

const images = new Map();
for (const { file, lang, path: p } of pages) {
  const html = fs.readFileSync(path.join(dist, file), "utf8");
  const at = urlOf(lang, p);
  const own = /<html\b[^>]*>/.exec(html)?.[0] ?? "";
  if (attr(own, "lang") !== lang) findings.push(`${at}: <html lang="${attr(own, "lang")}">, not "${lang}"`);

  const alternates = [...html.matchAll(/<link\b[^>]*\brel="alternate"[^>]*>/g)]
    .map(([tag]) => `${attr(tag, "hreflang")} ${attr(tag, "href")}`)
    .sort();
  const every = codes.map((code) => `${code} ${new URL(urlOf(code, p), SITE.origin).href}`).sort();
  if (alternates.join(", ") !== every.join(", "))
    findings.push(`${at}: alternates [${alternates.join(", ")}], expected [${every.join(", ")}]`);

  const group = /<span class="sb-language-switch"[^>]*>([\s\S]*?)<\/span><\/div>/.exec(html)?.[1] ?? "";
  const links = [...group.matchAll(/<a\b[^>]*>/g)].map(([tag]) => `${attr(tag, "hreflang")} ${attr(tag, "href")}`);
  const same = codes.map((code) => `${code} ${urlOf(code, p)}`);
  if (links.join(", ") !== same.join(", "))
    findings.push(`${at}: language link [${links.join(", ")}], expected [${same.join(", ")}]`);

  const image = /<meta property="og:image" content="([^"]*)"/.exec(html)?.[1];
  if (!image || !fs.existsSync(path.join(dist, new URL(image).pathname)))
    findings.push(`${at}: share image ${image ?? "(none in the head)"} is not in the build`);
  else if (images.has(image)) findings.push(`${at}: share image ${image} is also the one of ${images.get(image)}`);
  else images.set(image, at);
}

for (const line of findings) console.error(`languages: FAIL ${line}`);
console.log(
  `languages: ${codes.length} language(s) (${codes.join(", ")}), ${pages.length} page(s), ` +
    `${findings.length} finding(s)`,
);
process.exit(findings.length ? 1 : 0);
