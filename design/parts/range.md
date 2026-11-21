# Range

`sb-range` · Material `Slider`, `RangeSlider` with `SbControlColors.slider()`

A value, or a span between two values, on a continuous scale.

## States

- Rest: the rail in `border-strong`, the chosen part in `accent`, the thumb a ring in `accent`.
- Hover thickens the thumb's ring; the focus ring stands on the thumb.
- Disabled: rail, fill and thumb in `border`.

## Behaviour

- The label and the current value stand above the track as text, the value in tabular figures. Captions may name
  the two ends.
- A span has two thumbs, named „Beginn“ and „Ende“; each reads its value with the unit.
- The track is 48 high as a target.
- On Android the thumb is the platform's bar instead of a ring, in the same colours, and there are no tick marks.

## Rules

- The chosen part is the `accent` mark, never lime. [K4]
- The value always stands as text beside the control.
- The thumb is round; rail and fill have square ends. [FOR-06]
