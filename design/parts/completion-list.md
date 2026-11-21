# Completion list

`sb-completion` · web and desktop

The list an editor opens at its caret while one types a link or a tag, and the list under a field that suggests
values. It is made of window rows on the surface of a menu.

## States

- Active option: the place line and `link` colour, no fill and no change of weight. The row under the pointer shows
  the hover fill.
- The letters typed so far stand in a stronger weight, without a fill.
- No hit: a grey sentence („Keine Notiz „Gartn“.“), or the last option „„Gartn“ anlegen“ when the editor can create
  it.

## Behaviour

- The editor or field keeps focus; the list never takes it. ↓ ↑ move the active option, Enter or Tab takes it,
  Escape closes the list and keeps the text, typing filters, a press on an option takes it.
- At a field, Escape closes the list first; a second Escape belongs to the field or its dialog.
- The list stands under the caret or the field, above it without room below, and closes when the caret leaves the
  word.
- The active option always stays in view. A long name wraps; a list taller than its limit scrolls.
- Inside the palette's frame or a dialog the list stands in the flow under its field, without a surface of its own,
  so the frame grows with it.

## Rules

- Each option shows its name and, at the end, its place or kind.
- Never the browser's own suggestion list: it looks different in every browser and marks no letters.
- The copy brings no script for this list. The editor or the app writes the keys above.
