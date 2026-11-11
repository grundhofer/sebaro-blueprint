---
name: sebaro
description: Build a new app, website, web app or desktop app in the sebaro style, or convert an existing project to sebaro (design system plus technology blueprint). Use when the user says "im sebaro-Stil", "sebaro style", "auf sebaro umbauen", "sebaro übernehmen", or starts a product of the sebaro family. Not for changing the sebaro system itself.
---

# sebaro: build or convert a product

sebaro is one design system and one technology blueprint per platform for a family of products. This skill is the
way in. Everything it names lives in the sebaro kit, the repository that contains this skill.

## Find the kit

The kit root is two folders above this file (`skills/sebaro/` inside it; resolve a symlink first). If the kit is not
on this machine, clone `https://github.com/grundhofer/sebaro-guide` (public) and use that copy.

## Read first

1. `<kit>/AGENTS.md`: the map.
2. `<kit>/design/KERN.md`: the 31 core rules.
3. `<kit>/design/views.md`: the 21 view types.

Read nothing else until a step below sends you there.

## Name the product kind

| Kind | Starter and blueprint |
|---|---|
| Android app | `<kit>/templates/android-compose/` |
| Website | `<kit>/templates/website-astro/` |
| Web app | `<kit>/templates/webapp-vite/` |
| Desktop app | `<kit>/templates/desktop-tauri/` |

A starter's `BLUEPRINT.md`, where it has one, holds the technology rules. Its README names what the starter does
not do yet.

## Then follow one playbook

- A new product: [`new.md`](new.md).
- An existing project that should become sebaro: [`convert.md`](convert.md).

## What always holds

- **Plan first.** Write the plan, show it to the owner, build after the OK. Ask at most five questions, and only
  those whose answer changes what you build.
- **Use what is there.** Parts and tokens come from the sebaro copy in the project. Never edit the copy.
- **Only when needed.** A missing part is built beside the copy and written into the project's gap list
  (`docs/sebaro-luecken.md`). A deviation is decided with the owner and recorded in the product.
- **Do not grow the system.** Nothing goes into sebaro because one product needs it.
- **Say what you did not check.** Done means: checks green, looked at in light and dark, on the phone and wide.
