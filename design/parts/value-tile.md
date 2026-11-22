# Value tile

Android only · `SbValueTile`

A value that is content and can be held or struck: a die after a roll, the value of a card. For the one large
figure of a view take the product area instead.

## States

- Plain: the number large in a frame without fill; the line for the state is empty.
- Held: „behalten“ with the check glyph under the number.
- Struck: „gestrichen“ with the cross glyph under the number.
- Both words stand in `text`, without colour. For a screen reader a tile that can be held is a check box:
  „Würfel 3: 5, behalten, angekreuzt“.

## Behaviour

- A press holds the value, a second press lets it go. The tile keeps its size and place in every state.
- The tile grows with the text. A long word as value wraps and the tile grows downwards. At large text the tiles
  wrap onto further lines; three one-digit tiles fit side by side on a small phone.
- A dice tile may roll: for about a third of a second the digit shows three interim values, slowing down. Only
  the digit fades; nothing turns. Held dice stay still. The sum shows once all tiles have stopped, and another
  press settles the result at once. The screen reader hears the end value only; one short haptic marks the end.
  Under reduced motion there is only a short fade.

## Rules

- Never cobalt (it is not the current place), never lime, never a filled ground. [DAT-03]
- Never inside a product area; controls to keep or discard stay outside it. [K5]
- Only a dice tile may roll. No other motion may cite this exception.
- In a list (a history) a struck value shows the same word in `text` beside the struck title.
