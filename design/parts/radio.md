# Radio and choice row

`sb-radio`, `sb-choice-row` · `SbRadioChoice`

One choice from a few options whose labels read like sentences. Two to four short words that switch a view are a
segmented control; a long list is a select.

## States

- Not chosen: a `border-strong` ring. Chosen: an `accent` ring with an `accent` dot and the label in the strong
  weight.
- Focus ring on the ring.
- Disabled: ring and dot `border`, label `text-muted`. A disabled chosen option keeps its dot.

## Behaviour

- Each row is the target and is 48 high.
- The choice row is a named group: the question as its legend, the options in one wrapping row.
- On Android disabling takes the whole row; the chosen state stays.

## Rules

- The on-state is an `accent` mark, never lime and never a fill behind text. [K4]
- The ring is round; it is one of the four pill shapes. [FOR-06]
- With one option always chosen, the group carries no „(optional)“.
