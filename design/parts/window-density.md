# Window density

`data-sb-density="window"` · web and desktop

The denser scale of a desktop window and of a web app with a window: rows of 32, 48 and 64 for one, two and three
lines, where a phone or a website uses 48 and more.

## Behaviour

- It holds for window rows, list rows, side-navigation items, menu items, rows of a meta list, chips, list headers
  and the actions of a dialog.
- An overlay that opens outside the window (a menu, the palette, a dialog) carries the scope itself.
- Under touch every row, chip, compact tool and compact action returns to a 48 target.
- Content text stays at the body size. Only rows and their labels get denser.
- A list that renders only the rows in view needs one fixed row height. That height grows with the text size; read
  it from a rendered row and never write it as a constant.

## Rules

- It is a scope for windows, not a setting: there is no density switch for the person. [K9, RAU-06]
- Compact rows only in desktop windows used with a pointer. [K30]
- The primary action keeps its full height in a window. [RAU-06]
