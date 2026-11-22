# Own recording

Android only · `SbRecorderRow`

Records the person's own voice or sound in place. It is a row like the audio row.

## States

- Before: the title and „Noch keine Aufnahme.“, the secondary action „Aufnehmen“ with the microphone icon, and
  the app's one sentence why it needs the microphone.
- Recording: „Stopp“ as a word, the time in calm tabular digits without tenths, and the level as a grey bar. A
  screen reader hears „Aufnahme läuft.“ once, not the level and not the time.
- After: the audio row with the recording, and under it „Neu aufnehmen“ and „Löschen …“.
- Microphone refused: „Ohne Mikrofon kann die App nicht aufnehmen.“ and the way to the settings.

## Rules

- Recording is never the primary action. [BIL-06]
- The sentence why the app needs the microphone shows before the system asks. [BIL-06]
- No red dot and no blinking while it records. [BIL-06, K23]
- „Löschen …“ asks first. [K15]
