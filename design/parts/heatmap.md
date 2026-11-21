# Heatmap

`sb-heatmap`, `sb-scale-cell`, `sb-scale-legend` · `SbHeatmap`

Values per day over several weeks, folded into a few steps of one colour scale.

## States

- A day with a value: a cell in the tone of its step.
- No data: an empty framed cell of its own, never the first step. Days still to come are empty.
- Today: an `accent` frame that is part of the cell, with a thin `bg` joint between frame and fill.
- Focus: the usual ring outside the cell, detached from it, so focus and today stay apart, also on the same day.

## Behaviour

- The legend above shows one swatch per step with its range, „keine Angabe“ and „Rahmen: heute“.
- Web keyboard: one tab stop, on today or else the last day with a value. Arrows move by day and by week, Home and
  End go to the ends of the week, with Ctrl to the first and last day. Days without a value are skipped. A line
  under the table repeats the focused or pointed day.
- Android: a tap shows the day's value; under the heatmap stands the hint „Tipp auf einen Tag, um seinen Wert zu
  sehen.“ [DAT-11]
- Narrow place or large text: weekday heads keep two letters and every second one leaves the view („Mo Mi Fr So“).
  Screen readers still hear all. [DAT-11]

## Rules

- Fold the values into four steps, five for a scale with a middle. Never a gradient. [DAT-11]
- Every cell carries its value as text („Mittwoch, 21.10., heute: 7 Gläser“, „Freitag, 09.10.: keine Angabe“), and
  every step says its range. [DAT-10, DAT-11]
- More is farther from the ground, in light and in dark. [DAT-10]
- Never a number on the coloured fill. [K6]
