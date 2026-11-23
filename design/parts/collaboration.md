# Collaboration patterns

`sb-vote`, `sb-card--hidden`, `sb-canvas`, `sb-pointer`, `sb-wheel` · web only

Patterns for a web app where several people share one board.

## Behaviour

- **Time box.** Only a sentence in whole minutes, in the state sentence of the action zone: „4 Karten. Noch
  3 Min. zum Schreiben.“ At the end: „Zeit um. Ihr könnt weiterschreiben.“, and nothing locks. The moderation
  has „Pause“ and „+1 Min.“.
- **Votes with a budget.** Each card has „Eine Stimme weniger“, the count and „Eine Stimme mehr“. The rest is a
  sentence: „Noch 3 von 5 Stimmen.“, then „Alle 5 Stimmen vergeben.“ Plus is disabled when all are given, minus
  at 0. A stack takes one vote as a whole, inside its frame; its cards have none.
- **Hidden card.** While people write, a card of someone else is an empty card with „verdeckt“ as glyph and word
  and the writer's name, already in its place. „Aufdecken“ is the moderation's one primary action.
- **Free canvas.** The plain ground without grid or snapping, scrolling both ways, with cards and named groups in
  a frame without fill.
- **Pointers of the others.** An ink arrow with the person's name. It glides while it moves and jumps under
  reduced motion. The state sentence says „2 Personen sind auf der Fläche.“
- **Wheel.** A modal dialog without a primary action. The wheel is flat ink, turns less than once and stands
  still under reduced motion. Its result is a sentence: „Als Nächstes: <Name>.“

## Rules

- The remaining time stays calm: no bar, colour, pulse or seconds. A sound only once at the end, by a personal
  switch, off by default. [K23]
- A person's colour is only a ring beside the name. [FAR-16]
- Every move on the canvas also works without a pointer: „Verschieben nach …“ and the arrow keys.
- A setting can hide the pointers: „Zeiger der anderen zeigen“.
- Targets stay 48 in a web app without a window.
- Give places on the canvas in a unit that grows with the text; at fixed places cards overlap at large text.
