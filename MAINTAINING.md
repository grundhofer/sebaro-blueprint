# MAINTAINING.md: the sebaro Guide

How this repository is built, checked, synced and released. Building a product starts at [AGENTS.md](AGENTS.md).

## By hand and generated

- By hand: `docs/index.html`, `docs/bauteile.html`, `docs/daten.html` outside their marker blocks, `docs/assets/`
  except `vendor/`, `rules/`, `design/`, `tools/`, `templates/`.
- Generated, never edited: everything between `<!-- guide:… -->` and `<!-- /guide:… -->`, the pages at the old
  addresses (`MOVED` in `tools/build.py`), `docs/rules.json`, `docs/llms.txt`, `src/og/`, `docs/og/`; and from the
  sync `docs/sebaro/`, `docs/assets/vendor/`, `docs/GUIDE-SYNC.json`, `docs/sebaro-product/`.
- Rules change only in `rules/rules.json`. Never renumber an id; retire a rule with `"status": "offen"` and a `note`,
  or remove it with a changelog entry. Only an owner decision makes a rule `entschieden`; an agent adds it as
  `vorläufig` and says so. `design/KERN.de.md` follows `design/KERN.md`.

## Build

```sh
python3 tools/build.py              # marker blocks, the pages at the old addresses, the outputs
node tools/og.mjs                   # share images into docs/og/ and src/og/head/, then build.py again
python3 -m http.server -d docs 8000 # look at a changed page in light and dark
```

Blocks: `og`, `head`, `sprite`, `header`, `footer`, `tile`, `kern` (the core rules on the start page, from
`design/KERN.de.md`). Header and footer list `PAGES`. A new page starts from `src/page-template.html` and goes into
`PAGES`. After a new page, a changed `<h1>` or meta description or a sync: `build.py`, `og.mjs`, `build.py`; a title
too long for the share image fails the render. CI never renders: commit `docs/og/` and `src/og/`.

## Checks

`.github/workflows/check.yml` runs on pushes to `main` and `sync/**` and on pull requests:

```sh
python3 tools/build.py --check      # blocks and outputs are fresh
python3 tools/check_site.py         # pages, links, no foreign requests, token-only CSS, rules, share images
python3 tools/sync_from_design.py --verify-local   # docs/sebaro/ untouched since the export
python3 tools/check_budget.py       # budgets, homes of the catalogue, KERN.md and KERN.de.md in step
npm ci && node tools/check_a11y.mjs # axe WCAG 2.2 AA, overflow, console; light, dark, 390, 1440 px; 200 % text
node tools/og.mjs --check           # a fresh render gives the committed snippets (--png-bytes on the rendering machine)
python3 tools/test_check_site.py    # self-test of check_site.py (not in CI)
```

Each tool's docstring names its groups. Guide CSS uses only `var(--sb-*)` tokens, no colour literals, no shadows
(except inside a „Nicht so“ specimen, `.g-ex--dont`).

Accessibility exceptions go into `tools/a11y-waivers.json` with page, axe rule, a substring of the target and a
reason, never as a blanket waiver. A page at an old address is checked as one: noindex, no script, a link home.

The workshop's demo check runs from a workshop checkout:
`python3 tools/check_demo.py <abs path>/docs/<page>.html --page web --skip content --no-write`, again with
`--tones warm`. Its colour group cannot run: it wants `assets/sb-colour-count.js` beside the page (here in `vendor/`).

## Sync with the workshop

`docs/sebaro/` is a web export of the workshop sebaroDesign; nothing in it is edited by hand.

```sh
python3 tools/sync_from_design.py          # export ../sebaroDesign (or --design, $SEBARO_DESIGN), verify, copy
python3 tools/sync_from_design.py --check  # exit 1 if docs/sebaro/ differs from a fresh export
```

Products that are not public are left out. Their ids come from the git-ignored `tools/sync.local.json`,
`--exclude-from FILE` or `$SEBARO_EXCLUDE_PRODUCTS`, never from a tracked file; `--require-exclusions` refuses an
empty list. The sync runs the export's product kit on `sebaro.product.json` into `docs/sebaro-product/`; its raster
files are drawn by hand (head of `tools/sync_from_design.py`). `LICENSE.md` stays byte-identical to
`docs/sebaro/LICENSE.md`.

The workshop's `guide-sync` workflow runs after every green `check` on its main branch: it exports that commit, runs
`sync_from_design.py --from-export … --require-exclusions` and `build.py` here and, when the guide is behind, pushes
`sync/<short sha>`. `.github/workflows/sync-pr.yml` opens a pull request from it; nothing merges by itself, a newer
sync closes the older one. When `check_site.py` warns (OG), render the share images on that branch before merging.
Needs here the setting „Allow GitHub Actions to create and approve pull requests“, in the workshop the deploy key and
the excluded products as secrets.

## Starters' CI

When `templates/` changes, `.github/workflows/templates.yml` runs what the own `ci` workflow of each web starter
runs (the desktop job also the Rust checks and a Tauri build on Linux). The Android starter cannot build here (its
build setup is private); its job runs the checks of its copy that need no Gradle. `templates-ios.yml` runs the
frozen iOS starter on `macos-latest`, only when `templates/ios-swiftui/` changes.

## Releases

Guide and catalogue share one version (`rules/rules.json` → `version`). Every new, changed or removed rule is named
under „Unveröffentlicht“ in `CHANGELOG.md` and gets a newer `"changed"` date, else `check_site.py` (CHANGE) fails.
Major when a rule is dropped or reversed, minor for new rules, values or pages, patch for wording and examples.

```sh
python3 tools/release.py <version> [--date YYYY-MM-DD]   # writes rules/releases/<version>.json; then build.py
```

The copies that products fetch with `update-copy.mjs` are release assets. The workshop pushes the branch
`copies/<tag>`; `.github/workflows/copies-release.yml`, started by hand with the tag, checks the branch, lets the
updater write and check a copy of every profile and drafts the release. A person publishes it.

## Public repository

Never commit personal data, local paths, accounts, e-mail addresses, session ids or names of unreleased products.
