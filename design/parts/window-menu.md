# Window menu

`sb-menu--window` · web and desktop

The button „Menü“ in the title bar on Windows and Linux and in a web app with a window. macOS shows the same groups
in its native menu bar.

## Behaviour

- Five groups in this order, each a submenu: „Datei“ · „Bearbeiten“ · „Darstellung“ · „Fenster“ · „Hilfe“.
- F10 and a lone Alt open it on „Datei“ (Windows and Linux), only while „Menü“ is in view; pressed again they close
  it.
- Every item with a fixed shortcut shows it at the end of its row. Toggles and choices carry a check at the start.
- macOS: „Über <App>“ and „Einstellungen …“ stand in the app menu instead; an item whose shortcut the page itself
  must hear shows no key in the menu bar.
- „Datei“: new, new window, open, last opened, close, quit.
- „Bearbeiten“: undo and redo, cut, copy, paste, select all, „Suchen …“, „Verschieben nach …“, „Einstellungen …“,
  and last after a hairline „Löschen …“.
- „Darstellung“: sidebar, inspector and their widths, „Hell oder Dunkel“ with „Farbton“ right after it, „Bewegung
  immer reduzieren“, „Schrift größer“ and „Schrift kleiner“, „Befehle …“.
- „Fenster“: minimise, „Nächster Bereich“ and „Vorheriger Bereich“, with document tabs „Reiter nach vorn“ and
  „Reiter nach hinten“, then the open windows with the front one checked.
- „Hilfe“: the app's help, „Tastaturkürzel“, „Fakten und Prüfungen“, updates, „Über <App>“, „Fehler melden …“.
  Without network and help pages only the second and third.

## Rules

- „Menü“ shows icon and word. [DSK-08]
- An app's own items stand in one group of their own between the fixed items of a menu, set off by hairlines; never
  between the items of a fixed group. [DSK-08]
- An item whose command has no target now is disabled, never hidden and never silent. [DSK-08]
- The theme choice „Wie das System · Hell · Dunkel“ lives here and in the settings view, never as a button in the
  title bar. [K28, DSK-05]
- A product with no Windows or Linux build that is no web app needs no „Menü“ button. [DSK-08]
