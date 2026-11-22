# Sticky group head

`sb-list-header--sticky` · `SbStickyListHeader`

The head of a group in a long list grouped by day or kind. It stays at the top while its rows scroll under it, so
the person always sees which group the rows belong to. A list that does not scroll takes the plain list header.

## States

- In its place: the grey word and the count, no line.
- Standing (rows pass under it): the same head on the ground `bg` with the ink layer line under it, because it
  now lies over content. Its height does not change.

## Behaviour

- The head is a heading and names the list of its group.
- Day groups read „Heute“, „Gestern“, then the full date („Samstag, 17. Oktober“).
- Focus or a jump to a row stops under the head, never behind it.
- Under a fixed header the head stands below that header.

## Rules

- The standing head's ground is never tinted, and the line shows only while it stands. [DAT-15]
- The count stands in the head, never as a badge elsewhere. [K23]
