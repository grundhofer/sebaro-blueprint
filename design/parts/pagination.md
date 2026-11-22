# Pagination

`sb-pagination` · web only

Page numbers under a long list on a website.

## States

- Current page: text, not a link, with the 3 px `accent` line under it, `link` colour and strong weight.
- Other pages: links in the look of the site navigation, each a 48 target.
- Gap: an unlinked „…“.

## Behaviour

- It shows the first and the last page, the current page and its neighbours. With up to five pages every number
  shows.
- When it gets narrow the neighbours step back, so „1 … 5 … 12“ stays on one line.
- Each number reads „Seite 4“ for screen readers.
- Under the numbers stands the pager with its goal („Weiter: Seite 6, ältere Notizen“); the last page has none.
- Addresses carry the page number; page 1 has none.

## Rules

- First, last, the current page and its neighbours, at most five numbers; a gap is an unlinked „…“. [WEB-06]
- It is navigation, never lime. [WEB-06]
- No endless loading. [WEB-06]
- The current page is never told by colour alone: line and weight mark it. [K17]
