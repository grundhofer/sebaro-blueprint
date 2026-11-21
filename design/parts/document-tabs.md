# Document tabs

`sb-doc-tabs` · `SbDocTabs` (web and desktop; in Compose under an editor's top bar)

Several open documents at the top of the content; they open and close. The views of one thing are tabs.

## States

- Current: 3 px `accent` bottom edge, `link` colour, title weight; its cross always shows.
- Others: the cross shows on hover and focus, under touch on every tab.
- Changed: a grey dot before the name and the hidden word „geändert“.
- Pinned: always first, without a cross, not dragged; the hidden word „angeheftet“, no glyph.
- None open: „Keine Notiz offen. Wähle eine im Ordner links.“ In an empty collection only the first sentence.

## Behaviour

- A tab keeps the width of its name up to a limit and never shrinks; then the row scrolls and brings the current tab
  into view. Only a longer name is cut. Every tab carries its full name with the extension as `title`.
- The row stays while the text scrolls; a pinned tab stays at its start.
- ← → Home and End choose and focus a tab. ⌃⇥ and ⌃⇧⇥ switch from anywhere and keep focus in the text.
- Delete and ⌘W close the focused tab, a middle click too; ⌫ alone never closes. After closing, the neighbour
  towards the end is chosen.
- The cross is for the pointer only. Keyboard and screen readers close by the keys and by „Schließen“ in the menu
  „Datei“ and the palette.
- Tabs reorder by dragging, with the drop line. Without a pointer: „Reiter nach vorn“ and „Reiter nach hinten“ in
  the menu „Fenster“ and the palette.

## Rules

- An app that saves by itself asks nothing when a tab closes. Only an app that cannot save asks first, with the
  unsaved dialog. [DSK-10]
- The dot is grey, never a colour of its own; pinned shows no icon. [DSK-10]
