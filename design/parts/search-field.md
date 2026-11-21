# Search field

`sb-search` · `SbSearchField`

A text field for finding or filtering, with the search icon at its start.

## States

- Empty: the search icon and the placeholder.
- Filled: the icon button „Suche leeren“ stands at the end. It is hidden while the field is empty.
- Focus, error and disabled as the text field.

## Behaviour

- „Suche leeren“, or Escape in a filled field, empties the field, updates the results and keeps the focus in the
  field.
- Escape in a filled field does not close the dialog or sheet around it.
- The button appears and disappears in place, without motion. The browser's own clear button is hidden.

## Rules

- The label may be visually hidden when the placeholder names the task („Gewohnheit suchen …“). The label still
  names the task in full, because the placeholder may end in „…“ at large text. [EIN-05]
