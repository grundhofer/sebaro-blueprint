# Drag and drop

`data-sb-drag`, `data-sb-drop` · web and desktop

Moving a row of a tree or a window list with the pointer. It shows what is dragged, where it lands and whether it
may land there.

## States

- Dragged row: a 2 px ink frame.
- Folder that takes it: a 3 px `accent` frame. Place between two rows: a 3 px `accent` line.
- Target that takes nothing (the trash): no mark, the pointer shows „not allowed“, and the row's `title` says why.
- Free space under the rows: the whole tree gets the frame; the row goes to the top level.

## Behaviour

- A drag starts after a few pixels of movement. A folder takes the row in its middle half; its outer quarters put
  the row before or after it. A row never goes into itself. Escape cancels.
- When the row is no longer visible afterwards (it went into a closed folder), the folder takes focus and a toast
  says „Nach „Ideen“ verschoben.“ with „Rückgängig“. A move that stays visible gets no toast.
- Without the pointer: „Verschieben nach …“ in the row's „Mehr“ menu and in the menu „Bearbeiten“ opens a dialog
  with the folders as radio rows and „Abbrechen“ · „Verschieben“. For a tree with many folders it opens a folder
  picker in the palette („Zielordner wählen“); afterwards the target folder opens and shows the row.
- Files dropped from outside the app: the whole content gets the frame, and one sentence says where they go.

## Rules

- No dashed lines, no shadow, no half opacity, no ghost image. [DSK-11]
- Every drag has a way without the pointer. [DSK-11]
- The trash takes no drop: deleting goes through the dialog. [K15]
- The mark of a target is a border, never a background. [K6]
