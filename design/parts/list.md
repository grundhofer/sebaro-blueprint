# List

`sb-list`, `sb-list-row`, `sb-list-header`, `sb-list-end`, `sb-day-summary` · `SbListRow`, `SbListHeader`,
`SbListEnd`, `SbEndPartRow`

Flat rows with hairlines, for things of one kind.

## States

- A row that opens something: the whole row is the target, with `hover-fill`, the focus ring inside the row and a
  chevron at the end.
- Done row: lower, small and `text-muted`, the success glyph at the start, the time at the end, no hairline and no
  visible status word.

## Behaviour

- A row has an optional icon, a title with optional meta and text lines, and an end part (status, time, chevron).
- The header shows the group word and its count („Offen 2“). Where the count needs its noun, it is a short
  sentence: „2 Notizen · 1 Karte“.
- A list ends with a closing sentence or with nothing. An empty list under its header shows „Noch keine …“ as that
  sentence, not as an empty-state block.
- The day summary says the state in one strong sentence: „3 von 5 erledigt, 60 %. Noch 2 offen.“
- In a narrow column the end part moves under the text.

- On the phone a row's own menu is the ⋮ button at its end, named „Mehr zu <Zeile>“; the row then has no chevron.
- An entry of a list inside a form that is not saved yet is removed with a close icon button „<Eintrag> entfernen“,
  then the toast „„<Eintrag>“ entfernt“ with „Rückgängig“, without a dialog.

## Rules

- Lists are flat rows, never cards. No endless scrolling, no count badges. [K10]
- Say the state as one sentence above. „Erledigt“ stands once, in the group head; a done row carries the word only
  for screen readers. [DAT-02]
- Long names wrap. Only a virtualised list may cut a name, with the full name in the row's title. [TXT-09]
- Deleting something saved still asks in the dialog. [K15]
