# Empty state

`sb-empty`, `sb-empty--section` · `SbEmptyState`

A whole view or area that has nothing to show yet. An empty list under its header uses the list's end sentence
instead.

## Behaviour

- Start-aligned: an optional spot illustration, the title „Noch keine <Ding>“ and one `text-muted` sentence on how
  it fills.
- A lone empty state stands in the middle of its area's height. When large text makes it taller than the area, its
  start stays in view and the area scrolls; the sentence is never cut.
- In a window's pane, or under a heading in an area with its own padding, it takes the small form: title and text
  one size down, so it is never larger than the heading over it.
- Its head may be a product area with the bare product symbol and the headline only. The explanation, links and the
  action stay outside the coloured head.
- A long word at large text shrinks the headline instead of widening the column.

## Rules

- A title and one sentence. The action stays at the bottom, never inside the empty area. [K22]
- Only the four spots of the set; a product draws none of its own. No mascots, no jokes. [ICO-07]
- At most one product area per view. [K5]
