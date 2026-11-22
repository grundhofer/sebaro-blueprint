# Text action

`sb-text-action` · `SbTextAction`

An action written as a word in the link style, without a frame. Use it for every action below the one outlined
action of an area. Going to another place is a link, not a text action.

## States

- Rest: the label in `text` with the `link` underline. Hover: the label turns `link`. Pressed: `pressed-fill`.
  Focus ring.
- Disabled: `text-muted`, no underline.

## Behaviour

- The target is 48 high although the word is small.
- An optional icon stands before the word.
- At large text the label wraps at spaces and the underline stays on every line.

## Rules

- It is level 3 of the action levels; an area may hold several. [K13]
- It looks like a link and is a button, because it acts in place. [K19]
- The toast's „Rückgängig“ is the same word.
