# Inspector field

`sb-field--compact`, `sb-field--number` · web and desktop

The compact field of a window's inspector, find bar and reader tools. Everywhere else a field keeps its label above
and its full height.

## Behaviour

- The label stands at the start in `text-muted`, the field beside it at 32 high. Help and error stand under the
  field, in the field's column.
- Under touch the field is 48 high again.
- The number form holds a short number: label, the number, a grey suffix („von 214“). It is as wide as its content,
  and the label goes above the number where the row is too narrow.
- A label may be for screen readers only where the row already names the task, as in the find bar.

## Rules

- Changes in the inspector apply at once, so the inspector has no primary action. [DSK-15]
- Use it only in windows; a form on a page or a phone keeps the label above the field. [K21, DSK-15]
- An error is still a sentence under the field. [K21]
