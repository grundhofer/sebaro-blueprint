# MAINTAINING.md: the sebaro Blueprint

How this repository is built, checked and released. Building a product starts at [AGENTS.md](AGENTS.md).

## By hand and generated

- By hand: `design/`, `rules/`, `skills/`, `tools/`, `docs/index.html`, `docs/bauteile.html` and `docs/daten.html`
  outside their marker blocks, `docs/assets/`.
- Generated, never edited: everything between `<!-- guide:… -->` and `<!-- /guide:… -->`, the pages at the old
  addresses (`MOVED` in `tools/build.py`), `docs/rules.json`, `docs/llms.txt`, `src/og/`, `docs/og/`.
- The sebaro copy, never edited: `docs/sebaro/` and `docs/sebaro-product/` (section *The sebaro copy*).
  `LICENSE.md` stays byte-identical to `docs/sebaro/LICENSE.md`.
- Rules change only in `rules/rules.json`; `rules/home.json` gives every rule its home. Never renumber an id; retire
  a rule with `"status": "offen"` and a `note`, or remove it with a changelog entry. Only an owner decision makes a
  rule `entschieden`; an agent adds it as `vorläufig` and says so. `design/KERN.de.md` follows `design/KERN.md`.

## Build

```sh
python3 tools/build.py              # marker blocks, the pages at the old addresses, the outputs
node tools/og.mjs                   # share images into docs/og/ and src/og/head/, then build.py again
python3 -m http.server -d docs 8000 # look at a changed page in light and dark
```

Blocks: `og`, `head`, `sprite`, `header`, `footer`, `tile`, `kern` (the core rules on the start page, from
`design/KERN.de.md`). Header and footer list `PAGES`. A new page starts from `src/page-template.html` and goes into
`PAGES`. After a new page or a changed `<h1>` or meta description: `build.py`, `og.mjs`, `build.py`; a title too
long for the share image fails the render. CI never renders: commit `docs/og/` and `src/og/`.

## The sebaro copy

`docs/sebaro/` is the copy of a release of the design system (profile `webapp`, every pack), written by the
release's own updater; `sebaro-export.json` in it records the release. `docs/sebaro-product/` holds the Blueprint's
own favicons, tile and sign, written by the copy's product kit from `sebaro.product.json`. The releases are those of
the private workshop: an update needs a GitHub login that can read it (`gh auth login`). CI has no token and never
asks for a newer release; it only checks that the copy is unchanged.

```sh
node docs/sebaro/checks/update-copy.mjs --check   # exit 1 when a newer release exists
node docs/sebaro/checks/update-copy.mjs           # the newest release; a new major version only with --release <tag>
cp docs/sebaro/LICENSE.md LICENSE.md
python3 docs/sebaro/product/product_kit.py build sebaro.product.json --copy docs/sebaro --out docs/sebaro-product --render
python3 tools/build.py && node tools/og.mjs && python3 tools/build.py
```

Then read the new sections of `docs/sebaro/CHANGES.md` (the updater prints them), run the checks and look at the
pages. What the copy does not hold is the Blueprint's own, kept by hand in `docs/assets/`: the specimen frames
(`demo.css`, `pages.css`) and the sample products the pages show (`products.css`, `products/`).

## Checks

`.github/workflows/check.yml` runs on pushes to `main` and on pull requests:

```sh
python3 tools/build.py --check      # blocks and outputs are fresh
python3 tools/check_site.py         # pages, links, no foreign requests, token-only CSS, rules, share images
python3 tools/check_budget.py       # word budgets, homes of the catalogue, KERN.md and KERN.de.md in step, citations
npm ci && node tools/check_a11y.mjs # axe WCAG 2.2 AA, overflow, console: light at 390 px, dark at 1440 px; the start page at 200 % text
node tools/og.mjs --check           # a fresh render gives the committed snippets (--png-bytes on the rendering machine)
node docs/sebaro/checks/verify-export.mjs --strict   # the copy is unchanged (no network)
python3 docs/sebaro/product/product_kit.py check sebaro.product.json --copy docs/sebaro --out docs/sebaro-product
python3 tools/test_check_site.py    # self-test of check_site.py's helpers (not in CI)
```

Each tool's docstring names its groups. Guide CSS uses only `var(--sb-*)` tokens, no colour literals, no shadows
(except inside a „Nicht so“ specimen, `.g-ex--dont`). Accessibility exceptions go into `tools/a11y-waivers.json`
with page, axe rule, a substring of the target and a reason, never as a blanket waiver.

## Releases

Blueprint and catalogue share one version (`rules/rules.json` → `version`). Every new, changed or removed rule is
named under „Unveröffentlicht“ in `CHANGELOG.md` and gets a newer `"changed"` date, else `check_site.py` (CHANGE)
fails. Major when a rule is dropped or reversed, minor for new rules, values or pages, patch for wording and
examples.

```sh
python3 tools/release.py <version> [--date YYYY-MM-DD]   # version, date, the one snapshot in rules/releases/; then build.py
```

## Public repository

Never commit personal data, local paths, accounts, e-mail addresses, session ids, numbers of the workshop's
decision log or names of unreleased products.
