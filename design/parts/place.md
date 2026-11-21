# Place

`sb-place` · `SbPlace`

An address, with a small map under it where a picture helps.

## Behaviour

- The address stands first, as text after the pin icon in `text`.
- The external link „In Karten öffnen“ may follow, in the link style with the external-link icon. It hands the
  address to the map app or to the product's own map page.
- Under it the small map may stand, at most 360 wide, in a `border-strong` frame. It is a local image, or a sketch
  drawn from the greys of the tokens (ground, water, roads, a marker).
- The map is an image and has a description.
- The link's target is 48 high under touch and on narrow screens.

## Rules

- The address as text with the pin and „In Karten öffnen“ comes first. The map is a local image or a sketch,
  never a map service. [DAT-17]
- The pin is never `accent`: cobalt means the current place inside the app. [K4]
- No colour per kind of map.
