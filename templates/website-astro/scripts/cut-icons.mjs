// cut-icons.mjs: icons/sprite.svg of the copy with the symbols the site's pages use, to inline in place of the whole.
//   node cut-icons.mjs <the sebaro copy> <output.svg> <pages and scripts: files or folders>…
import fs from "node:fs";
import path from "node:path";

const [copy, out, ...site] = process.argv.slice(2);
if (!site.length) {
  console.error("usage: node cut-icons.mjs <the sebaro copy> <output.svg> <pages and scripts: files or folders>…");
  process.exit(2);
}
const walk = (p) => (fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((n) => walk(path.join(p, n))) : [p]);
const text = (f) => fs.readFileSync(f, "utf8");
const files = site.flatMap(walk).filter((f) => path.resolve(f) !== path.resolve(out) && /\.(html?|[cm]?js|json)$/.test(f));
// A symbol stays when a page names it (href="#search"), when a script of the site holds its id as a word, or when a
// script of the copy can name it (css/runtime-names*.json, "icons").
const used = new Set();
for (const f of files) {
  for (const m of text(f).matchAll(/\.[cm]?js$/.test(f) ? /[A-Za-z0-9_-]+/g : /#([A-Za-z][\w-]*)/g)) used.add(m[1] ?? m[0]);
}
for (const n of fs.readdirSync(path.join(copy, "css")).filter((n) => /^runtime-names(\.[a-z0-9-]+)?\.json$/.test(n))) {
  for (const script of Object.values(JSON.parse(text(path.join(copy, "css", n))).scripts)) {
    for (const id of script.icons ?? []) used.add(id);
  }
}
const sprite = text(path.join(copy, "icons", "sprite.svg"));
let kept = 0;
const cut = sprite.replace(/<symbol id="([^"]+)".*?<\/symbol>\n?/gs, (symbol, id) => (used.has(id) ? (kept++, symbol) : ""));
if (!kept) throw new Error("no symbol of the sprite is named in " + site.join(", "));
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, cut);
console.log(`${out}: ${Buffer.byteLength(cut)} of ${Buffer.byteLength(sprite)} bytes, ${kept} symbol(s)`);
