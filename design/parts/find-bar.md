# Find bar

`sb-find-bar`, `sb-doc-bar` · web and desktop

The search inside the open document: a row of its own under the document tabs and over the text. Searching all
documents is the full-text search.

## States

- Count beside the field: „Treffer 2 von 5“; „5 Treffer“ when hits exist but none is current; „Kein Treffer“; empty
  while the field is empty.
- Replace: a second row, hidden until „Ersetzen“ is chosen, with the field „Ersetzen durch“ and the text actions
  „Ersetzen“ and „Alle ersetzen“.
- „Gehe zu Zeile“: in place of the two rows, the field „Zeile“ with the suffix „von 214“, then „Gehen“ and
  „Schließen“. A wrong entry answers under the field: „Gib eine Zeile von 1 bis 214 ein.“

## Behaviour

- ⌘F opens it with focus in the field and its text selected; pressed again, it selects the text again.
- Tools: „Voriger Treffer“ (Shift+Enter), „Nächster Treffer“ (Enter), „Mehr“ with „Ersetzen“ and „Gehe zu Zeile“,
  and „Suche schließen“ (Escape). Moving through the hits wraps.
- In rendered text every hit is marked and the current one is brought into view. Escape takes the marks away, hides
  the bar and gives focus back.
- The bar pushes the text down and covers nothing. Typing never changes its height; at large text it wraps into a
  second line.
- A code editor draws its own hits, as a frame without fill, and uses only the bar.

## Rules

- Never a floating box over the text.
- The same bar in editor and preview.
- A search says its place in words („Treffer 1 von 2“), never by the mark alone. [FAR-12]
- A tool names its target: „Voriger Treffer“, not „Zurück“ alone.
