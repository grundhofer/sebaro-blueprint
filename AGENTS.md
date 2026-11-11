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
   | Web app | [`templates/webapp-vite/`](templates/webapp-vite/README.md) | Vite, TypeScript |
   | Desktop app | [`templates/desktop-tauri/`](templates/desktop-tauri/README.md) | Tauri 2 |
   | iOS app | [`templates/ios-swiftui/`](templates/ios-swiftui/README.md) | frozen: kept as it is until an iOS app is scheduled |

   A starter with a `BLUEPRINT.md` has its technology rules there (architecture, dependencies, tests, release,
   updates). Every starter's README names what the starter does not do yet; do not copy those gaps.
4. The sebaro copy inside the product, the folder with `sebaro-export.json`: parts, tokens, fonts, icons. Its README
   says how it is wired; a list of its parts with one line each does not exist yet, so search the copy by name
   (`Sb…` in Kotlin, `sb-…` in CSS). Never edit it. How a product gets and updates it: [MANUAL.md](MANUAL.md) §4.

In short (core rules 1 to 3): use what the copy has, build what is missing beside the copy, record gaps and
deviations in the product.

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
  `design/views.md` 4,500, a starter's `BLUEPRINT.md` 10,000. To add something, remove something.
- **A new rule goes into a part, a starter or a check first.** It becomes a core rule only when none of those can
  carry it.
- **No history in these files.** Who decided what and when stands in `CHANGELOG.md` and in the workshop's decision
  log, not here.
- **Two products.** Something enters sebaro when a second product needs it. Until then it lives in the product
  that needs it.
