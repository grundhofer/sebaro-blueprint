# Window list

`sb-listbox` · web and desktop

A list in a window whose rows are selected, one or several at a time. Folders that open and close are a tree.

## States

- One row chosen: it is the current place, with the place line, `link` colour and title weight.
- Several rows chosen: every chosen row keeps the place line and shows a check in place of its icon. The current one
  also keeps the title weight.

## Behaviour

- ↑ ↓ Home and End move and choose: here the selection follows the arrows, as on a desktop.
- Shift with an arrow or a click extends the selection. ⌘ with a click (Strg off macOS) adds or removes one row.
  Space toggles the focused row, ⌘A or Strg+A chooses all, Escape keeps only the current row.
- With two or more rows chosen, the state sentence of the action zone says „3 ausgewählt“. With one row it returns
  to its own sentence.
- The list is one Tab stop.

## Rules

- A chosen row never gets a fill: the place line and the check carry the selection. [DAT-08]
- The check takes the icon's place and is as wide, so the names stay aligned. [DAT-08]
