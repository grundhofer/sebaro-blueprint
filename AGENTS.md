# AGENTS.md: sebaro

sebaro is the design system and the technology blueprints of one family of products: phone apps, websites, web
apps and desktop apps. A product reads and copies from this repository. German overview for the owner:
[README.md](README.md). Site: <https://grundhofer.github.io/sebaro-guide/>.

## Building or converting a product

Read in this order and stop when you have what the task needs.

1. [`design/KERN.md`](design/KERN.md): the 31 core rules. Always.
2. [`design/views.md`](design/views.md): the 21 view types. Pick one for every screen.
3. The starter of your product kind. It is the model for structure, wiring, tests and release:

   | Product kind | Starter | Technology |
   |---|---|---|
   | Android app | [`templates/android-compose/`](templates/android-compose/README.md) | Kotlin, Jetpack Compose |
   | Website | [`templates/website-astro/`](templates/website-astro/README.md) | Astro |
   | Web app | [`templates/webapp-vite/`](templates/webapp-vite/README.md) | React, Vite, TypeScript |
   | Desktop app | [`templates/desktop-tauri/`](templates/desktop-tauri/README.md) | Tauri 2 with the web app's UI stack |
   | iOS app | [`templates/ios-swiftui/`](templates/ios-swiftui/README.md) | frozen: kept as it is until an iOS app is scheduled |

   Each starter's `BLUEPRINT.md` holds the technology rules (stack, structure, tests, release, updates) and ends
   with where the starter itself still differs; do not copy those parts. iOS has no blueprint.
4. The sebaro copy inside the product, the folder with `sebaro-export.json`: parts, tokens, fonts, icons. Its README
   says how it is wired; search it by name (`Sb…` in Kotlin, `sb-…` in CSS). Some parts leave one choice to you:
   [`design/parts.md`](design/parts.md) has a line for each of them. Never edit the copy. Get it and keep it
   current with its updater (Node 20 or newer, nothing else):

   ```sh
   curl -fsSLO https://github.com/grundhofer/sebaro-guide/releases/latest/download/update-copy.mjs
   node update-copy.mjs --profile android --out sebaro   # or website, webapp, desktop; --packs a,b adds packs
   node sebaro/checks/update-copy.mjs                    # later: the newest release, same profile and packs
   ```

   A copy holds the core of its product kind; its README lists the packs. The product's own files (launcher
   icon, sign tile, favicons) are made by the kit in the copy from a `sebaro.product.json`
   (`sebaro/product/PRODUCT-CONTRACT.md`).

In short (core rules 1 to 3): use what the copy has, build what is missing beside the copy, record gaps and
deviations in the product.

The two jobs as playbooks: [`skills/sebaro/new.md`](skills/sebaro/new.md) for a new product,
[`skills/sebaro/convert.md`](skills/sebaro/convert.md) for an existing project. `skills/sebaro/` is an agent skill:
link the folder into `~/.claude/skills/` (Claude Code) and `~/.agents/skills/` (Codex), and „bau das im
sebaro-Stil um“ is enough in any project. The section a product pastes into its own `AGENTS.md`:
[`templates/AGENTS-snippet.md`](templates/AGENTS-snippet.md).

## Look up only when needed

| Need | Where |
|---|---|
| reason and examples of a rule cited as `[AKT-01]` | `rules/rules.json`; `rules/home.json` says where each of its 228 rules lives now |
| markup of a web part with all its states, display of every kind of data | `docs/bauteile.html`, `docs/daten.html` |
| whole example pages | `docs/web.html`, `docs/app.html`, `docs/desktop.html` |
| details per platform and the component lists of the earlier rounds | [MANUAL.md](MANUAL.md), the former long version of this file |
| a review list per screen | [`templates/screen-checklist.md`](templates/screen-checklist.md) |
| what changed between versions | [CHANGELOG.md](CHANGELOG.md) |

## Changing this repository

Build, checks, release and the sync with the workshop: [MANUAL.md](MANUAL.md) §5. For the texts an agent reads by
default these rules hold:

- **Budgets in bytes**, checked in CI by `tools/check_budget.py`: this file 6,000, `design/KERN.md` 8,000,
  `design/views.md` 4,500, `design/parts.md` 8,000, a starter's `BLUEPRINT.md` 10,000, a file of a skill 5,000, the product snippet 1,500. To add something, remove
  something.
- **A new rule goes into a part, a starter or a check first.** It becomes a core rule only when none of those can
  carry it.
- **No history in these files.** Who decided what and when stands in `CHANGELOG.md` and in the workshop's decision
  log, not here.
- **Two products.** Something enters sebaro when a second product needs it. Until then it lives in the product
  that needs it.
