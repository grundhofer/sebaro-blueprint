# Big number and stats

`sb-big-number`, `sb-stats`, `sb-stat` · `SbBigNumber`, `SbStats`

One figure that leads a view, or a few key figures side by side.

## Behaviour

- Big number: the value in the display role over its label in `text-muted`.
- Stats: flat columns, each with a small muted label and its value. A hairline stands between two stats of one row.
  The first stat of every row, also of a wrapped one, starts at the text edge without a line.
- A stat column has a least width and grows with the text. On a narrow phone or at large text fewer stats stand in
  a row; a value such as „31 Tage“ is never cut or broken.
- A sparkline may follow a stat's number. It never stands without the number.

## Rules

- Stats are flat: no fill, no frame and no radius around a stat. [DAT-03]
- Numbers use tabular figures of sebaro Sans, never mono. [K8]
- A no-break space stands between number and unit. [K26]
