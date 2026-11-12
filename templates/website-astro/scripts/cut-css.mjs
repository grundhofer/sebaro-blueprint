// cut-css.mjs: tokens.css and css/sebaro.css of the copy as one file, cut to what the site's pages use.
//   node cut-css.mjs <the sebaro copy> <output.css> <pages, scripts and the site's own CSS: files or folders>…
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { PurgeCSS } from "purgecss";

const postcss = createRequire(createRequire(import.meta.url).resolve("purgecss"))("postcss");   // purgecss's parser
const [copy, out, ...site] = process.argv.slice(2);
if (!site.length) {
  console.error("usage: node cut-css.mjs <the sebaro copy> <output.css> <pages, scripts, own CSS: files or folders>…");
  process.exit(2);
}

// The site's files. A page or a script is read for the words in it. A CSS file is read only for the custom
// properties it names, never for words: it names classes no page has to use. The output of an earlier run is skipped.
const walk = (p) => (fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((n) => walk(path.join(p, n))) : [p]);
const files = site.flatMap(walk).filter((f) => path.resolve(f) !== path.resolve(out) &&
  !/\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip|gz|mp[34]|webm|ogg|wav|map)$/i.test(f));
const text = (f) => fs.readFileSync(f, "utf8");
const words = files.filter((f) => !f.endsWith(".css")).map(text).join("\n");
if (!words) throw new Error("no page or script among " + site.join(", "));

// What exists only at run time: css/runtime-names.json of the copy, and one file for each pack it holds.
const names = { classes: [], attributes: [], tags: [], properties: [] };
for (const n of fs.readdirSync(path.join(copy, "css")).filter((n) => /^runtime-names(\.[a-z0-9-]+)?\.json$/.test(n))) {
  const doc = JSON.parse(text(path.join(copy, "css", n)));
  for (const part of [doc.states, ...Object.values(doc.scripts)]) {
    for (const kind in names) names[kind].push(...(part[kind] ?? []));
  }
}

// 1. Selectors. Every selector of a list is asked on its own and then kept or dropped as it is written. PurgeCSS
//    left to write the file would shorten the lists inside :is() and :where(), which changes what a selector weighs,
//    and would drop a selector made of pseudo-classes alone. A class, an element or an attribute counts as used when
//    a page or a script holds the word, or a script of the copy can set it; a pseudo-class always counts (/^:/), so
//    :hover, :target, :focus-visible and the like stay with their part.
const root = postcss.parse(["tokens.css", "css/sebaro.css"].map((f) => text(path.join(copy, f))).join("\n"));
const rules = [];
root.walkRules((rule) => { if (!/keyframes$/.test(rule.parent.name ?? "")) rules.push(rule); });
const [asked] = await new PurgeCSS().purge({
  content: [{ raw: words, extension: "html" }],
  css: [{ raw: rules.flatMap((rule, r) => rule.selectors.map((s, i) => `${s}{--keep:${r}_${i}}`)).join("\n") }],
  safelist: { standard: [...names.classes, ...names.tags, /^:/] },
  dynamicAttributes: names.attributes,
});
const keep = new Set(asked.css.match(/--keep:\d+_\d+/g));
rules.forEach((rule, r) => {
  const left = rule.selectors.filter((_, i) => keep.has(`--keep:${r}_${i}`));
  if (!left.length) rule.remove();
  else if (left.length < rule.selectors.length) rule.selectors = left;
});

// 2. Custom properties. One stays when a declaration that stays reads it, when a file of the site names it, when
//    the copy's icon rules read it (icons/sprite.css, which a page loads as it is) or when a script of the copy reads
//    it. A declaration in @keyframes counts like any other.
const named = [...files.map(text), text(path.join(copy, "icons", "sprite.css"))].join("\n");
const used = new Set([...names.properties, ...(named.match(/--[A-Za-z_][\w-]*/g) ?? [])]);
for (let grew = true; grew;) {
  grew = false;
  root.walkDecls((decl) => {
    if (decl.prop.startsWith("--") && !used.has(decl.prop)) return;
    for (const [, name] of decl.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (!used.has(name)) { used.add(name); grew = true; }
    }
  });
}
root.walkDecls(/^--/, (decl) => { if (!used.has(decl.prop)) decl.remove(); });

// 3. Comments go, and what is left empty. Never cut: @keyframes, and an at-rule as a whole: a rule in @media print,
//    forced-colors, @container or @supports stays when its selector does. (@font-face is in fonts/fonts.css, which is
//    no input.)
root.walkComments((comment) => comment.remove());
root.walk((node) => { delete node.raws.selector; delete node.raws.value; });   // a comment inside a selector or a value
for (let again = true; again;) {
  again = false;
  root.walk((node) => { if (node.nodes && !node.nodes.length) { node.remove(); again = true; } });
}
const css = root.toString();
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, css);
console.log(`${out}: ${Buffer.byteLength(css)} bytes, ${rules.filter((rule) => rule.parent).length} of ` +
  `${rules.length} rules, read from ${files.length} file(s)`);
