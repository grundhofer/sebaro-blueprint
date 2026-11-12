#!/usr/bin/env node
// og.mjs: share images and their head tags in the site's own build (WEB-09, D96 (a)).
// Writes one page list per language (src/lib/og-pages.mjs), then runs the copy's generator on it through the product
// kit (public/sebaro/product/render.mjs share), which adds the sign tile of sebaro-product/: PNGs to public/og/, head
// snippets to build/og-head/<id>.head.html, which src/layouts/Base.astro puts into each page's <head>. The look comes
// from the copy's one template brand/og/template.html. The generator fails loud (exit 1, page id named) when a title
// needs more than three lines: then shorten the page's title in src/strings.mjs, never the image's.
// Needs Playwright with Chromium (npx playwright install chromium). Run by `npm run build`; alone: `npm run og`.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { strings } from "../src/strings.mjs";
import { ogPages } from "../src/lib/og-pages.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const render = path.join(root, "public", "sebaro", "product", "render.mjs");
const work = path.join(root, "build");
fs.mkdirSync(work, { recursive: true });

let status = 0;
for (const lang of Object.keys(strings)) {
  const list = { $schema: "../public/sebaro/brand/og/pages.schema.json", ...ogPages(lang) };
  if (!list.pages.length) continue;
  const file = path.join(work, `og-pages.${lang}.json`);
  fs.writeFileSync(file, JSON.stringify(list, null, 2) + "\n");
  const run = spawnSync(
    process.execPath,
    [
      render,
      "share",
      path.join(root, "sebaro-product"),
      "--pages",
      file,
      "--out",
      path.join(root, "public", "og"),
      "--head",
      path.join(work, "og-head"),
    ],
    { stdio: "inherit" },
  );
  if (run.status !== 0) status = run.status ?? 1;
}
process.exit(status);
