# Note popover

`sb-note-popover` · web only

Shows a note at the place where the person reads, on screens narrower than 1024. Shared rules: Evidence.

## States

- Closed, or open at the bottom edge of the screen.

## Behaviour

- A press on the note digit opens it. It shows the quoted claim in strong weight, the body of the note and
  „Schließen“ as a secondary action.
- It is not modal: the page behind it stays usable.
- Escape, a tap outside, the system's way back and „Schließen“ close it. Focus returns to the digit.
- Without the script the digit jumps to the note in the list.
- For a Markdown footnote it shows the note alone, without a quoted claim.
- It is off in print.

## Rules

- The list „Belege“ stays visible under its section; the popover is never the only place of a note. [BEL-07]
