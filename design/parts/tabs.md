# Tabs

`sb-tabs`, `sb-tabs__tab` · `SbTabs`

Switches between views of one thing („Text · Vorschau · Verlauf“). Several open documents are document tabs; two to
four short options of a setting are a segmented control.

## States

- Selected: 3 px `accent` bottom edge, `link` colour and title weight.
- Other tabs: the word in `text-muted`.
- Disabled: the word in `text-subtle`, no hover change, out of the tab order.

## Behaviour

- Tabs start at the start edge and keep the width of their words; a hairline runs under the whole row. Each tab is
  at least 48 high.
- One Tab stop: Tab enters the row on the selected tab, the next Tab goes to the panel.
- Arrow keys move to the next and previous tab and wrap, swapped in a right-to-left row; Home and End jump to the
  first and last. Disabled tabs are skipped.
- Automatic activation: the tab that gets focus is selected at once. A panel that has to load shows its loading
  state.
- On Android the row scrolls sideways when it is wider than the screen.

## Rules

- Selected is the edge plus colour and weight, never a fill. [K17, NAV-01]
- Do not stretch the tabs over the width. [NAV-08]
- A selected tab is never disabled alone. A tab list that is disabled as a whole is not shown.
- In a window, the switch between two views of one file is a compact switch in the content head, not a second row of
  tabs under the document tabs.
