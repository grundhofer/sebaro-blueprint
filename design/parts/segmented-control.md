# Segmented control

`sb-segmented` · `SbSegmented`

Two to four short options that switch a view or a value, side by side in one frame: „Woche · Monat · Jahr“.

## States

- Chosen: the `accent` bottom edge, a check icon, the title weight and the `link` colour. Never filled.
- Hover `hover-fill`; the focus ring stands inside the option.
- One option disabled: its word in `text-muted`; arrow keys skip it. A chosen option that is disabled keeps check,
  weight and edge, the edge in `border-strong`.
- The whole control disabled: frame, separators and legend in `border` and `text-muted`.

## Behaviour

- It is one named group with a legend. Arrow keys move the choice; on Android ← → choose and ↑ ↓ leave the row.
  [EIN-04]
- At large text the words wrap between each other and the options grow. A single word wider than its column is
  hyphenated, never cut by the frame.
- Once an option does not fit its column on two lines, the control becomes a select with the same words and the
  legend as its label. The form's value does not change. [EIN-04]

## Rules

- Only for two to four short options. More or longer ones are chips, radio rows or a select. [EIN-04]
- For a setting with a sentence-like label use the choice row.
- Segments are one choice, not actions; they do not count as outlined actions. [K13]
