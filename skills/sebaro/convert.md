# Convert an existing project to sebaro

The project keeps what it does. Only its look, its structure where the blueprint asks for it, and its checks
change. One stage is one pull request; the app works after every stage.

## 1 Inventory (read only)

Write down, in the project (`docs/sebaro-umbau.md`):

- every screen or page, and for each its view type from `<kit>/design/views.md`, its primary action, and what does
  not fit the type;
- the one view that is the product's reason to exist (it may take its own form);
- what the project has today: theme and tokens, component library, fonts, icons, tests, CI, release, update bot;
- where it differs from the blueprint of its kind.

## 2 Plan and questions

Under the inventory: the stages below with what each one changes, and the questions for the owner (at most five).
Wait for the OK.

## 3 Stages

1. **Foundation.** Bring the sebaro copy into the project (`<kit>/AGENTS.md`, step 4) and wire fonts, tokens and
   the theme with light, dark and the two tones. Remove the old theme. Rename the project's own tokens to sebaro's
   names; do not keep an alias layer. The app may look half old after this stage.
2. **Frame.** Navigation, top bar, the action zone at the bottom, the start, the place of „Hell oder Dunkel“.
3. **Standard views**, the most used first, one type at a time: list, detail, form, the four states, settings,
   about. Start from the type's template and fill its slots.
4. **The core view.** Build it from sebaro's parts. Its form is decided with the owner, not derived from a type.
5. **Technology.** What the blueprint of the kind asks for and the project lacks: structure, tests, CI and
   release, the update bot. Nothing beyond that.

## 4 In every stage

- Do not change features or behaviour while converting. A bug you find gets its own note, not a silent fix.
- Where the copy has no part for something, build it beside the copy from tokens and existing parts and add one
  line to `docs/sebaro-luecken.md`: what was missing, where you built it.
- Where a core rule does not fit, do not work around it. Ask the owner; record the decision in the product.
- Before you say a stage is done: the project's checks are green, you looked at every changed view in light and
  dark, on the phone and wide, and you say what you could not check.
