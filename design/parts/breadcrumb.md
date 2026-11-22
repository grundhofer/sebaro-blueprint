# Breadcrumb

`sb-breadcrumb`, `sb-breadcrumb--path` · web only

The way from the start to this page as links. It is also the form of a menu path that the interface shows.

## States

- Navigation: links in the label size. The current page is marked as current, is not a link and is `text-muted`.
- Path form, shown but not a navigation: the steps are words in `text`, the last one in the strong weight.

## Behaviour

- A chevron icon stands between the steps. It is hidden from screen readers and mirrors in right-to-left text.
- On pointer pages the links may be 24 high; under touch they are 48.

## Rules

- A breadcrumb is a named navigation with its current page marked. [NAV-08]
- The chevrons are icons, never „›“, „>“ or „→“. [K25]
- In running text a path is a sentence: „Einstellungen, dann Konto, dann Daten exportieren“. [TXT-16]
- Not in Compose yet. An app that needs one builds it beside the copy. [K3]
