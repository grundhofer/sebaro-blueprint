# Chart

`sb-chart`, `sb-sparkline`, `sb-goal-ring` · `SbBarChart`, `SbLineChart`, `SbSeriesChart`, `SbShareRows`,
`SbHistogram`, `SbDeviationChart`, `SbSparkline`, `SbGoalRing`

Figures over time or across parts. Pick the form by the question. A colour scale is a heatmap.

## Behaviour

- Every chart has a caption (what, unit, period; „(Beispieldaten)“ on sample data) and its values as text: labels
  at the shapes or the table „Werte als Tabelle“.
- Words and numbers are real text in the caption size at every width. Only shapes are drawn.
- A target is a dashed line with its word („Ziel 8“).
- Line: the latest point is marked, its value at the line's end. A missing value leaves a gap, never bridged.
- Labels never overlap. Labels under the plot that would collide are dropped from the front, so the latest stay.
- When series names no longer fit at their line ends, the legend names them, also for two series, and each end
  keeps only its value.

## Rules

- Charts are grey. `accent` marks only the current period or the latest point. Never lime, status or product
  colours, gradients, area fills, 3-D or a number on a coloured fill. [K24]
- Several series: name each at the end of its line. From three series add the legend above, with line styles, never
  colour alone. [DAT-10]
- Shares of a whole: labelled rows on a grey track, in a fixed order. A distribution: a dense histogram. Deviation
  from a middle: diverging bars with arrow, sign and value as text; their tones never mean good or bad. A goal of
  up to 12 units: the ring with „5 von 8“ in its middle. Never a pie. [DAT-12]
- Counts against an expected value: share rows with a line across each bar and „erwartet“ once in a legend.
  [DAT-12]
- A sparkline never stands without its number. The goal ring is not a button and not the loading ring.
