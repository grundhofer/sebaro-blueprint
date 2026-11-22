# Quote

`sb-quote` · `SbQuote`

Quoted words with their source. A quote written in Markdown inside running prose looks the same.

## Behaviour

- The quoted words carry the quote line: an ink line on their start edge that ends with the last quoted line. No
  ground, no radius, no other edge.
- The source stands under the words in caption and `text-muted`, aligned with them and outside the line. A link
  in the source uses the link style.
- Several paragraphs keep the normal gap between them; a list inside the quote indents like any other list.

## Rules

- No italic for a whole quote. [TXT-17]
- Quotation marks belong to the text („…“); the part adds none. [TXT-17]
- The quote line stands only beside running text. Rows, notes and steps take the place line in `accent`.
