# Desktop notification

No class of its own (the system draws it) · desktop only

A system notification of a desktop app, for something that happened while the app was not in view.

## Behaviour

- It is sent only while no window of the app is in front. While one is in front, the view shows the event itself:
  the row's glyph and word, the state sentence.
- It is one sentence that says what happened and where („„Umzug“ wurde auf zwei Geräten geändert.“).
- A click brings the app to the front at that place.
- The app asks for the permission at the first occasion, after a sentence of its own that says what for.
- The switch „Mitteilung, wenn das Fenster nicht vorne ist“ in „Einstellungen › Allgemein“ turns them off.
- Colours and type are the system's; the icon is the app's notification icon.

## Rules

- Never while a window of the app is in front. [DSK-13]
- No advertising, and no number without its unit. [DSK-13]
- Ask for the permission only after the app's own sentence that says what for. [DSK-13]
