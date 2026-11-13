// budget.ts: the size budgets of the blueprints, measured on dist/ after `vite build`. Exit 1 above a budget, so
// `pnpm build` fails. What index.html loads at the start: its stylesheets, its scripts and the modules it preloads
// (the chunks the entry imports); what a pane loads later with lazy() is not counted. And the fonts the app ships,
// as the files they are. The installer has its own budget: the release workflow measures it.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";

const KB = 1000;
const BUDGET = { css: 75 * KB, script: 250 * KB, chunk: 120 * KB, fonts: 250 * KB };

const dist = new URL("../dist/", import.meta.url);
const html = readFileSync(new URL("index.html", dist), "utf8");
const gzip = (file: string) => gzipSync(readFileSync(new URL(file.replace(/^\//, ""), dist)), { level: 9 }).length;
const loaded = (tag: RegExp) => [...html.matchAll(tag)].map((match) => ({ file: match[1], bytes: gzip(match[1]) }));

const styles = loaded(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g);
const scripts = [
  ...loaded(/<script[^>]*src="([^"]+)"/g),
  ...loaded(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g),
];
const sum = (files: typeof styles) => files.reduce((total, file) => total + file.bytes, 0);
const largest = scripts.reduce((a, b) => (b.bytes > a.bytes ? b : a));

const fonts = readdirSync(dist, { recursive: true, encoding: "utf8" })
  .filter((file) => /\.(woff2?|ttf|otf)$/.test(file))
  .map((file) => ({ file, bytes: statSync(new URL(file, dist)).size }));

const lines = [
  { what: `CSS of the first load (${styles.length} files)`, bytes: sum(styles), budget: BUDGET.css, as: "gzip " },
  {
    what: `JavaScript loaded at start (${scripts.length} files)`,
    bytes: sum(scripts),
    budget: BUDGET.script,
    as: "gzip ",
  },
  { what: `largest start chunk (${largest.file})`, bytes: largest.bytes, budget: BUDGET.chunk, as: "gzip " },
  { what: `fonts (${fonts.length} files)`, bytes: sum(fonts), budget: BUDGET.fonts, as: "" },
];
const kb = (bytes: number) => `${(bytes / KB).toFixed(1)} KB`;
for (const { what, bytes, budget, as } of lines) {
  process.stdout.write(`${bytes > budget ? "FAIL" : "ok  "}  ${what}: ${kb(bytes)} ${as}of ${kb(budget)}\n`);
}
if (!styles.length || !scripts.length || !fonts.length)
  throw new Error("dist/ holds no stylesheet, no script or no font: nothing was measured");
process.exitCode = lines.some(({ bytes, budget }) => bytes > budget) ? 1 : 0;
