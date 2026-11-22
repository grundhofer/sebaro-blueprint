# Error details

`sb-details` · `SbErrorDetails`

The technical details of an error (a code, a path, the system's own message), kept out of the error sentence but
within reach of whoever needs them.

## States

- Closed, always at first: a chevron and the word „Details“.
- Open: the chevron is turned and the text stands below, as the system wrote it, in sebaro Mono. It has no ground
  and no copy button, because it is no code block.

## Behaviour

- It stands directly under the error sentence, wherever one stands: in the message of the action zone, in a
  dialog, after a field's error, in an error or warning callout. It starts under the sentence, not under the
  glyph.
- A long path breaks between its parts first, then anywhere, never with a hyphen, so it never widens its place.
- The word is a 48 target, 32 in a window with a pointer.
- Opening or closing it does not dismiss the error sentence.

## Rules

- No code in the main line of an error; code, path and system message go here. [K21]
- Never „Details“ without content, never a sentence in it that repeats the first, never open at first.
- An error sentence points to the details only where „Details“ follows.
