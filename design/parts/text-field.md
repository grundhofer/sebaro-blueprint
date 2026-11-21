# Text field

`sb-field` · `SbTextField`

Typed text, on one line or several, with a visible label above.

## States

- Empty (the placeholder in `text-muted`) and filled.
- Focus: the focus ring around the whole control.
- Error: a `danger` baseline, the error glyph and a sentence in `text` under the field. [K21]
- Disabled: value and label `text-muted`, baseline `border`.

## Behaviour

- Under the field stands a help sentence, with an optional counter at the end, or the error. A unit may stand as a
  suffix inside the field.
- Two fields in one row: when the wide one gets too narrow, the short one moves under it.
- A value too long for a one-line field runs on sideways inside it; no field, row or form grows for it. A read-only
  value that must be read whole is a sentence, not a field.
- A placeholder that does not fit at large text may end in „…“.
- The error leaves with the field's first change. The submit keeps its verb.
- A live preview of what the fields make stands under them, before the actions, as a quiet card or a plain row,
  never a control. Without a valid value it says so in one `text-muted` sentence.

## Rules

- Always a visible label above. The placeholder is a hint, never the field's only name. [K21]
- The error says what is wrong and what to do. No red text, no red fill. [K21]
- Required is the norm and carries no mark. A field that may stay empty ends its label in „(optional)“. A field
  that always has a value carries neither.
- The field never stands on a sunken ground.
- On Android use the wrapper, not Material's text field with its floating label.
