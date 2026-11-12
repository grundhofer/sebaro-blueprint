#!/usr/bin/env node
// site-root.mjs: copies the files a browser fetches from the site root (favicons, manifest) out of the product's
// folder sebaro-product/web/ into public/, as the copy's README asks (head.snippet.html, manifest.snippet.json
// and theme-color.json are not copied; src/layouts/Base.astro reads the snippet where it lies). Run by
// `npm run build` and `npm run dev`; the copies are not committed, so they cannot fall behind the folder. The copy
// knows no product: sebaro-product/ is what its product kit writes from sebaro.product.json with
// `npm run sebaro:product` (public/sebaro/README.md, section Product files).
// These files are the umbrella sign of sebaro (a placeholder): a real product declares itself in sebaro.product.json.
// They are brand files (all rights reserved, LICENSE.md in public/sebaro/), not under the template's licence.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = path.join(root, "sebaro-product", "web");
const skip = new Set(["head.snippet.html", "manifest.snippet.json", "theme-color.json"]);
if (!fs.existsSync(from)) {
  console.error("site-root: no sebaro-product/web/ (build it with public/sebaro/product/product_kit.py from sebaro.product.json)");
  process.exit(2);
}
for (const name of fs.readdirSync(from)) {
  if (skip.has(name) || name.startsWith(".")) continue;
  fs.copyFileSync(path.join(from, name), path.join(root, "public", name));
  console.log(`site-root: public/${name}`);
}
