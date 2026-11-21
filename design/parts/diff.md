# Diff

`sb-diff` · `SbDiff`

Compares two versions of a text or a file, line by line.

## States

- Unchanged line: plain code with its two line numbers.
- Added line: the sign + and the fill `success-subtle`. A screen reader hears „hinzugefügt: “ first.
- Removed line: the sign − (U+2212) and the fill `danger-subtle`. A screen reader hears „entfernt: “ first.

## Behaviour

- The head names the file and the two versions („Fassung 1.4.0 gegen 1.3.2“).
- The lines stand in sebaro Mono. Code keeps its five looks; hunk heads and line numbers are `text-muted`, and
  line numbers cannot be selected.
- The foot is one sentence with the counts: „2 Zeilen hinzugefügt, 1 entfernt“.
- Long lines scroll inside the diff, which takes focus for that. The page never scrolls sideways.

## Rules

- Every changed line carries + or − (U+2212); the fill never stands without its sign. [TXT-11]
- A sentence gives the sum. [TXT-11]
- The two fills are the one exception to „no coloured fill behind text“. Use them nowhere else. [K6]
