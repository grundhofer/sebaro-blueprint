# Checkbox

`sb-checkbox` · `SbCheckRow`, `SbChoiceGroup`

A yes or no that is sent with a form, or several picks under one question. A setting that applies at once is a
switch.

## States

- Unchecked: an empty box with a `border-strong` edge.
- Checked: box edge and check mark in `accent`, no fill, and the label in the strong weight.
- Indeterminate: an `accent` bar in the box.
- Focus ring on the box. Disabled: edge `border`, label `text-muted`.

## Behaviour

- The whole row toggles and is 48 high.
- Rows of one question form a group, which carries the question and the group's error.

## Rules

- The on-state is an `accent` mark, never lime and never a fill behind text. [K4]
