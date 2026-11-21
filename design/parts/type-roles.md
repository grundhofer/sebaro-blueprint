# Type roles and headings

`h1`–`h3`, `sb-type-display`, `sb-type-headline`, `sb-type-title`, `sb-type-body-strong`, `sb-type-label` ·
`SbWrapText`

A heading looks like its role, not like its level. The role classes give that look to any element, for example to an
`h2` in a card that should read as a title.

## States

- Display: the page title. On a page narrower than 640 px it takes the smaller mobile size.
- Headline: page and section titles below the page title.
- Title: titles of cards, dialogs and groups.
- Body strong: the level below a title.
- Label: small group heads („Tagesziel“, „Belege“).

## Behaviour

- Headings wrap in balanced lines. They hyphenate only where a soft hyphen is set; only a single word that alone
  does not fit its line is hyphenated by itself.
- Code inside a heading breaks at the line end without a hyphen.
- In dark mode every role is a little heavier and wider, by itself.
- A role class sets no margin and no colour.

## Rules

- No ellipsis and no `maxLines` on a heading. Soft hyphens in long compounds and no-break spaces before units are
  yours to set. [SCH-06, TXT-15]
- One look per element: never combine a role class with a part's own title class. [SCH-07]
- Only the type roles of the tokens, in sebaro Sans. [K8]
