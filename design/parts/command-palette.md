# Command palette

`sb-command-palette` · web and desktop

Every command and setting of an app, found by typing: the same in every desktop app and web app.

## States

- Active option: the place line and `link` colour, without a change of weight. The row under the pointer shows the
  hover fill.
- Setting: a check at the start of its row shows that it is on.
- Nothing found: „Kein Befehl passt zu „xyz“.“

## Behaviour

- ⌘K (Strg+K on Windows and Linux) opens it; pressed again it closes. The search field keeps focus while it is open.
- Typing filters by name, keywords and group; a match in the name comes before a match in keywords. ↑ ↓ move and
  wrap, Enter runs the option, Escape or a press on the scrim closes. Focus returns to where it came from.
- Options stand in named groups of a fixed order. A shortcut stands grey at the end of its row, key hints at the
  foot.
- The letters a search matched get a stronger weight, no fill.
- The shortcut of another overlay closes the palette and opens that one; other shortcuts wait.
- Forms of the same palette: a file finder („Schnell öffnen“: „Zuletzt“ first, each row names its place, the last
  option is „„<Name>“ anlegen“); a pick mode that chooses a thing for another command („Zielordner wählen“);
  prefixes that switch what the field searches, named at the foot.

## Rules

- ⌘K opens it in every app; an older shortcut may stay as a second one. [NAV-09]
- A setting keeps its fixed word („Seitenleiste“) and shows its state only by the check: never „an“ or „aus“ in the
  name, never a word that changes with the state. No switches in the palette. [NAV-09]
- A prefix is never needed to reach a command.
- Ranked results keep the groups in their fixed order.
