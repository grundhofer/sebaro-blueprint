# Areas and F6

No class of its own · web and desktop

A window has up to five areas: title bar, sidebar, content, inspector and action zone. Tab alone would walk through
every folder and tool before the text, so F6 moves to the next area and ⇧F6 to the previous one, round.

## Behaviour

- Hidden areas (a closed pane, a closed overlay) are skipped.
- Each area gives back the element that had focus in it last, else its first control. A group with one Tab stop is
  entered on that stop: the chosen radio, the current tab, the tree's chosen row.
- An area with nothing to press, such as a text, takes focus itself and shows the focus ring inside its edge.
- „Nächster Bereich“ and „Vorheriger Bereich“ also stand in the menu „Fenster“ and in the palette, because many Mac
  keyboards need fn for F6. From there the step counts from the area that had focus before the menu or the palette
  opened.
- Escape leads out of the palette, a menu and a dialog, back to where focus came from.
- An app frame uses the same walk: start pane, end pane, navigation.

## Rules

- Each area is a named region: the sidebar a navigation, the content the main region, the inspector a region with
  its heading as its name.
- No area gets a frame of its own beyond the focus ring.
- F6 and ⇧F6 are fixed shortcuts and mean nothing else in any app. [DSK-09]
