# Dialog

`sb-dialog` · `SbConfirmDialog`, `SbUnsavedDialog`

A modal question before a step that cannot be taken back. The same frame asks for one entry, asks about unsaved
changes or shows something. Choosing from options is a sheet.

## States

- Confirm: „Abbrechen“ first, the verb last as the outlined danger action with the 45° cut and without the trash
  icon.
- Final step that deletes nothing: the same; the text says what is no longer possible and what stays.
- Question that loses nothing: the verb is a secondary action, without danger colour or cut.
- Unsaved changes: „Abbrechen“ · „Verwerfen“ · „Sichern“, in this order also when they wrap; never „Sichern unter
  …“. [AKT-11]
- Input (web only): the title names the task, one field with its label, the submit verb as a secondary action.
- Showing: the title names the thing; only secondary actions, „Schließen“ last.

## Behaviour

- Focus starts on „Abbrechen“, in an input dialog in the field, where Enter sends.
- Escape and a press on the scrim cancel; the scrim does not while a field has changed. Focus returns to the opener,
  or to what the action created.
- A failure without a field stands as glyph and sentence above the actions; a wrong entry answers at its field.
- Sending that takes over 1 s shows the busy state on the verb; the dialog stays open and keeps the entry.
- Large text: actions that do not fit side by side each take a full row, in their order; only the body scrolls.

## Rules

- The title is the question, the text the consequence, the confirm repeats the verb and is never „OK“. No lime
  primary action inside. [EBE-03]
- A deletion's text ends „Das lässt sich nicht rückgängig machen.“ With a trash the verb is „In den Papierkorb
  legen“ and the text ends „Von dort kannst du sie zurückholen.“ [K15, AKT-08]
- Where saving has a data path, its line stands directly under „Sichern“. [K16, BEL-10]
