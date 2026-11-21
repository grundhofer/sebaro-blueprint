# Compact tools and actions

`sb-icon-button--compact`, `sb-secondary-action--compact`, `sb-text-action--compact` · web and desktop

The small tools and actions of a window: in the title bar, in a group head of the sidebar and in the head of the
content.

## States

- A compact action that opens a menu keeps the hover ground while the menu is open, so the way to what is open stays
  visible. A pane's toggle keeps none.
- A compact switch (two views of one file, a sort choice): pressed shows the 3 px `accent` bottom edge, `link`
  colour and title weight.

## Behaviour

- They are 32 high and return to 48 under touch.
- A tool shows only its icon. Its name is its label for screen readers, and its tooltip reads „Name Kürzel“.
- A tool announces its shortcut together with its name („Widerrufen, Befehl Z“).
- The switch between two views of one file carries an icon before its word, never the icon alone.

## Rules

- A tool that acts in place may be icon-only. Whatever opens a place („Einstellungen“, „Heute“, „Suche“) always
  shows icon and word. [K17, NAV-10]
- Pressed is never a fill. [EIN-04]
- An area that takes keys of its own while it has focus, beyond Tab and the arrows of its role, says them once in
  its description, and in the app's keyboard help where there is one.
