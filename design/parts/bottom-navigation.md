# Bottom navigation

`sb-bottom-block`, `sb-bottom-nav` · `SbScreen`, `SbNavigationBar`

The main navigation of a phone app: three to five top-level places at the bottom edge. It stands in the bottom
block, the sticky foot of a view, under the primary action bar.

## States

- Current place: 3 px `accent` edge on top, filled icon, `link` colour and title weight.
- Other places: outline icon and word in `text-muted`; hover turns them to `text`.

## Behaviour

- The items are equally wide, each with its icon above its word. The word is always visible.
- Large text: a word that does not fit its item wraps, a word too long for the item is hyphenated
  („Einstel-lungen“), and the bar grows. Five items keep this form.
- From 840 dp of width the same navigation becomes a rail at the start edge (see the app frame).

## Rules

- Three to five places, top level only. A sub-screen gets „back“ and shows no bottom navigation. [K18]
- Every place shows icon and word. [K17]
- The current place is the line plus a second cue, never a fill, a pill or a tint. [K17]
- No hamburger menu on phones. [K18]
- No count badges and no red dots on an item. [K23]
