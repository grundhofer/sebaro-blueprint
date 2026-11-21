# Site header

`sb-site-header`, `sb-keymark` · web only

The head of every website: the start link, the site's words, the language and the theme button. A web app with a
window has the title bar instead.

## Behaviour

- The start link is the sebaro key mark alone on the sebaro website. A product website shows its whole tile and its
  name.
- The words are „Apps“, „Projekte“, „Über“, „Kontakt“; a product website may leave them out. The current page and
  the current language in „DE / EN“ carry the 3 px `accent` bottom edge and `link` colour.
- „Hell oder Dunkel“ is a labelled button. The first visit follows the system. A press switches and stores the
  choice; a press that lands on the system's mode clears it, so two presses return to the system. The label never
  changes, and the new mode is announced.
- From 1024 px everything stands in one row, below that in two, the words in the second. At phone width everything
  stays visible. [NAV-07]
- A web app without a window drops the four words and the theme button: tile and name, its own places, then the
  „Mehr“ menu with „Hell oder Dunkel“, „Farbton“, „Sprache“ and „Einstellungen“.
- A long one-word product name breaks at large text where the product has set a soft hyphen in its name.

## Rules

- No menu button on a website: all words stay visible. [NAV-06]
- The theme choice is called „Hell oder Dunkel“, never a sun or moon icon, never hidden in a menu on a website.
  [K28, AKT-09]
- „DE / EN“ leads to the same page in the other language, never to a start page. A missing page shows its code grey
  and unlinked. No flags, no redirect by browser language. [WEB-10]
- The key mark is the brand, never a second primary action. [K4]
