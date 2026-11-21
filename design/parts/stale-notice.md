# Stale notice

`sb-stale-notice` · `SbStaleNotice`

Says that the facts were not checked for the version that runs, or that the check is too old. It stands in place
of every claim. Shared rules: Evidence.

## Behaviour

- The warning glyph in `warning`, then the words in `text`: „Nicht für diese Version geprüft (geprüft für 1.4.0 am
  10.10.2026)“.
- In the full form it replaces all claim rows; the check summary and the check list stay.
- In the facts line it follows the product's name and replaces all cells.
- On a website the note digits and their sentences are not written at all, so the page states nothing it cannot
  back.
- Too old applies only to a product with a live path to a remote place: the facts are stale once the day of the
  next check has passed.

## Rules

- When the facts are stale, no claim shows beside the notice. [K27]
- The words come from the generated notes, never typed. [BEL-06]
