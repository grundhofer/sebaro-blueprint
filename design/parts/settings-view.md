# Settings view

`sb-window__settings-group` · web and desktop

The settings of a desktop app or a web app with a window: a view in the main window. A phone app builds its settings
from the settings view type.

## States

- Full: the sidebar shows the settings' areas („Allgemein“, „Editor“, „Tastatur“, „Über“) with icon and word and the
  place line; the path reads „Einstellungen › Allgemein“.
- Slim: an app with up to about eight settings shows them as one group, without the area sidebar. „Über“ is then a
  place of its own, reached from the menu „Hilfe“.

## Behaviour

- ⌘, opens it, as do „Einstellungen …“ in the menu, „Einstellungen“ in the sidebar's foot and the palette.
- The content stands in groups, each with a heading and its controls.
- There is no action zone: every choice applies at once.
- The title bar carries „Zurück zu <Ort>“. Escape anywhere in the view, except in a text field, a menu or a dialog,
  leads back to the place before.
- „Hell oder Dunkel“ („Wie das System“ · „Hell“ · „Dunkel“) and „Farbton“ („Kühl“ · „Warm“) are choice rows and stay
  in step with the menu and the palette.
- „Über“ with the claim rows is an area of the settings.

## Rules

- Never a separate window. [DSK-02]
- Every setting has a help sentence. [DSK-02]
- The theme is a group of choice rows, not a segmented control: „Wie das System“ does not fit three equal columns.
  [DSK-02, DSK-05]
- The sidebar keeps its tool, so it can be closed again when it has become an overlay. [DSK-04]
