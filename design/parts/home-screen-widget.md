# Home-screen widget

Android only · `sbWidgetSmall`, `sbWidgetMedium`

Shows one thing of an app on the phone's home screen. There is nothing to edit in it.

## States

- Pressed: the ground turns `pressed-fill` like a row, without a ripple.
- Focused: the focus ring stands at the widget's edge.

## Behaviour

- The frame is the ground `bg` with the ink layer line, rounded corners and no shadow.
- Small (2 × 1): one number, its unit and one sentence („61 Tage“, „bis zum Urlaub“).
- Medium (4 × 2): a title, the next number with unit and sentence, and a list of at most three rows with name and
  value.
- The whole widget is one target and opens the app at the thing shown. Rows are no targets.
- Large text: the widget keeps its cells, and the text grows up to 125 % and stops. Above 100 % the small widget
  drops its sentence and the medium one its list. In a cell smaller than the content the rows go first, from the
  last one up, then the sentence.
- One description for screen readers names everything, also what was dropped. The app shows it all.

## Rules

- Two fixed sizes, not resizable, and no 1 × 1. [MOB-11]
- Never the system's widget surface. [MOB-11]
- No countdown ring and no state by colour alone. [MOB-11]
- No text smaller than caption. [MOB-11]
