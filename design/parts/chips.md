# Chips

`sb-chips`, `sb-chip`, `sb-chip--input` · `SbChips`, `SbInputChips`

Filter chips switch filters on and off. Input chips show values the person entered and can remove. For two to four
short options that switch a view use the segmented control.

## States

- Chosen filter chip: the `accent` bottom edge on its frame, a check icon, the title weight and the `link` colour.
  Never filled.
- Hover: the frame in `text`. Focus ring on the frame.
- Disabled as every part.

## Behaviour

- The target is 48 high around a smaller drawn frame. At large text the frame grows with the line, so it always
  holds the whole word.
- A group of chips has a name. Chips toggle independently; as a single choice exactly one is pressed, and pressing
  another moves the choice.
- On Android a screen reader hears a single choice as radio buttons and a multiple choice as checkboxes.
- An input chip has a remove button with a full 48 target, named „<Wert> entfernen“.
- In a desktop window a chip is 32 high and its words wrap at spaces; under touch it is 48 again.

## Rules

- A single choice with chips is for more than four options, or for options that wrap. [EIN-04]
- Chips choose or filter a value. They are not actions and do not count as outlined actions. [K13]
- Never a pill. [FOR-06]
