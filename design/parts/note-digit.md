# Note digit

`sb-note-ref`, `sb-note-refs` · web only

The small digit after a claim on a website. It leads to the claim's note in the list „Belege“. Apps use claim
rows instead. Shared rules: Evidence.

## States

- At rest: the digit as real text, small and raised, in the link style, underlined in both modes.
- While its popover is open (narrow screens) it reports that it is expanded.

## Behaviour

- It stands directly after the word, without a space, and after the punctuation when the note covers the whole
  sentence. Several digits are divided by commas.
- A press jumps to the note and puts focus on it. Below 1024 wide it may open the note popover instead. The
  note's back link returns focus to the digit.
- A screen reader hears „Beleg n“. The target is at least 24 × 24, larger than the glyph.
- Because it is real text, it survives reader mode, print and missing styles.
- Footnotes written in Markdown use the same digit, named „Fußnote n“.

## Rules

- One numbering per page, 1 to n in the order of first appearance; a claim backed by the same facts keeps its
  number. [BEL-06]
- Never a digit on a claim whose note may not be stated. When the facts are stale, the digits and their sentence
  are not written at all. [K27]
- Never lime, never mono, never inside a word. [BEL-02]
- Never in an app. [BEL-03]
