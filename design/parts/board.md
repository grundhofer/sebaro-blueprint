# Board

`sb-board` · `SbBoard`

Columns of cards that people sort by hand, such as the steps of a workflow. Use it when cards move between
columns; things that only stand under a group head are a list.

## States

- Every column head shows its name and the count of its cards. An empty column says „Noch keine Karte.“
- The current card carries the place line. A card someone else is writing shows the pending glyph and
  „<Name> schreibt …“, no content.
- Dragging: an ink frame on the card and an `accent` line where it would land. No ghost, shadow or half opacity.

## Behaviour

- Hairlines divide the columns; a column has no frame and no ground. The cards are the only boxes.
- A card shows its title, optionally a description that wraps in full, and a grey meta line. „Mehr“ ends its
  first line.
- Wide: the columns share the width and never get narrower than the column token. If they do not fit, the board
  scrolls inside itself.
- Narrow (below 640 of its own width, or at large text): one column at a time is swiped and the start of the next
  stays in view. A bar says „Spalte 2 von 3: <Name>“ between „Vorige Spalte“ and „Nächste Spalte“, so no column
  needs a swipe. The page never scrolls sideways.
- Every column head has „Mehr“, so Tab also reaches an empty column.

## Rules

- Name the column in „Neue Karte in „<Spalte>““ while the board swipes. In a wide board the new card lands in the
  column of the current card, else in the first. [DAT-13]
- Always offer moving a card without dragging: „Mehr“ › „Verschieben nach …“. [DAT-13]
- An app whose primary action is fixed to something else keeps it; each column then ends with the secondary
  action „Neue Karte in „<Spalte>““. [DAT-13]
- Set the column token wider if needed, never narrower. [DAT-13]
