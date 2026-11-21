# Code

`sb-code`, `sb-code-inline`, `kbd`, `sb-kbd` · `SbCodeBlock`, `SbCodeSpan`, `SbCopyButton`

Code and machine values: a block with a copy key, inline code, and keys. A diff is a part of its own.

## States

- Copy key: after a press it reads „Kopiert“ for 2 s, then „Kopieren“ again.

## Behaviour

- The block stands on `surface-sunken`, with a bar that names the language and holds „Kopieren“. The code can take
  the focus, so it scrolls by keyboard.
- A bare block without a bar keeps ground, padding and scroll, but has no language and no copy key.
- „Kopiert“ is also announced politely, without a toast and without moving the focus.
- On Android a copy key outside a code block has the form of a secondary action.
- A key is an outlined word with a thicker bottom edge and no fill: „Strg + K“.

## Rules

- Inline code only for machine values (IDs, versions, commands); keys are keys. [TXT-08]
- Only keywords, strings, constants and comments get a look; the rest stays plain. No bold, no italic; code reads
  without colour. On Android the app splits the code into these. [TXT-10, FAR-11]
- An error in code is the wavy underline plus its message in a line of its own. [TXT-11]
- sebaro Mono is for code, IDs and versions only. [K8]
