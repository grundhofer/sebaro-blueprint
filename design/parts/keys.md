# Keys

`sb-keys` · web and desktop

A shortcut written as text: at the end of a row or a menu item, and in a tooltip. A key that a help text describes
is a keycap instead.

## Behaviour

- On macOS it is written in the key glyphs of the font, the modifiers in the order ⌃⌥⇧⌘ („⇧⌘P“).
- On Windows and Linux it is written in words joined by „+“, in the order Strg, Alt, Umschalt („Strg+Umschalt+P“,
  English „Ctrl+Shift+P“).
- „Pos1“, „Ende“, „Bild auf“ and „Bild ab“ are words on every system, macOS too (English „Home“, „End“, „Page Up“,
  „Page Down“). On macOS the word follows the modifier glyphs without a space („⌘Ende“).
- The page is written in the macOS form; the form of the platform and the language is set when the page runs.
- A screen reader hears a spoken form („Befehl K“).
- The keys never shrink and are never cut. In a menu row at large text they go under the words.

## Rules

- Grey (`text-muted`), without a frame, at the end of the row. [ICO-08]
- Keycaps only in help text. [ICO-08]
- The shown keys and the shortcut announced to screen readers say the same.
