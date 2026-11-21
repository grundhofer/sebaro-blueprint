# Product area

`sb-product-area` · `SbProductArea`

The one area of a view that carries the product colour: a ground in the tile colour of the product's group with
large text on it. It holds the one figure or the one message of the view.

## States

- Value: the one large figure, a line under it and optionally a detail („60 %“, „3 von 5 erledigt“,
  „Noch 2 offen.“).
- Result: a figure and a line („5“, „Ideen gesammelt“).
- Empty: the product's symbol and a heading („Noch keine Statistik“).
- Picture (websites only): one image or live specimen on its own neutral ground; no words on the product ground.

## Behaviour

- The area has no interaction and no slot for an action.
- All text wraps, and the area grows at large text. The figure never breaks inside itself: it gets smaller until
  it fits its line. The heading of the empty form gets smaller only until its longest word fits, and wraps at
  spaces.
- Directly in a view the area keeps the page gutter on both sides; it never runs to the screen's edge.
- The colours come from the product's kit through the product's id, for light, dark and both tones.

## Rules

- At most one product area per view, and only on entry, overview (one value), detail with one value, result and
  the empty state. [K5]
- No control, primary action or link on or inside it. A value tile with its controls never stands inside. [K5]
- Never set its colours by hand.
- A view never says the same thing twice: where the area carries the day's figure, leave out the summary sentence
  and its bar.
- A group whose colour pair carries only large text gets no detail line.
