# Meta list

`sb-meta-list`, `sb-meta-list--labels` · `SbMetaList`

The properties of one thing as pairs of label and value: „Erinnerung · alle 2 Stunden“.

## Behaviour

- One row per pair with a hairline between rows. The label is small and `text-muted`, the value in body size with
  tabular figures.
- The labels form has a fixed label column and gives the rest to the value. Use it for long values: a place, a
  path, a version line.
- At large text or in a narrow place the label stands above the value once either no longer fits its share.
- A file name in a value is marked as one. It breaks only after - . _ / and without a hyphen. An identifier such as
  „1.4.0“ never breaks.

## Rules

- Properties stay flat: pairs in rows, no fill and no frame. [DAT-03]
