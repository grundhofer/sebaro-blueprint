# Toast

`sb-toast`, `sb-toast__action` · `SbToast`, `SbToastHost`

One short sentence that confirms a result which can be taken back, with the action „Rückgängig“. An error stays next
to what failed; a deletion asks in a dialog.

## Behaviour

- Every toast lives 6 s; there is no duration per toast. The time stops while the pointer is over it and, for a
  toast with an action, while focus is inside. On Android it lasts longer when the system asks for more time.
- Escape closes it from anywhere on the page and still reaches the field or editor that has focus. One Escape closes
  one layer, the topmost first.
- Pressing the action closes the toast. Focus returns to where it came from; when that element is gone, to the main
  content of the area.
- Large text: the sentence wraps, and the action goes under it at the end once it no longer fits beside it. A long
  file name breaks inside the toast.
- In a window the toast stands at the top of the action zone, never over the text.
- It enters from below and is announced politely.

## Rules

- Only for the reversible result of an action outside the primary action, with „Rückgängig“. The one toast without
  it says „In die Zwischenablage kopiert“ after a copy from the palette or a menu, where no copy key stays visible.
  A copy key shows „Kopiert“ in itself and gets no toast. On Android 13 and later the system confirms a copy
  itself: no toast there. [K14]
- Never for an error, for the result or progress of the primary action, instead of the delete dialog, or for what
  the screen already shows. [K14]
- Never more than one action, and never as a notification for something the person did not do. [K14]
