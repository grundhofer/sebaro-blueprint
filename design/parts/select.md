# Select

`sb-select` · `SbSelectField`

One choice from a list that is too long for segments or radio rows, shown as a field with a chevron at its end.

## States

- The chosen option stands in the field. Label, focus ring, error and disabled as the text field.

## Behaviour

- On the web the platform's own list opens. [EIN-05]
- On Android the field opens the menu with a check on the chosen row, or, for a long list, a titled sheet that
  scrolls. [EIN-05]
- A pick closes the list and updates the value. Dismissing keeps the value.
- A segmented control that no longer fits at large text becomes a select with the same words. [EIN-04]

## Rules

- A select always has a value, so it carries no „(optional)“. It is voluntary only when „none“ is one of its
  options.
- The chevron is an icon, never a character. [K25]
