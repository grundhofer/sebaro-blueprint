# Action levels

`sb-primary-action`, `sb-secondary-action`, `sb-text-action` · `SbScreen(primaryAction = …)`, `SbSecondaryAction`,
`SbTextAction`

How many actions of which weight an area may hold. Read it before you place a second button.

## Behaviour

- Several text actions in a row wrap as whole actions; an optional icon stands before the word.
- At large text whole actions move to the next line and labels wrap at spaces. The height grows; never an ellipsis,
  never a sideways scroll. The underline stays on every wrapped line.
- A sort-direction arrow stays after its sort key: it shows a state, it is not a command icon.

## Rules

- Level 1 is the lime primary action: at most one per view, at the bottom of the area it acts on. An area never
  grants an extra one. [K12]
- Level 2 is the outlined secondary action: at most one per area. Compact secondary actions and the website's theme
  button count. [K13]
- Level 3 is everything else: text actions, or an icon button where a tool acts in place. [K13]
- An area is a unit with its own task: a view's head, a bar or tool row, a section, a card, a list row, a dialog's
  actions, a window part. A nested area owns its controls; its parent counts only the rest. A wrapper, a line break
  or a spacer is no area. The view is the fallback area.
- Do not split a task to gain more outlined actions.
- Not counted: chips and segments (they choose a value), fields, the destructive action (it keeps its outline and
  cut; never demote it to hide it), the one „Abbrechen“ of a dialog, links, icon buttons and tags.
- There is no floating action button: the primary action has one fixed place at the bottom. [K12]
