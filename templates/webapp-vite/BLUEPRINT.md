# Web app blueprint

How every sebaro web app is built under the hood. The design rules are in
[`design/KERN.md`](../../design/KERN.md). This starter does not follow all of it yet; where they differ, the
blueprint wins (last section). A desktop app uses the same rules for its UI
([desktop blueprint](../desktop-tauri/BLUEPRINT.md)).

## Stack

- React 19 with TypeScript 6 in strict mode, built with Vite 8. Node 22, pnpm 11, lock file committed.
- State in zustand stores. Routes with react-router. Text with i18next and react-i18next.
- Tailwind 4 is optional and for layout only, through the copy's `tokens.tailwind.css`: no colour utilities, none
  of Tailwind's default palette.
- Any further dependency needs the owner's OK and one line with the reason in the project's docs. No copyleft
  licences, no library that calls a third-party server.

## Structure

```
src/main.tsx      entry: router, error boundary, start
src/pages/        one file per route
src/components/   parts of the app, each test beside its file
src/store/        zustand stores: they hold state, not rules
src/lib/          logic as plain functions, no React
src/i18n.ts       languages and keys
src/sebaro/       the sebaro copy, never edited
```

Rules of the product (what may happen, what a value means) live in `src/lib/` or a shared package, never in a
component or a store. A server part, where the product has one, is its own package beside the app.

## Text and language

Every string comes from the i18next resources, German and English from the start. A test checks that both
languages have the same keys; the linter forbids literal strings in JSX. The chosen language is stored under
`sb-lang`.

## Errors

Every route has an error boundary, and there is a not-found route. No promise is left unhandled (lint rule
`no-floating-promises`). A refusal or failure reaches the person as a sentence that says what is wrong and what to
do (core rule 21).

## Design system

- The copy is `src/sebaro/`. A small Vite plugin serves its classic scripts as files; `theme-init.js` runs first,
  before anything paints.
- CSS order: `fonts/fonts.css`, `tokens.css`, `icons/sprite.css`, `css/sebaro.css` (or only the parts the app
  uses), then the app's own CSS. The icon sprite is inlined at the top of `body`.
- The app's own classes carry one prefix and read only `var(--sb-*)`. No colour literal anywhere in `src/`.
- The parts of the copy are CSS and markup. The app wraps them in its own React components; behaviour that sebaro's
  classic scripts would add is written in React.
- CI checks the copy with `node src/sebaro/checks/verify-export.mjs src/sebaro --strict`.

## Tests

- Logic and components: Vitest, tests beside the files.
- End to end: Playwright against the built app. Every view in light and dark at phone and desktop width, with axe
  (WCAG 2.2 AA), no sideways scroll, no console error. Once at 200 % zoom at desktop width (core rule 30).
- Committed reference pictures for the main views are welcome, not required.

## Quality

ESLint (flat config, typescript-eslint with `no-floating-promises`, `no-explicit-any`, `no-console`), Prettier,
`tsc --noEmit`. All three run in CI.

## Security and privacy

- Content-Security-Policy `default-src 'self'; script-src 'self'; style-src 'self'`, widened only for what the
  product needs and can name. `<meta name="referrer" content="no-referrer">`.
- No request to a third-party server: fonts, icons and scripts come from the copy. An exception is a decided
  deviation of the product and stands in its privacy text.

## Size and speed

Checked in CI, the build fails above the budget:

- CSS of the first load: 75 KB gzip.
- JavaScript loaded at start: 250 KB gzip, no single start chunk above 120 KB gzip.
- Views that are not needed at start are loaded with `lazy()`.

## Build, release, updates

| Workflow | When | What |
|---|---|---|
| `ci` | every push and pull request | audit (`pnpm audit --prod --audit-level=high`), lint, format, type check, copy check, build, budgets, all tests |
| `deploy` | pull request: preview; main: production | static hosting with a preview address per pull request |

- Dependabot once a week for `npm`, minor and patch updates grouped, at most five open pull requests; and for
  `github-actions`. Actions are pinned by commit.
- The sebaro copy (profile `webapp`) is updated with `node src/sebaro/checks/update-copy.mjs`, as one commit of
  its own. Favicons and the manifest come from the kit in the copy (`product/`), from `sebaro.product.json`.

## Before you say done

```sh
pnpm lint && pnpm check        # ESLint, tsc
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # Playwright against the build
```

Then look at every changed view in light and dark, on the phone and wide, and say what you could not check.

## Where this starter still differs

Do not copy these parts of it:

- It ships no `deploy` workflow: the host is the product's choice. Its README says what the product adds.
- Of the large-text forms of the copy's `sb-fit.js` only one is written in React, the dialog actions that stand
  one under the other. The README lists the others.
- Values that read the same in every language (addresses, IDs, code samples) stand in
  `src/components/data/values.ts`, not in the i18next resources.
