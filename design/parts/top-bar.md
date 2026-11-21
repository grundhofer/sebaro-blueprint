# Top bar

`sb-top-bar`, `sb-top-bar--sub` · `SbTopBar`, `SbBackButton`

The head of an app view: it names the view and holds the way back and a few tools. A desktop window has a title bar
instead.

## States

- Top level: the app's sign tile and the title, with an optional subtitle in `text-muted`.
- Sub-screen: a leading back or close button and a smaller title, no tile.
- Search view: the search field stands in place of the title and takes its width; the view then gets its name for
  screen readers.

## Behaviour

- Tools stand at the end as icon buttons.
- Large text: once a word of the title would break beside the back button and the tools, the title moves to its own
  line under them. The reading order stays the same.
- In an app frame that shows list and detail side by side, the detail's back button is not shown.

## Rules

- Never a primary action or „Sichern“ in the top bar. In a phone editor „Sichern“ stands at the bottom, and only
  while something is unsaved. [K18]
- The bar stands on `bg`: no fill, no shadow, no elevation. [K18]
- The title is a short noun. It wraps and is never cut with an ellipsis. [K26, SCH-06]
