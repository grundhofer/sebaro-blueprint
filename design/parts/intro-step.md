# Intro step

`sb-intro` · `SbIntroStep`

One step of the introduction on the first start. It has the form of the empty state, aligned to the start.

## Behaviour

- It shows the onboarding spot, a title, one or two sentences in `text-muted` and the quiet way out
  „Einführung überspringen“ as a text action.
- The steps („Schritt 1 von 3“) stand directly under the top bar. The step itself stands centred in the height
  between the steps and the bottom zone.
- Where a product area is the head of the view, the step leaves the spot out.
- The bottom zone holds the one primary action „Weiter: <Ziel>“.
- In reading order the way out comes before the primary action.

## Rules

- At most three steps, and no account. [STR-03]
- „Weiter“ alone is not a label; name the goal of the next step. [STR-03, K12]
- The way out stays a text action on every step. [STR-03]
