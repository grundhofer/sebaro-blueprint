# Card

`sb-card`, `sb-card--item` · `SbCard`, `SbItemCard`

A framed group of settings or figures. Things of one kind in a list are rows, not cards.

## States

- Grouping card: `bg` with the ink line around it, a title, text and actions.
- A card that is one link: the link sits in the title and covers the card; hover is `hover-fill`, the focus ring
  stands on the card.
- Item card, for many alike cards in a board or a collection: a thin `border-strong` edge instead of the ink line.
  The current card carries the `accent` place line at its start; no other card does.

## Rules

- Cards only group settings or figures. Never for list items, never tinted, never with a shadow. [K10]
- Item cards only for a board or a collection. Mark the current card as current. Only the grey „Mehr“ button shows
  all the time. [FOR-05]
- A card is an area of its own: at most one outlined action inside. [K13]
