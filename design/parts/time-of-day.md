# Time of day

`SbTimeRow`, `SbTimeSheet` · Android only

A time of day that the person picks from a list of fixed steps.

## Behaviour

- A row with the label, an optional calm sentence, and at the end the time („19:00“) in the strong weight with
  tabular figures and the clock icon.
- A press opens the bottom sheet „Uhrzeit wählen“ with one radio row per step. It opens at the chosen time, with
  two rows before it in view.
- A press on a row chooses and closes.
- The steps are fixed: half hours from 05:00 to 23:30 by default.

## Rules

- A time of day is a time row with its list. No dial, no field to type in, no free time between the steps. [EIN-06]
