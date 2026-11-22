# Camera and photos

Android only · `SbCameraFrame`, `SbCaptureStrip`, `SbPhotoOutline`, `SbCornerEditor`, `SbFilterChoice`,
`SbPageView`, `SbPhotoThumb`

The camera that takes pages, the views that crop and filter them, and the person's photos in lists. Camera, page
finding and image processing stay the app's.

## States

- Finder: „sucht Blatt“ or „Blatt erkannt“, as glyph and word.
- Flash: a key with icon and word („Blitz: Auto“, „Blitz an“, „Blitz aus“) that opens a menu of the three.
- Not yet allowed: the app's sentence what the camera is for, with the primary action „Kamera erlauben“. Denied:
  a calm sentence with „Einstellungen öffnen“.
- Not available: „Kamera nicht verfügbar“; capture is disabled.

## Behaviour

- Viewfinder: top bar with „Kamera schließen“ and flash, the preview, the finder's state, the pages taken as
  small pictures, and at the bottom the primary action „Seite aufnehmen“ with the count as its hint („2 Seiten
  bisher“).
- A capture is confirmed by the count and the new small picture entering from below. The found page's outline
  jumps without a transition.
- Closing with pages taken asks „Scan sichern?“; so does the system's way back.
- Corners: 48 handles, dragged or moved with arrow keys or four buttons; the primary action is „Zuschneiden“.
- Filter: „Original“, „Graustufen“, „Schwarzweiß“ as single-choice chips; the big page shows the result; the
  primary action is „Übernehmen“.
- Photos in lists: the name stands under the photo. At large text the grid becomes one column with the picture
  beside the words.

## Rules

- Draw the person's photo unchanged, no filter, no text on it. Put the screen of `SbPageView` into `SbDarkArea`
  yourself. The camera gets at most five outlines a second. [BIL-08, MOB-12]
- Camera and full-screen page view always take the dark mode's values; a page view in a pane follows the mode.
  Never a list or a form in the dark area. [MOB-12]
- Never a round shutter without a word; no flash, sound or pulse on capture. [MOB-12]
- A screen reader hears the page's name, never a guessed description. [BIL-08]
