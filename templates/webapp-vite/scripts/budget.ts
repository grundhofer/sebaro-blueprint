// budget.ts: the size budgets of the blueprint, measured on dist/ after `vite build`. Exit 1 above a budget, so
// `pnpm build` fails. What index.html loads at the start: its stylesheets, its scripts and the modules it preloads
// (the chunks the entry imports); what a route loads later with lazy() is not counted.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const KB = 1000;
const BUDGET = { css: 75 * KB, script: 250 * KB, chunk: 120 * KB };

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

const lines = [
  { what: `CSS of the first load (${styles.length} files)`, bytes: sum(styles), budget: BUDGET.css },
  { what: `JavaScript loaded at start (${scripts.length} files)`, bytes: sum(scripts), budget: BUDGET.script },
  { what: `largest start chunk (${largest.file})`, bytes: largest.bytes, budget: BUDGET.chunk },
];
const kb = (bytes: number) => `${(bytes / KB).toFixed(1)} KB`;
for (const { what, bytes, budget } of lines) {
  process.stdout.write(`${bytes > budget ? "FAIL" : "ok  "}  ${what}: ${kb(bytes)} gzip of ${kb(budget)}\n`);
}
if (!styles.length || !scripts.length)
  throw new Error("dist/index.html loads no stylesheet or no script: nothing was measured");
process.exitCode = lines.some(({ bytes, budget }) => bytes > budget) ? 1 : 0;
