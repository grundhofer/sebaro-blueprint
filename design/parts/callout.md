# Callout

`sb-callout`, `sb-callout-area` · `SbCallout` (the callout area: web only)

A notice that stands in the content: „Hinweis“, „Achtung“, „Fehler“, „Erfolg“.

## States

- The four kinds are told apart by a filled glyph in the status colour plus the title word, inside a hairline
  frame.

## Behaviour

- A callout of one sentence may drop the title when the sentence starts with the kind's word in the strong weight
  and a colon („Achtung: …“), so glyph and word stay together.
- Actions wrap under the text. „Ausblenden“ hides the callout and moves the focus to the next control; the product
  keeps the choice.
- An error or a warning may carry one „Details“ after its text, for the system's own message.
- A callout that appears while the page is in use: one that asks for a decision is announced at once, any other
  politely.
- A file name in a callout breaks only after - . _ / and without a hyphen.
- Callout area: notices over a document or a list that must not take its room go into one named region („Hinweise“)
  that scrolls in itself and is capped in height. A mark at its end shows that it holds more; while it scrolls it
  is a tab stop. A notice that asks for a decision never goes into the area.

## Rules

- No fill and no coloured edge: an edge means the current place, and a status colour lives on glyphs only. [STA-05]
- Its actions are secondary or text actions, never the primary one, never lime. „Ausblenden“ comes last. [STA-05]
