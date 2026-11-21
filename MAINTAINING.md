# MAINTAINING.md: the sebaro Blueprint

How this repository is built, checked and released. Building a product starts at [AGENTS.md](AGENTS.md).

## By hand and generated

- By hand: `design/`, `rules/`, `skills/`, `tools/`, `docs/index.html`, `docs/bauteile.html` and `docs/daten.html`
  outside their marker blocks, `docs/assets/` except `vendor/`.
- Generated, never edited: everything between `<!-- guide:… -->` and `<!-- /guide:… -->`, the pages at the old
  addresses (`MOVED` in `tools/build.py`), `docs/rules.json`, `docs/llms.txt`, `src/og/`, `docs/og/`.
- From the workshop, never edited: `docs/sebaro/`, `docs/assets/vendor/`, `docs/sebaro-product/` and
  `docs/GUIDE-SYNC.json`. They stay as checked in until the copy of a workshop release replaces them. `LICENSE.md`
  stays byte-identical to `docs/sebaro/LICENSE.md`.
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

## Checks

`.github/workflows/check.yml` runs on pushes to `main` and on pull requests:

```sh
python3 tools/build.py --check      # blocks and outputs are fresh
python3 tools/check_site.py         # pages, links, no foreign requests, token-only CSS, rules, share images
python3 tools/check_budget.py       # word budgets, homes of the catalogue, KERN.md and KERN.de.md in step, citations
npm ci && node tools/check_a11y.mjs # axe WCAG 2.2 AA, overflow, console: light at 390 px, dark at 1440 px; the start page at 200 % text
node tools/og.mjs --check           # a fresh render gives the committed snippets (--png-bytes on the rendering machine)
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
