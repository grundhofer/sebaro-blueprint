# Action zone of a window

`sb-bottom-block`, `sb-primary-action-bar__status`, `sb-primary-action-bar__counts`,
`sb-primary-action-bar__message` · web and desktop

The foot of a window across its whole width: the state sentence at the start, the one primary action at the end.

## States

- State sentence: the total of what is open, once („1 Konflikt offen.“). With several rows selected it says „3
  ausgewählt“.
- Failure: the error glyph in `danger` and a sentence in `text` replace the state sentence.
- Counter line: a grey line before the state sentence (words, characters, line and column).

## Behaviour

- A sentence of several parts joins them with „ · “: first the state of the document („Nicht gesichert“), then the
  counts. A glyph stands only before a part that warns.
- The counter line is a line of its own, never part of the state sentence, and is not announced. A view with nothing
  to count keeps the line's place, so the zone does not jump when the tab changes.
- A command that fails without a field (a menu command, a drop, an autosave) states its reason here. The sentence
  stays until the next key, press or Escape; one that no action of the person caused stays at least 10 s.
- A toast stands at the top of the zone. The zone grows for it or for a long sentence, and the content gives way.
- Below 480 px of window width the sentence stands above a full-width action.

## Rules

- The total of the states appears exactly once, here, never at the foot of the sidebar. It speaks only about what is
  open. [STA-07]
- The zone spans the window under sidebar and content, with one continuous ink line. [EBE-08]
- One primary action, last and at the end. [K12]
- A place that is nothing open (where the files live) goes into the inspector or under „Über“.
