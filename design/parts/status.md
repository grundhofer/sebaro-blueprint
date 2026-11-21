# Status

`sb-status` · `SbStatus`, `SbRowStatus`

The state of a thing as a glyph plus a word.

## States

- Info: „läuft“ with the progress glyph.
- Neutral, the grey glyph in `text-muted`: „geplant“ with the clock, and any status that only informs („nur
  online“).
- Success: „erledigt“. Danger: „Fehler“.
- Warning: „offen“, „nicht belegt“, and any status that asks the person for something. „Konflikt“ carries the
  warning glyph everywhere, in a row, a tree and a timeline.
- The glyph has the status colour and its own shape; the word stays `text`.

## Behaviour

- One line at normal size. At large text the words wrap beside the glyph, which stays centred on the first line;
  the status is never wider than its place.
- The glyph is larger in lists and small in notes and check lists.

## Rules

- A glyph plus a word from the fixed words. Never a coloured word, a filled badge or colour alone. [K20]
- In a row the status has at most two words and is never abbreviated. Grey informs, the warning colour asks for an
  act. [STA-08]
- Partly done is counted with „offen“, not named: the row says „2 offen“, the sentence „Noch 2 offen.“, the meta
  line „3 von 5 beantwortet“. The pending glyph is in the warning colour when the rest asks for something and grey
  when it goes on by itself. Never „teils offen“, „teilweise“ or a percentage alone. [STA-09]
- For a state the fixed words do not name, an app writes its own words with the fixed glyphs: the progress glyph
  while it looks for something, the success glyph for what it found. No new glyph, no new colour. Nothing found yet
  stays the running state, never the error glyph.
