#!/usr/bin/env node
// cut.mjs: the copy's stylesheet and icon sprite, cut to what the site's pages use (BLUEPRINT.md, Size and speed).
// Runs the two scripts of the copy's README (section "Cut the stylesheet to what the pages use"), saved beside this
// file as they stand there, on the pages `npm run build` has just built into build/pages/:
//   cut-css.mjs    public/css/sebaro.cut.css   tokens.css and css/sebaro.css as one file, linked by Base.astro
//   cut-icons.mjs  build/sprite.svg            the sprite, inlined by Base.astro
// Only the pages are named, never their folder: build/pages/sebaro/ is a served copy of the whole stylesheet.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
process.chdir(path.resolve(here, ".."));

const built = path.join("build", "pages");
const pages = fs
  .readdirSync(built, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".html") && f.split(path.sep)[0] !== "sebaro")
  .map((f) => path.join(built, f))
  .sort();

function run(script, out, ...more) {
  const done = spawnSync(
    process.execPath,
    [path.join(here, script), path.join("public", "sebaro"), out, ...pages, ...more],
    { stdio: "inherit" },
  );
  if (done.status !== 0) process.exit(done.status ?? 1);
}
run("cut-css.mjs", path.join("public", "css", "sebaro.cut.css"), path.join("public", "css", "site.css"));
run("cut-icons.mjs", path.join("build", "sprite.svg"));
