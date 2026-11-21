# Screenshot grid

`sb-shots`, `sb-shots--window`, `sb-shot` · web only

The screenshots of a product on its website, all visible at once.

## States

- Picture: in a box of its device's shape, phone by default, a window form for desktop apps.
- Missing picture: the box stays, with the image icon and „Bildschirmfoto folgt“.

## Behaviour

- Two columns, three as soon as a third fits, never four.
- Nothing scrolls sideways and nothing is swiped.
- The caption stands under each picture in `text-muted`.
- The light and the dark picture are a pair; the page shows the one that fits the chosen mode.
- Pictures below the first screen load late.

## Rules

- Each one has an alt text that says what the screen shows, a caption, and a light and a dark image. [WEB-08]
- No device frame and no shadow around a picture. [WEB-08]
- Pictures come only from the site's own server. [K27]
