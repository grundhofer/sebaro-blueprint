# Tree

`sb-tree`, `sb-sort-choice` · web and desktop

Folders and files in the sidebar of a window. A flat set of rows to select from is a window list.

## States

- Folder: closed or open, its chevron turned while open. A leaf keeps the empty slot, so icons align.
- Chosen row: one per tree; it is the current place.

## Behaviour

- Keys: ↓ ↑ move through the visible rows, Home and End jump, → opens a closed folder or goes to its first child, ←
  closes it or goes to the parent, Enter and Space choose, typed letters jump to the next name that starts with
  them.
- Pointer: a click chooses; a click on the chevron or a double click opens and closes.
- A folder without a view of its own opens and closes when it is chosen.
- A command from a menu, the palette or a shortcut acts on the focused row while the tree has the keyboard, else on
  the chosen row.
- A sort choice may stand under the sidebar's head: compact switches with their word („Name“, „Geändert“). The
  pressed one shows an arrow up or down and says the direction as a hidden word; pressing it again turns the
  direction.
- A tree with very many rows may render only the rows in view. Its own scroller then keeps at least four rows of
  height; below that the whole sidebar scrolls.

## Rules

- Selection never follows focus: the arrows only move, or a file tree would open every file on the way. [NAV-11]
- The whole tree is one Tab stop. [NAV-11]
- The pressed sort switch shows the edge, `link` colour and title weight, never a fill. [EIN-04]
