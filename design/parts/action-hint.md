# Action hint

`sb-action-hint` · `SbActionHint`

One line under an action that sends data somewhere: what starts it and where the data goes. Shared rules:
Evidence.

## Behaviour

- The form is „<Auslöser>. Ziel: <Ziel>.“, for example „Nur auf deinen Befehl. Ziel: CSV-Datei an einem Ort deiner
  Wahl.“ or „Nur auf deinen Befehl. Ziel: Server · Helsinki (FI).“
- A place that cannot be shown reads „<Name> · Ort nicht belegt“.
- An action whose data stays in the device's own storage gets „Bleibt auf diesem Gerät.“
- Where an automatic path to a remote place starts, the hint names it once per screen.
- It stands directly under its action in caption and `text-muted`: centred under a full-width action, aligned to
  the start otherwise. Under a dialog key at the end of a row the hint ends with its key, also when it wraps.
- An action that starts in a menu row has no room for it. The row ends in „…“ („Teilen …“) and opens a dialog or
  sheet of the app; the hint stands there under the button that sends. The system's share sheet comes only after
  that button.

## Rules

- Every action with a data path carries the hint, also in a product that shows no other evidence. [K16, BEL-10]
- Without generated facts, write it by hand in the same form, and say only what can be shown. A reassuring word
  („verschlüsselt“, „anonym“) never stands in a hand-written hint. [BEL-10]
- Never in a tooltip, never as the second line of a menu row. [BEL-10]
