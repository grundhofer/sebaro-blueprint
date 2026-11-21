# Prose

`sb-prose` · web only

Running text: an article, a help page, rendered Markdown. Rows of a list are not prose and keep the full width.

## Behaviour

- A line holds at most 70 characters. Headings stand further from what is before them than paragraphs do from each
  other; the first block has no space above.
- Visited links show as visited only here.
- Rendered Markdown without classes takes the system's look: an image is never wider than the column, a rule is a
  hairline, a quote carries the ink line at its start, lists indent, and a task item shows its checkbox in the
  marker's place.
- A bare table looks like the table part. The renderer wraps it in a named, focusable region, so it scrolls by
  keyboard when it is wider than the column.
- Jump target: the block that a link inside the page jumps to carries the 3 px `accent` place line before its text
  until the next key or press. The text does not move. A code block gets no line.
- Markdown footnotes become the system's footnotes only where the product's renderer supports them: the digit
  leads to its note and puts focus there, the back link returns focus to the digit. Otherwise a text has none.

## Rules

- Running text is ragged right without automatic hyphenation. A long compound in a narrow column gets a soft hyphen
  by hand. [TXT-06, TXT-15]
- Never break inside a number and its unit or inside an identifier. [TXT-15]
- One link style; a link that leaves the site ends in the external-link icon. [K19]
- Compose has no part for running prose yet; an app that needs one builds it beside the copy. [K3, TXT-06]
