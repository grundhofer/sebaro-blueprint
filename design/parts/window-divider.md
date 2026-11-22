# Window divider

`sb-window__divider` · web and desktop

The line between a pane and the content of a window. Dragging it changes the pane's width.

## States

- Docked pane: the divider is the 2 px ink line. The line stays ink; only the pointer changes, and keyboard focus
  shows the ring.
- Collapsed pane: a hairline at the window's edge where the pane was; its target stays.
- Pane as an overlay (narrow window): no divider.

## Behaviour

- Limits: the sidebar 200 to 360 px (start 240), the inspector 240 to 400 px (start 280). The content never gets
  under 480 px.
- Pointer: drag. Dragged well under the smallest width, the pane collapses; dragged out again, it opens. A double
  click gives back the start width.
- Keyboard: ← → move the line in small steps, with Shift in larger ones; Home and End set the smallest and the
  largest width that fits; Enter collapses and restores.
- Without dragging: the menu „Darstellung“ has „Breite der Seitenleiste“ and „Breite des Inspektors“, each with
  „Schmal · Normal · Breit“. In a window too narrow for the pane the choice only stores the width.
- Widths are stored per window and pane and come back at the next start. When the window narrows, the inspector
  gives way first, then the sidebar, each down to its smallest width; giving way never overwrites the stored width.
- A screen reader hears the width in pixels („264 Pixel“) and „zugeklappt“ while the pane is hidden.

## Rules

- The pointer target is wider than the line, and 48 under touch. [K30]
- Every width step is reachable without a drag. [DSK-07]
- The divider never takes a colour on hover.
