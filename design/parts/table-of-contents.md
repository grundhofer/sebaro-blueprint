# Table of contents

`sb-toc`, `sb-toc--overlay`, `sb-toc__group` · web only

The contents list of an article, or the page list of a documentation. Over a document reader it opens as an overlay
from the button „Inhalt“.

## States

- Current entry: 3 px `accent` start edge, `link` colour and title weight. In an article it is the heading being
  read, in a documentation the current page.
- Group of a documentation: closed or open, its chevron turned while open. The head names the group and counts its
  pages („3 Seiten“).

## Behaviour

- From 1024 px it is a sidebar beside the text. Below that it folds into one row that opens and closes.
- It can follow the reading position: the current entry is the last heading above the top of the view.
- Over a reader: focus goes to the current entry; the arrow keys move and wrap, Home and End jump; Escape, a press
  outside or Tab close it. Choosing an entry jumps there, closes the overlay and moves focus to the heading reached,
  which carries the place line of a jump target.
- A documentation with about eight pages or more groups them. „Übersicht“ comes first and lists every page; the
  group of the current page is open.
- Without scripts the list still opens and closes.

## Rules

- A documentation has at most two levels. Group names are the reader's words, never internal terms. [WEB-07]
- Every closed group still names itself and its page count. [WEB-07]
- The overlay is a list of links, not a menu: an entry leads to its heading. [NAV-08]
- Compose has no contents list yet; an app that needs one builds it beside the copy. [K3, NAV-08]
