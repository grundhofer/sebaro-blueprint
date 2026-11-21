# Steps

`sb-progress__steps` · `SbSteps`

Where the person stands in a fixed flow of two to eight steps.

## States

- Done: the edge in `text` and a check.
- Current: the `accent` edge, the title weight and the `link` colour.
- Next: the edge in `border`, the word in `text-muted`.

## Behaviour

- The head says „Schritt 2 von 3“.
- Two to four steps are equal segments, each with its word. At large text the word goes under the check, and a word
  wider than its segment is hyphenated; it is never drawn over the next step.
- Once a word does not fit its segment on two lines, every bar and check stays and only the current step's word
  stands on a line of its own under the bars, start-aligned. The form does not change with the current step.
- Five to eight steps show only markers at every width: a check for a done step, the number for an open one, a
  stronger, underlined number for the current one. Below them stands „Schritt 3 von 7 · Vorstellen“.
- In every form a screen reader hears each step's word and state.

## Rules

- The current step is the `accent` edge plus weight, never colour alone. [K17]
