# Window row

`sb-row` · web and desktop

The one row of trees, window lists, the command palette and completion lists. It always has window density.

## States

- Hover fill and pressed fill; the focus ring stands inside the row.
- Current place: 3 px `accent` start edge, `link` colour, title weight and the icon in `link`.
- Checked: a check in the slot at the start (a setting in the palette, a chosen row of a list).

## Behaviour

- One line holds an icon or the check slot, the name and, at the end, a status, a date, a number or a shortcut. Two
  lines add a grey sub line, three lines a line of text.
- A long name wraps. Once the name would get too little room, the end part goes onto its own line under the name and
  starts where the name starts. The sidebar never scrolls sideways.
- Only a list that renders just the rows in view, at a fixed row height, cuts the name at the end with an ellipsis.
  Even there a status that does not fit goes under the name, and only that row grows.
- A row shows one thing at its end: a status replaces the date, which moves to the row's `title` and the inspector.

## Rules

- A status in a row is the sign plus at most two words, never abbreviated. Grey informs, the warning colour asks for
  an act. [STA-08]
- Long names wrap. Cut them only on virtualised lists (`data-sb-truncate`), and then the full name stands in the
  row's `title`. [TXT-09]
- Status, numbers and shortcuts are never cut. [TXT-09]
- A row never shows a total; the total stands once in the action zone. [STA-07]
- Write no padding rule of your own for a row.
