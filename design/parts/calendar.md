# Calendar

`sb-calendar` · `SbCalendar`

A month in which the person chooses a day, with the list of that day's entries.

## States

- Today: a `border-strong` frame and title weight.
- Chosen day: the `accent` place line at its foot and title weight.
- Day with entries: a small grey dot under the number; a screen reader hears the full date and „mit Eintrag“.
- Hover and press fill the drawn day. The focus ring stands on the cell and never covers a neighbour.
- A chosen day without entries says „Nichts eingetragen.“ in the list.

## Behaviour

- The month stands on top and the chosen day's list below; side by side from 640 of the calendar's own width.
- The head shows month and year with „Voriger Monat“ and „Nächster Monat“. The month changes in place without
  motion, focus stays on the button, and the new month is announced.
- Keyboard: one day is in the tab order. Arrows move by a day or a week, Home and End to the ends of the week,
  PageUp and PageDown by a month, with Shift by a year. Enter, Space or a press chooses the day.
- Weekday heads have two letters and no period. Where the columns get too narrow at large text, every second
  head is left out.
- Day cells are 48 on phones and under touch, 40 in a window with a pointer. At large text two day numbers never
  touch; a month that no longer fits scrolls sideways in its own frame.
- Month names, day names and the first day of the week follow the language.

## Rules

- Category colours appear only in the day's list beside the word, never in the grid. [DAT-16]
- A day with entries is the dot plus its words, never colour alone. [DAT-16]
