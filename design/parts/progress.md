# Progress and loading

`sb-progress`, `sb-progress-ring`, `sb-loading`, `sb-skeleton` · `SbProgressBar`, `SbProgressRing`, `SbSkeleton`

Shows that remote work runs and, where known, how far it is. The steps of a flow are a part of their own.

## Behaviour

- Bar: ink on a `border` track, under a head that says what happens and the value („60 %“).
- Ring: the value stands as text in its middle. The ring grows with the text size and for a wide value, so the
  figures never touch it.
- Without a value: the turning loader icon and „Wird geladen …“. After 10 s a longer sentence that says what
  happens replaces the words in the same line.
- A lone loading line in an empty area stands where a lone empty state would: start-aligned, in the middle of the
  height.
- Skeleton: static grey bars, always together with „Wird geladen …“.
- Under reduced motion the loader icon stands still.

## Rules

- Only for remote work over 1 s. Local work shows nothing; when it takes longer than about 1 s, its sentence stands
  where the result will appear, without a spinner. [K22]
- The primary action shows its own progress. No spinner over the view. [K14]
- No shimmer on a skeleton. [K22]
- A countdown needs only its number and sentence („noch 61 Tage“): no ring and no bar for the time gone.
- The ring is for loading only; a goal uses the goal ring of the charts.
- Bar and ring have square ends. [FOR-06]
