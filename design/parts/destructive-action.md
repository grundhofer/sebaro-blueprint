# Destructive action

`sb-danger-action`, `sb-danger-action--outlined` · `SbDangerAction`

The action that deletes something saved, or ends something for good.

## States

- Rest: the trash icon and the danger word in `danger`, inside a `danger` outline with the 45° cut at the top end
  corner. Icon, word and cut tell it apart without colour.
- Hover `hover-fill`; pressed `pressed-fill` plus an inner `danger` ring; focus ring.
- Disabled: `border` outline and `text-muted`.

## Behaviour

- A press always opens the confirmation dialog first. The dialog's confirm key carries the word alone, with the
  cut.
- On a phone, confirming plays the double haptic pulse. [MOB-03]

## Rules

- Never filled and never beside the primary action bar; it stands at the end of the form's content. [K15]
- It is the only control with the 45° cut. The cut means „final“. [K11]
- A final step that deletes nothing is the same action without the trash icon. [K11]
- It is not counted among the outlined actions and is never demoted to hide it. [K13]
- In a „Mehr“ menu the delete row comes last, after a separator and without the cut, and opens the same dialog.
  [AKT-10]
