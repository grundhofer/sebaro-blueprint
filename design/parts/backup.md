# Automatic backup

Android only · a settings row, its view and the restore form, built from existing parts

Backs up everything the person stored, by itself and encrypted, into a folder they chose: the way back after a
lost or broken phone, which the system's move to a new phone does not give for sensitive data.

## States

- Off: one sentence what it does, the row „Ordner“ (the system's folder choice), the backup password twice, „Wie
  oft“ („Täglich“ · „Wöchentlich“), the primary action „Sicherung einschalten“.
- On: „Letzte Sicherung“ with date and time or „Noch keine“, „Ordner“, „Passwort ändern“, „Wie oft“, a sentence
  how many files stay, the primary action „Jetzt sichern“, „Automatische Sicherung ausschalten“ as a text action.
- Changing the password: its two fields and „Passwort übernehmen“; the close key keeps the old one.
- Hint: a warning callout on top with the one step that solves it, „Ordner wählen“ or „Passwort eingeben“, and
  the status word in the settings row („Ordner fehlt“, „Passwort fehlt“, „Überfällig“).

## Behaviour

- The settings row says „Aus“, „Täglich“ or „Wöchentlich“ and opens the view.
- The key is derived once and kept sealed; no run asks for the password.
- A full disk says nothing for one night; only a backup overdue by twice its interval and a day shows the hint.
- On a new phone the backup is off. The empty core view offers „Aus Sicherung wiederherstellen“ as the secondary
  action beside its primary one: the file from the system's file choice, its password, „Wiederherstellen“; a
  wrong password stands at the field, a foreign or damaged file at the row.
- Turning it off keeps the folder's files.

## Rules

- A folder the person chose, no storage permission, no INTERNET; a key from their password, never the password
  stored; each file opens with the password alone. [TEC-15]
- Neutral file names, only the app's own older files deleted. [TEC-15]
- The hint is calm: in the row and the view, never a notification. [TEC-15]
- The restore action stays outside the empty state. [K22]
