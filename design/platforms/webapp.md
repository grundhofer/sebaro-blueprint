# Web app

What holds for a web app beyond the core rules and the view types. A web app with a window (title bar, sidebar,
inspector) follows [desktop.md](desktop.md); the rest of this page is the web app without a window.

## The frame

- The frame is the [app frame](../parts/app-frame.md): three to five places like a phone app, „Einstellungen“
  last. No website navigation, no theme button. [NAV-06]
- The top bar of a top-level place holds the tile beside the view's title and the menu „Mehr“. [NAV-06]
- „Mehr“ holds three groups of rows with one choice each: „Hell oder Dunkel“ („Wie das System“, „Hell“, „Dunkel“),
  „Farbton“ and „Sprache“. The language is stored, and the app switches without a reload. [NAV-06]
- „Einstellungen“ holds „Bewegung immer reduzieren“ and „Über“, without an action zone. [NAV-06]
- ⌘K (Ctrl+K) opens the command palette here too. [NAV-09]
- The first focus stop is the skip link „Zum Inhalt“. [ZUG-06]
- Every view ends with the footer and its links „Impressum“ and „Datenschutz“; the tone stands in „Mehr“, not
  there. [WEB-03]

## Layout

- Two page breakpoints, 640 and 1024 px; parts adapt to their own place, not to the page. [RAU-03]

## Print and sharing

- Paper is always light, and print shows only the content. [WEB-04, WEB-11]
- An app with one shell and private access links needs only the share image of its start page. An access link gets
  no image and no canonical address of its own. [WEB-09]
