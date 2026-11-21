# Layout blocks

`sb-stack`, `sb-cluster`, `sb-form-grid` · `Arrangement.spacedBy(tokens.spacing.…)`

Three blocks that set the space between siblings: a stack for things below each other, a cluster for a row that
wraps, a form grid for fields.

## States

- Stack: the elements of one group (field to field, title to text). Its forms: groups below each other, sections
  below each other, and one whose children keep their own width.
- Cluster: tags, meta words, a group of tools, filters beside a sort choice. A wider form sets groups side by side.
- Form grid: one column, and two as soon as the grid itself is wide enough; never three. A wide cell spans both
  columns (a textarea, a choice row with long options, a callout). The actions end the form as a group of their own.

## Behaviour

- The switch to two columns measures the grid, not the screen: the same form has one column in a narrow pane and two
  in a wide one.
- Fields fill the rows in the order they are written. The visual order is the written order everywhere.
- While the row of actions is narrow, every action takes the full width, and the primary action is the lowest line.
- Compose uses spaced arrangements in a column or a wrapping row. It has no form grid: a phone uses one column.

## Rules

- Space siblings with these, never with margins or padding on the children. [RAU-07]
- Actions come last, the primary action last of all; on Android they go into `SbScreen`. [RAU-07, AKT-11]
- In an app view the primary action stays in the bottom block, not in the form. [K12]
- Every gap is a spacing step of the scale. [K9]
