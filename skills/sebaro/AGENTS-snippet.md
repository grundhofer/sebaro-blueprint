<!-- Paste this section into the product repository's AGENTS.md (Codex) and keep CLAUDE.md as "@AGENTS.md".
     Fill in the places in angle brackets. Keep it this short: the rules live in the kit, not here. -->

## Design and technology: sebaro

This product follows sebaro. The kit is `https://github.com/grundhofer/sebaro-blueprint`; use a local checkout where
there is one.

- **Kind:** <phone app | website | web app | desktop app | browser extension>. Its rules beyond the core:
  `<kit>/design/platforms/<mobile | website | webapp | desktop | extension>.md`. Its technology plan: `templates/<kind>/BLUEPRINT.md` in
  the private `grundhofer/sebaro-foundry` (read with `gh`).
- **Before any UI work** read `<kit>/design/KERN.md` (31 core rules) and pick the view type of the screen in
  `<kit>/design/views.md`.
- **The sebaro copy** is `<path of the folder with sebaro-export.json>`. Never edit it. Parts and tokens come from
  there; what is missing is built beside it.
- **Gaps and decided deviations** of this product: `docs/sebaro-luecken.md`.
