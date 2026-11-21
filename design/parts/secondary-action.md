# Secondary action

`sb-secondary-action` · `SbSecondaryAction`

The outlined button for the one other thing an area offers: „Bearbeiten“, or „Abbrechen“ in a dialog. A further
action in the same area is a text action.

## States

- Rest: `border-strong` outline, no fill, label in `text`. Hover `hover-fill`, pressed `pressed-fill`, focus ring.
- Disabled: `border` outline, `text-muted` label.
- Busy: the turning loader icon replaces the leading icon, the label stays. Only for remote work over 1 s. [K22]

## Behaviour

- 48 high. On the same line as a primary action it stretches to that action's height.
- Work on the device that takes longer than about 1 s shows no spinner. Its sentence stands where the result will
  appear („Wird gesichert …“, „Wird exportiert …“); under 1 s nothing shows. [K22]

## Rules

- At most one per area. [K13]
- Never filled, never lime. [K13]
- In a group it stands before the primary action. [K12]
