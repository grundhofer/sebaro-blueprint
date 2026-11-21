---
name: sebaro
description: Build a new app, website, web app or desktop app in the sebaro style, or convert an existing project to sebaro (design rules plus the technology plan of the product kind). Use when the user says "im sebaro-Stil", "sebaro style", "auf sebaro umbauen", "sebaro übernehmen", or starts a product of the sebaro family. Not for changing the sebaro system itself.
---

# sebaro: build or convert a product

One family of products: the same rules for all, one preferred technology per product kind.

- **What and why** is the public Blueprint, the repository of this skill (its root is two folders above this file;
  resolve a symlink first, or clone `https://github.com/grundhofer/sebaro-blueprint`). Paths below start there.
- **With what and how** is the private Foundry `grundhofer/sebaro-foundry`: plan, starter and parts. Read it with `gh`.

## 1 Name the kind

| The wish | Kind | Preferred base | Rules of the kind |
|---|---|---|---|
| phone app | `android-compose` | Kotlin, Jetpack Compose | `design/platforms/mobile.md` |
| site that informs | `website-astro` | Astro, static | `design/platforms/website.md` |
| application in the browser | `webapp-vite` | React, TypeScript, Vite | `design/platforms/webapp.md` |
| desktop program | `desktop-tauri` | Tauri 2, React, Rust core | `design/platforms/desktop.md` |

Take the base without asking. When the wish does not fit it (iOS, another framework, a server of its own), ask the
owner before you build; never bend the base.

## 2 Read, in this order

1. `design/KERN.md`, the core rules, and `design/views.md`: every screen takes one view type.
2. The rules of the kind (table above).
3. The plan of the kind:
   `gh api repos/grundhofer/sebaro-foundry/contents/templates/<kind>/BLUEPRINT.md -H "Accept: application/vnd.github.raw"`

Look up only when needed: a part in `design/parts/<part>.md`, a rule cited as `[AKT-01]` in `rules/rules.json`.

## 3 A new product

1. Fetch the starter and follow its README (rename, then its checks once: green before any change):
   `gh release download -R grundhofer/sebaro-foundry -p 'sebaro-template-<kind>.tar.gz'`
2. Paste [`AGENTS-snippet.md`](AGENTS-snippet.md) into the product's `AGENTS.md`.
3. Write the list of views into the product: each with its view type and primary action; mark the one view that is
   the product's reason to exist. Ask the owner only what changes what you build, at most five questions, at once.
4. Build: frame and navigation, then list, detail and form with sample data, their four states, the core view,
   then data and logic as the plan structures them.

An existing project: [`convert.md`](convert.md).

## Always

- Parts and tokens come from the sebaro copy in the product (the folder with `sebaro-export.json`). Never edit it.
- A missing part is built beside the copy, with one line in `docs/sebaro-luecken.md`. A deviation from a rule is
  decided with the owner ([`design-exception.md`](design-exception.md)). Nothing enters sebaro for one product.
- Done means: the product's CI is green, every view was looked at in light and dark, narrow and wide, and you say
  what you did not check.
