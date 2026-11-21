# Notes list

`sb-notes`, `sb-note` · web only

The list „Belege“ on a website: the notes of a section, numbered, each with the way back to its claim. Shared
rules: Evidence.

## States

- The note that was jumped to carries the `accent` start edge, without a fill.

## Behaviour

- The title is „Belege“, with the marker „Beispieldaten“ for sample data. The list stands at the end of the
  section where its first digit appears.
- One note stands below the other, 1 to n, at every width. The text is no wider than the prose measure.
- A note starts with its number, which is the back link (a 48 target, „Zurück zur Aussage n“). Its body follows in
  caption: result line with the check glyph, method, proof, outflows, limits, sender, the link „Alle Prüfungen“.
- A note cited more than once has one back link per citation, one under the other („1“, „1b“).
- A note without a digit keeps its place; its number is plain text.
- In a window the back link is a 32 target, under touch 48 again. In a very narrow list the back links stand
  above the text.
- Print keeps the list.
- Footnotes written in Markdown use the same list, titled „Fußnoten“, with the author's text as the body and
  „Zurück zur Stelle n“.

## Rules

- Never side by side, never in columns, never hidden. [BEL-02]
- The note text is generated, never typed. [BEL-06]
- The body keeps the fixed order of a note. [BEL-05]
