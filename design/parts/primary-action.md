# Primary action

`sb-primary-action`, `sb-primary-action-bar` · `SbScreen(primaryAction = SbPrimaryActionModel(…))`

The one lime button of a view: the next step. A view without a clear next step has none.

## States

- Rest: lime fill with an outline; hover and pressed change only the fill. [AKT-03]
- Disabled: `surface-sunken` fill, `border-strong` outline, `text-muted` label, no lime. [K20]
- Busy: it stays in place, the label says what runs, an ink bar grows along its bottom edge or sweeps. [K14]
- Done: a check icon and a word for 1.5 s.
- Failed: the label reads „Noch mal versuchen“; the reason stands above as a sentence with the error glyph.
- Cancelling: still busy, with „Wird abgebrochen …“.

## Behaviour

- 56 high. Full width at the bottom on a phone; in a wide view natural width at the end of the bar, the state
  sentence at the start.
- In a group it is the last element in reading, focus and visual order.
- A result that is there at once (a roll, a counter) shows no busy and no done state.
- After a field error it keeps its verb; „Noch mal versuchen“ is only for a failure without a field.

## Rules

- At most one per view, at the bottom of the area it acts on; never in the top bar or a dialog. [K12, K18, EBE-03]
- The label is verb plus thing; never icon-only, never a bare „Weiter“ or „OK“. A step of a fixed flow may read
  „Weiter: <Ziel>“. [K12]
- Under an action that sends data, one line says where it goes. [K16]
- A phone editor shows „Sichern“ only while something is unsaved.
- A shake is only an extra way to trigger it: it can be switched off and never deletes or sends. [MOB-10]
- On Android pass it to the screen; never place the button yourself.
