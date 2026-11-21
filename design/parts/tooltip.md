# Tooltip

`sb-tooltip` · web only

A short description that appears at a control for pointer and keyboard. It never shows on touch, so it can only add
to what the control already says.

## Behaviour

- It shows 400 ms after the pointer rests on the trigger or keyboard focus reaches it: under the trigger, above it
  when there is no room below, always inside the window.
- It stays while the pointer moves onto it. It hides when the pointer leaves both, on blur, on a press of the
  trigger and on Escape. Escape hides only the tooltip; a dialog around it stays open.
- It appears without motion.
- A tool's tooltip reads „Name Kürzel“. A screen reader adds only the spoken shortcut to the tool's name
  („Widerrufen, Befehl Z“).

## Rules

- It only adds; it is never the one place of an information. The element needs `popover="manual"`. [EBE-06]
- The trigger keeps its own name. An icon button still needs its label; a trigger without a name shows no tooltip.
  [EBE-06]
- The line that says where data goes never stands in a tooltip. [BEL-10]
