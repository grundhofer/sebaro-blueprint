# Check summary

`sb-check-summary` · part of `SbClaimRows`

The counts of the checks per state, under the claim rows. It leads to the check list. Shared rules: Evidence.

## Behaviour

- One line per state with its glyph: „4 bestanden“, „1 offen“, „1 übersprungen“.
- Only states with at least one check show, in the fixed order „bestanden“, „offen“, „übersprungen“, „nicht
  bestanden“.
- Under the counts stands the link „Wie geprüft?“, a 48 target.

## Rules

- Every state that occurs is counted, not only the passed checks. [K27]
