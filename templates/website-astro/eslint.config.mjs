// ESLint: typescript-eslint's recommended rules for scripts, tests and the frontmatter of pages, and the Astro
// plugin's for .astro files. The sebaro copy and what a build writes are never linted (a changed file there is an
// edited copy); the two cut scripts stay as the copy's README gives them.
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "public/",
      "sebaro-product/",
      "dist/",
      "build/",
      ".astro/",
      "test-results/",
      "playwright-report/",
      "scripts/cut-css.mjs",
      "scripts/cut-icons.mjs",
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
];
