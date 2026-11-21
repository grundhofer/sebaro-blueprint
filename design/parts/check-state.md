# Check state

`sb-check-state`, `sb-check-glyph` · `SbCheckStateGlyph`

The state of one check as glyph and word. It stands in result lines, in the check summary and in the check list.
Shared rules: Evidence.

## States

- „bestanden“: its glyph in `success`.
- „offen“: its glyph in `warning`.
- „übersprungen“: its glyph in `info`.
- „nicht bestanden“: its glyph in `danger`.
- Each state has a glyph of its own shape, so the four are told apart without colour. The word stands in `text`.
- A fact that is not shown puts „nicht belegt · “ before the state, with the glyph of its check: a hidden fact
  with a failed check shows the error glyph before „nicht belegt · nicht bestanden · …“.

## Rules

- The glyph never stands without its word, and the word is never coloured. [K20]
- Only these four words, the same in every product; in English „passed“, „open“, „skipped“, „failed“. [K20]
- A failed, open or skipped check is said, never dropped or smoothed. [K27]
