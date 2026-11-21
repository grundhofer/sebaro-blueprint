# Rating

`sb-rating` · `SbRating`

An average rating together with the number of ratings behind it.

## Behaviour

- One filled star icon in the colour of the text, then the value with its reference in strong weight
  („4,2 von 5“), then the count in `text-muted` („· 38 Bewertungen“).
- The star is decoration; a screen reader hears „Bewertung: “ and the text.
- A distribution is a list of labelled rows with grey bars: „5 von 5: 20“ down to „1 von 5: 1“.

## Rules

- One star icon, then „4,2 von 5 · 38 Bewertungen“ as text. Never five stars as the value, half stars, a yellow
  star or a star without its number. [DAT-09]
