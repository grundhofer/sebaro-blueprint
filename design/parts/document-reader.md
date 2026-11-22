# Document reader

`sb-reader`, `sb-doc-bar` · web and desktop

The view for a document that is shown, not edited, in a window: a PDF, an e-book, an image. Its tools stand in a row
of their own over the document, first the page, then the zoom.

## Behaviour

- Page: „Vorige Seite“, the field „Seite 3 von 12“, „Nächste Seite“. A typed number and Enter jump there. An entry
  outside the range goes back to the page shown, without an error sentence, because the field always shows where you
  are.
- Page Up and Page Down change the page while the view has focus. At the first and the last page the step tool is
  disabled.
- Zoom: „Verkleinern“, the value („100 %“), „Vergrößern“ and „Einpassen“, which is pressed while the page is fitted.
  The steps run from 50 to 400 %.
- „Schrift größer“ and „Schrift kleiner“ (⌘+ and ⌘−) are the two zoom tools here.
- The pages stand on a sunken ground, each with a frame. The view scrolls and is a focus stop of its own, named
  after the document.
- A single image stands in the middle of the view; a larger one starts at the top and scrolls, by keyboard too.
- At large text the tool row wraps.
- The contents of the document open as the overlay of the table of contents.

## Rules

- The reader's tools never stand in the title bar.
- The view says the keys it takes (Page Up, Page Down, Home, End) once in its description.
- A value between two tools is text with a hidden word for what it is („Zoom“).
- In a desktop app the zoom changes only the document, never the window's parts. [DSK-09]
