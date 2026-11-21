# Table

`sb-table`, `sb-table-wrap` · `SbSortableTable`

Values in rows and columns that are compared across.

## States

- Sorted column: its head in the title weight with an arrow icon, before the word in a number column and after it
  elsewhere. The other heads show only their word.
- A sortable head is a button: hover `hover-fill`, pressed `pressed-fill`, focus ring.

## Behaviour

- Column heads stand over a `border-strong` line, rows are divided by hairlines, row heads are strong. Numbers are
  end-aligned in tabular figures.
- In a narrow place the table scrolls sideways inside its own named, focusable box. The page never scrolls
  sideways, and rows are not stacked into blocks. [DAT-14]
- The first press on a head sorts numbers and dates descending and words ascending; the next press reverses. A cell
  without a value sorts last both ways. The result is said: „Sortiert nach Betrag, absteigend“. [DAT-14]
- The sum row stays at the bottom when the table is sorted.
- A generated table without a caption is named after the heading before it: „Tabelle unter „<Überschrift>““.

## Rules

- No zebra stripes. [DAT-05]
- Sums stand in the foot, under the same line as the head. With a missing value the row is called „Summe der
  bekannten …“ and the cell says „keine Angabe“, never 0. [DAT-14]
- On Android the app keeps the sorted column and direction. [DAT-14]
- Cells wrap. Only a virtualised table of fixed row height may cut a value with an ellipsis, with the full content
  in the cell's title. [TXT-09]
- Sort heads are 48 high, 32 only in a desktop window. [K30]
