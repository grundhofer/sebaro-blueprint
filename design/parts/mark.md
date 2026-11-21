# Mark

`mark`, `sb-mark` · `SbMarkedText`

Highlighted words and search hits in rendered text: a page, a preview, a viewer.

## States

- Hit: the mark fill behind the words plus an edge at their foot. The edge carries the shape, so the hit does not
  rest on colour.
- Current hit: a thicker edge in `text` instead.

## Behaviour

- A mark never moves the line it stands in.
- In a code or Markdown editor a hit is a `border-strong` frame without fill; the current hit is the same frame on
  `selection`.

## Rules

- A search says „Treffer 1 von 2“ in words. [FAR-12]
- The mark is its own colour job: it is not the selection, not the current place and not a state. [FAR-12]
