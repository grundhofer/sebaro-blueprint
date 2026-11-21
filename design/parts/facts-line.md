# Facts line

`sb-facts-line` · `SbFactsLine`

The compact form of a product's facts: one grey line. It stands on an app's card on a website, in the footer of
a product page and under the about head. Shared rules: Evidence.

## States

- With hidden values: one cell „n nicht belegt“, which is a link to the full form.
- Stale: only the name and the stale notice.
- Sample data: the marker „Beispieldaten“ at the end.
- As a list: when one cell no longer fits on one line (large text, a narrow place), the name stands on its own
  line and each cell on its own line below, without „·“, in the same type and colours.

## Behaviour

- Caption in `text-muted`. The cells are divided by „ · “, which screen readers skip. The line wraps between
  cells, never inside one.
- Order: the product's name; each shown tracking claim („Keine Tracker“, „Keine Werbe-ID“); the account („Kein
  Konto“); the network level; every verified remote place as „<Stadt> (<Land>)“ after the pin icon; „n nicht
  belegt“; the marker.
- The network level is one of „verbindet sich mit keinem Server“, „verbindet sich nur auf deinen Befehl“,
  „verbindet sich selbst“.
- A stale notice counts as a cell, so a stale line is a list on a phone.

## Rules

- No colour except the link.
- „verbindet sich mit keinem Server“ stands only when every path that is said never to reach a remote place has
  a passed, current check.
- A reassuring cell shows only with a passed, current check; hidden values are counted, not dropped. [K27]
