# Video

`sb-video` · `SbVideo`

A video that plays in place after a press on its poster.

## States

- Before the press: the poster in a frame, and centred on it the button „Abspielen“ (filled play icon plus the
  word) on its own ground with the ink line, so it stays legible on any picture.
- Playing, web: the browser's controls with its captions menu; focus moves to the video.
- Playing, Android: the app's player draws into the frame; the controls of the audio row stand under it with the
  chip „Untertitel“.
- Failed: „Das Video lässt sich nicht abspielen.“, as in the audio row.

## Behaviour

- Title, length and caption languages stand as text under the frame.
- The button's name starts with its visible word: „Abspielen: <Titel>, Video, 3 Minuten 42 Sekunden“.
- The poster loads with the page, and dark mode may have its own poster. The video loads only after the press.
- Without the script the browser's own controls stand over the poster.

## Rules

- Nothing loads before the press, nothing starts by itself, a second medium pauses the first. A video has a
  poster from your own server without text in it, a one-sentence description and captions. [BIL-06, BIL-07]
- The description says what the picture shows, not the title again. Only screen readers get it, and one sentence
  serves the light and the dark poster. [BIL-07]
- Never autoplay, never a foreign player or platform, never a play icon without a word. [BIL-07]
