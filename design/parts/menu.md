# Menu

`sb-menu`, `sb-menu__item`, `sb-menu__sep`, `sb-menu__heading` · `SbMenu`, `SbOverflowMenu`

The rare actions of an area behind one button („Mehr“), and the choices of a window menu.

## States

- Item: hover fill, focus ring inside the row. Without a target it is disabled in `text-muted`.
- Delete item: danger word and icon, last after a hairline, without the 45° cut.
- Check item: a check slot at the start, the check in `accent` when chosen; the slot stays empty otherwise, so the
  words align.

## Behaviour

- It opens under its button, above it without room below, always inside the window.
- Opening focuses the first item. The arrow keys move and wrap, Home and End jump, typed letters jump to the next
  item that starts with them. Escape closes and returns focus to the button, Tab closes and moves on, a press
  outside closes. A chosen item closes the menu first, then acts.
- A submenu opens on a press, → or Enter, never on hover; ← and Escape close it. It stands beside its parent; where
  no side has room it takes the parent's place with a back row „‹ <name>“ first.
- A change of the window's width or a scroll of the page closes every level.
- A shortcut stands at the end of its row and goes under the words at large text.

## Rules

- A „Mehr“ menu needs several rare actions. Deleting alone is no menu: a detail view shows the danger action at the
  end of its content. [AKT-10]
- Name every menu and submenu. [EBE-07]
- A delete row ends in „…“, opens the confirm dialog and never deletes directly. [EBE-07, AKT-10]
- An item without a target is disabled, never hidden. [AKT-10]
- Group headings only for two or more groups that a separator alone does not explain. A heading is text, never an
  item.
- On macOS a desktop app uses the native context menu: order, hairline and „…“ hold, danger colour and icon do not.
  [AKT-10]
