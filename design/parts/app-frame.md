# App frame

`sb-app-frame` · `SbAppFrame`

The frame of an app that adapts to its width: one or two panes and the one navigation. A desktop app with sidebar
and inspector uses the window instead.

## States

- Below 840 px (dp on Android) of its own width: one pane and the bottom navigation.
- From 840: the navigation is a rail at the start edge, the app's tile above its items. One pane fills the rest, or
  two: the list at the start, the detail at the end, a hairline between.
- Nothing chosen: the end pane shows only „Nichts gewählt. Wähle einen Eintrag aus der Liste.“
- Chosen row beside its detail: 3 px `accent` start edge and title weight. The phone form shows no mark.

## Behaviour

- Each pane is a whole view: top bar, content, bottom block.
- The way back to the list is the detail's leading button in its top bar. It is not shown while the list stands
  beside the detail.
- A sub-screen on a phone hides the navigation.
- In the wide form the action zone puts its sentence at the start and its action at the end. The list pane keeps the
  phone form.
- A detail's action is an outlined action: full width on a phone, at the zone's end when wide.
- Keys go start pane, end pane, navigation; F6 walks the same way. Choosing a row never moves focus in the wide
  form.
- The app owns the phone's drill-in, the way back and the unsaved dialog.

## Rules

- One navigation only. [K18]
- Two panes are one view: at most one lime primary action. A primary action in the end pane hides the start pane's,
  but not its sentence. [K12]
- A detail has no primary action. [K12]
- The list stays a list of flat rows at every width. [K10]
