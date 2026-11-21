# Full-text search

`sb-command-palette` in its full-text form · web and desktop

The search through all documents of an app. It opens in the frame of the command palette over the window, not as a
view in the sidebar. Searching inside the open document is the find bar.

## States

- Nothing searched yet: the list is empty and the foot shows no sentence.
- Searching for over 1 s without a hit: „Suche läuft …“ stands in place of the list, without a spinner.
- Hits: a group head with the count („3 Notizen“), then one row of three lines per document: its name, its folder,
  and the words around the hit with the hit marked. The foot says the sum („5 Treffer in 3 Notizen.“) and, when
  something was skipped, why.
- Nothing found: „Keine Notiz enthält „xyz“.“

## Behaviour

- The app opens it with a command and a shortcut of its own („In allen Notizen suchen …“ in the menu and the
  palette). ⌘F stays the find bar.
- Under the search row stand the options as filter chips („Groß und klein beachten“, „Regulärer Ausdruck“) and,
  where the app has them, compact filter fields („Ordner“, „Schlagwort“).
- Keys, scrim and focus return are the palette's. Enter opens the document at the hit and closes the search; opened
  again, it starts empty.
- A fast local search shows nothing while it runs. Hits do not stream in under a growing foot.

## Rules

- It uses the palette's frame and adds no new part. [NAV-09]
- A hit is the mark fill plus its edge, on rendered text only. [FAR-12]
- The foot states counts as a sentence, with the reason for anything skipped. [K27]
