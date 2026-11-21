# Bottom sheet

`sb-sheet` · `SbBottomSheet`, `SbChoiceSheet`

A layer from the bottom edge for choosing one of a few options. A question before a final step is a dialog.

## Behaviour

- The head shows the title and the close button „Schließen“; under it stand radio rows or a list. There is no drag
  handle.
- It opens from below over the scrim and closes without motion. The page behind does not scroll and takes no input.
- It is at most 85 % of the window high; the content scrolls inside. On phones it has the full width, from 640 px of
  window width it is at most 560 px wide and centred at the bottom.
- Focus starts on the chosen option, else on the first control, and stays inside the sheet. Escape, „Schließen“ and
  a press on the scrim close it; focus returns to the opener.
- On Android the sheet styles the system bars of its own window. A light sheet over a dark page is given that page's
  ground.

## Rules

- Only for choosing, never a form or a receipt. On Android pass `title`, so the head with „Schließen“ appears.
  [EBE-04]
- Never for evidence: claim rows open in place. [EBE-04]
- A long list of options opens from a select, not from an action button of another look.
- The one exception is the iOS form sheet: full height, „Abbrechen“ at the top, the fields scrolling, „Sichern“ as
  the primary action at its bottom. [EBE-04, MOB-07]
- On Android the app overrides the screen-reader name of the scrim; the system's German word for it is wrong
  („Tabelle schließen“).
