# Form result

`sb-form-result`, `sb-form-grid__message`, `sb-form-grid--measure` · web only

A website form whose result takes its place after sending, for a contact form or a sign-up. A form in an app view
saves through the primary action of the bottom block instead.

## States

- Sending: the submit button shows its own progress and reads „Wird gesendet …“, then for a moment the check and
  „Gesendet“.
- Result: a heading of success glyph and word („Nachricht gesendet“), one sentence on what happens now, optionally a
  summary of what was sent, and the next step as a text link („Noch eine Nachricht schreiben“).
- Missing entry: under each empty required field „<Beschriftung> fehlt.“; focus moves to the first of them.
- Failure: every field keeps its value, the button reads „Noch mal versuchen“, and the reason stands on its own line
  right before it: „Senden hat nicht geklappt. Deine Eingaben sind noch da.“ Offline: „Keine Verbindung. Deine
  Eingaben sind noch da; versuch es gleich noch einmal.“

## Behaviour

- The result replaces the form at the same place and its heading takes focus. Nothing can be sent twice.
- Server first: the form posts, and the server answers with a page that shows the result. So the result survives a
  reload, and the pattern works without scripts.
- The submit button stays enabled and lime while fields are empty; a press then sends nothing and marks the empty
  fields.
- On a page the form keeps the reading measure.

## Rules

- No primary action in the result, no toast, no tinted box. [WEB-05]
- Required is the norm and unmarked; a voluntary field ends its label in „(optional)“. [STA-03]
- The submit button is the section's primary action, last in its group. [K12, AKT-11]
- Other field errors are the server's and stand at their fields. [K21]
