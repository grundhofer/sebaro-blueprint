# Timeline

`sb-timeline` · `SbTimelineEntry`

The history of one thing: versions, syncs, conflicts, past sessions. Use it where the time of each event is the
point; a collection of things is a list.

## States

- Plain entry: the date in grey, a grey glyph for the kind of event, the title, optionally a grey meta line.
- An event that asks for something (a conflict): the warning glyph in `warning`, and the title is the word
  („Konflikt“).
- Hover fills the entry; the focus ring stands on the whole entry.

## Behaviour

- Newest first. Dates read „Heute, 14:32“, „Gestern, 22:05“, else „17.10.2026“.
- The date stands in a fixed column before glyph and title. When the title would get less room than the date
  (large text on a phone), the date moves to a line of its own above them.
- An entry that opens its version is one target over the whole entry.
- Hairlines stand between entries, none above the first.

## Rules

- No vertical stroke that connects the entries. [DAT-15]
- Only an event that asks for an act gets the warning glyph, always with its word. [DAT-15, STA-08]
- A long history ends with the text action „Ältere zeigen“, never with endless scrolling. [DAT-15]
