# Side navigation

`sb-side-nav`, `sb-side-nav__item`, `sb-side-nav__head`, `sb-side-nav__foot` · web only; a Compose app gets its rail
from `SbAppFrame`

The list of places at the start edge of a wide layout, above all the sidebar of a desktop window. Inside an app
frame the bottom navigation becomes the rail, so no second side navigation stands there.

## States

- Current place: 3 px `accent` start edge, filled icon, `link` colour and title weight.
- Other places: icon and word in `text-muted`; hover shows the hover fill.

## Behaviour

- Rows are 48 high. In a window they are 32 with a smaller icon, and 48 again under touch.
- A group head labels a group of rows („Ordner“). It may carry compact tools at its end that act on that group only
  („Neuer Ordner“); the name wraps, the tools stay at the end.
- „Einstellungen“ stands in a foot that never scrolls. Places, group heads, the sort choice and the tree scroll
  together above it, set off by a hairline.
- With no folder or collection open, the sidebar keeps only its foot, at the same width and without a sentence. The
  content's empty state says what to do.

## Rules

- Use it from 840 dp on tablets and from 1024 px in windows. [K18]
- Every place shows icon and word. [K17]
- One place line per place: a place that only opens a document carries no mark while the tree shows that document's
  row.
- The foot holds only „Einstellungen“, never a total of states. [K18, STA-07]
- A tool that does not act on the group stays the primary action of the action zone and is not repeated in a group
  head. [K18]
