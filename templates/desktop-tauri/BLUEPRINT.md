# Desktop blueprint

How every sebaro desktop app is built under the hood. The design rules are in
[`design/KERN.md`](../../design/KERN.md). The UI follows the
[web app blueprint](../webapp-vite/BLUEPRINT.md) (React, TypeScript, Vite, zustand, i18next, the sebaro copy, tests,
quality, size); this file adds what a desktop app needs on top. This starter does not follow all of it yet; where
they differ, the blueprint wins (last section).

## Stack

- Tauri 2. The UI as in the web app blueprint, without a router: a desktop app has one window with panes, not
  routes.
- Rust: the toolchain is pinned in `rust-toolchain.toml`, `Cargo.lock` is committed.
- Logic that does not need a window lives in a Rust crate of its own, usable from a command line and from tests.

## Structure

```
crates/<app>-core/   the product's logic, no Tauri
apps/desktop/src-tauri/   the Tauri shell: windows, commands, settings file
apps/desktop/ui/     the React UI (web app blueprint)
i18n/                one file per language, shared by UI and shell
```

The UI calls Rust only through typed bindings generated from the commands. An error from Rust carries a code; the
UI maps the code to a sentence from the string table.

## Window and system

- The main window is created in Rust, not in `tauri.conf.json`, so its ground before the first paint is the product
  colour of the start: the tile colour of the product's group, read from the files of the copy's kit at build time.
  The stored light or dark ground follows with the app; its colour is read from the copy's tokens at build time.
- Theme and tone are stored by the Rust side in the app's settings file.
- Capabilities: `core:default` plus the window permissions the app uses. Nothing else without a reason.
- Content-Security-Policy in `tauri.conf.json`: `default-src 'none'` or `'self'`, `script-src 'self'`,
  `font-src 'self'`, `object-src 'none'`, `connect-src` only the IPC addresses.
- No outbound connection unless the product is about one. No update check that phones home; a new version is
  announced where the person got the app.
- Use the copy made for desktop (profile `desktop`): it carries the window parts and `tokens.json`.

## Tests

- UI: as in the web app blueprint. Component tests run in jsdom and cannot see CSS, hover or drag; the views are
  checked with Playwright against the served UI.
- Rust: `cargo test` for the core crate; a command-line tool gets golden files.
- Neither runs in a real Tauri webview. Before a release, start the built app and walk the main flows by hand.

## Quality

The web app's checks, plus `cargo fmt --check`, `cargo clippy` without warnings, `cargo audit` and `cargo deny`.

## Size and speed

The web app's budgets for CSS and JavaScript, and for the shipped app: fonts 250 KB, installer 12 MB. Panes that
are not needed at start are loaded with `lazy()`.

## Build, release, updates

| Workflow | When | What |
|---|---|---|
| `ci` | every push and pull request, and once a week | UI checks and tests, Rust checks and tests, audits; on macOS and Linux |
| `release` | a version tag | runs `ci`, builds the installer into a draft release with checksums |

- The installer is unsigned until the product has a signing certificate; the release notes say so.
- Dependabot once a week for `npm`, `cargo` and `github-actions`, minor and patch grouped. Actions are pinned by
  commit.
- The sebaro copy is updated with its `checks/update-copy.mjs`, as one commit of its own. The app icon comes
  from the kit in the copy (`product/`), from `sebaro.product.json`.

## Before you say done

The web app's commands for the UI, then:

```sh
cargo fmt --check && cargo clippy --all-targets -- -D warnings
cargo test
```

Start the app once and look at the changed views in light and dark. Say what you could not check.

## Where this starter still differs

Do not copy these parts of it:

- The notes are sample data and their rules live in the UI (`apps/desktop/ui/src/lib/notes.ts`). The core crate
  holds the settings alone; a product puts its documents and their rules there.
- It offers no choice of language: the UI follows the language of the system and stores none under `sb-lang`.
- As in the web app starter, only one of the large-text forms of the copy's `sb-fit.js` is written in React (its
  README lists the others), and the signs of the keys (⌘, ⇧, ↑) stand in `src/lib/keys.ts`, not in the string
  tables.
- It was built but never started in a Tauri webview, and its `ci` and `release` have never run. Its README says
  under „Nicht geprüft“ what that leaves open.
