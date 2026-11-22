# Window

`sb-window`, `sb-window--fill` · web and desktop

The frame of a desktop app and of a web app with a window: title bar, sidebar, content, inspector and the action
zone across the whole width. A simple app without panes uses a wide view instead.

## Behaviour

- Each part is a layer, set off by the 2 px ink line. Hairlines stand only inside a part.
- The window adapts to its own width, not to the screen. The content keeps at least 480 px: as the window narrows,
  first the inspector, then the sidebar leaves the row and becomes a closed overlay at its edge. The smallest window
  is 480 × 400. [DSK-04, DSK-07]
- Every part that can hide has a tool in the title bar and an item in the menu „Darstellung“. A part that hides
  while it holds focus gives focus to its tool.
- An overlay pane opened by its tool takes focus; Escape or a press outside closes it. When the window is wide
  enough again, the pane returns as it was left.
- Several windows: each is a full view with its own action zone, panes and stored widths. „In neuem Fenster öffnen“
  and ⇧⌘N open one, the menu „Fenster“ lists them. A window that is not in front lets only the current place of its
  path recede to `text-muted`.

## Rules

- No tinted grounds and no shadows between the parts. [K10, DSK-01]
- The product colour stands in the title bar's tile, never on title bar, sidebar or controls. [K5, DSK-01]
- Scroll bars are the system's; draw none of your own.
- Lists about the open document (backlinks, the outline) stand in the inspector; there is no bottom panel under the
  content.
- No cobalt frame marks the active window. Theme, tone and reduced motion apply to every window at once. [DSK-12]
