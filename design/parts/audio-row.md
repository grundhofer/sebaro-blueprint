# Audio row

`sb-audio` · `SbAudioRow`

One recording or sound file that plays in place, as a row among rows.

## States

- At rest: the title, the time as text („0:12 / 0:42“), the play button and the seek slider.
- Playing: the button shows the pause icon and is named „<Name> anhalten“ instead of „<Name> abspielen“; the
  time and the slider follow.
- Failed: „Die Aufnahme lässt sich nicht abspielen.“ after the error glyph in `danger`; the sentence stays `text`.

## Behaviour

- The slider seeks with the pointer, the arrow keys (5 seconds), PageUp and PageDown (10 %), Home and End. It
  reads „0:12 von 0:42“. Fill and thumb are `accent`, as on every slider.
- The length shows before anything loads. Times read m:ss, from one hour h:mm:ss.
- Hairlines divide the rows.
- On the web the browser's own player is the engine; without the script its controls show and everything still
  plays. On Android the row keeps no state: the app's player plays.

## Rules

- Nothing loads before the press, nothing starts by itself, a second medium pauses the first. [BIL-06]
- The file comes from the product's own server. [K27]
- The row has no motion of its own; the fill moves because the person started playback. [K23]
