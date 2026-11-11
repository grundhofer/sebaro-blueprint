# What a part needs from you

Most parts of the sebaro copy keep their rules by themselves. The parts below leave one choice to you; read the
line before you use the part. Web names are classes (`sb-…`), Android names are composables (`Sb…`). `[DAT-09]`
points to the long catalogue, as in the core rules.

## Text and colour

- **Secondary text.** Your own secondary text takes `text-muted`. `text-subtle` only from 24 px (18.66 px bold) or
  for text nobody needs to read. [FAR-06]
- **Hover and press on Android.** Your own clickable gets `indication = null` and draws `hoverFill` or
  `pressedFill` itself; the theme leaves Material's ripple on. [FAR-08]
- **Category and mark** (`sb-category--n`, `mark` · `SbCategory`, `SbMarkedText`). Category tones only for what the
  person files himself, always beside its word, never for an app state. A search says „Treffer 1 von 2“ in words.
  [FAR-12]
- **Signed number** (`sb-signed--plus/--minus` · `SbSignedNumber`). Write the sign yourself (+, U+2212, ±0), on the
  web also the arrow icon. The colour means direction, never good or bad. [FAR-14]
- **Headings and long words** (`h1`–`h3`, `sb-fit.js`, `sb-id`, `sb-file-name` · `SbWrapText`, `sbFileName`). No
  ellipsis and no `maxLines` on a heading. Soft hyphens in long compounds and no-break spaces before units are
  yours to set. Identifiers and file names get their own class or function. [SCH-06, TXT-15]
- **Motion on Android.** Your own animation takes only `tokens.motion` durations and easings; new content enters
  with `sbEnter()`; ask `sbReduceMotion()`. [BEW-03]

## Layout

- **Page on the web** (`sb-container`, `sb-section`). They need `<body class="sb-page">`. The columns of the grid
  (4, 8, 12 with a 16 or 24 px gutter) you build yourself. [RAU-02]
- **Spacing** (`sb-stack`, `sb-cluster`, `sb-form-grid` · `Arrangement.spacedBy(tokens.spacing.…)`). Space siblings
  with these, never with margins or padding on the children. Actions come last, the primary action last of all; on
  Android they go into `SbScreen`. [RAU-07]
- **Many alike cards** (`sb-card--item`). Only for a board or a collection; `aria-current` on the current card;
  only the grey „Mehr“ button shows. [FOR-05]

## Overlays and notes

- **Dialog** (`dialog.sb-dialog` · `SbConfirmDialog`). The title is the question, the text the consequence, the
  confirm repeats the verb and is never „OK“. No lime primary action inside. [EBE-03]
- **Sheet** (`dialog.sb-sheet` · `SbBottomSheet`, `SbChoiceSheet`). Only for choosing, never a form or a receipt.
  On Android pass `title`, so the head with „Schließen“ appears. [EBE-04]
- **Tooltip** (`sb-tooltip`). It only adds; it is never the one place of an information. The element needs
  `popover="manual"`. [EBE-06]
- **Menu** (`sb-menu` · `SbMenu`). Name every menu and submenu. A delete row opens the confirm dialog and never
  deletes directly. [EBE-07]
- **Callout** (`sb-callout` · `SbCallout`). Its actions are secondary or text actions, never the primary one;
  „Ausblenden“ comes last. [STA-05]
- **Tag** (`sb-tag` · `SbTag`). Never clickable, never in a status colour. A clickable #keyword is a link.
  [STA-04]

## Input

- **Segments and chips** (`sb-segmented`, `sb-chip` · `SbSegmented`, `SbChips`). Segments only for two to four
  short options; more or longer ones are chips, radio rows or a select. [EIN-04]
- **Small number and time on Android** (`SbStepper`, `SbTimeRow`). A small number is a stepper, never a number
  field. A time of day is a time row with its half-hour list. [EIN-06]

## Lists and data

- **Done rows** (`sb-list-row--done` · `SbListRow(done = true)`). Say the state as one sentence above; „Erledigt“
  stands once, in the group head. [DAT-02]
- **Status in a row on the web** (`sb-row__meta` with `sb-status`). The sign plus at most two words, never
  abbreviated. Grey informs, the warning colour asks for an act. [STA-08]
- **Long names on the web** (`data-sb-truncate`). Only on virtualised lists, and then the full name stands in the
  row's `title`. Everywhere else names wrap. [TXT-09]
- **Rating** (`sb-rating` · `SbRating`). One star icon, then „4,2 von 5 · 38 Bewertungen“ as text. Never five
  stars or half ones. [DAT-09]
- **Table** (`sb-table__sort`, `tfoot` · `SbSortableTable`). Sums stand in the foot. With a missing value the row
  is called „Summe der bekannten …“ and the cell says „keine Angabe“, never 0. On Android the app keeps the sorted
  column and direction. [DAT-14]
- **Board** (`sb-board` · `SbBoard`). Name the column in „Neue Karte in …“. Always offer moving a card without
  dragging. [DAT-13]
- **Place** (`sb-place` · `SbPlace`). The address as text with the pin and „In Karten öffnen“ comes first. The map
  is a local image or a sketch, never a map service. [DAT-17]

## Charts

- **Several series** (`sb-chart__line--n`, `sb-chart__legend` · `SbSeriesChart`). Name each series at the end of
  its line; from three series add the legend above. [DAT-10]
- **Colour scale** (`sb-scale-cell`, `sb-heatmap` · `SbHeatmap`). Fold the values into four steps, five for a scale
  with a middle. No data is its own cell. Every cell carries its value as text and every step says its range.
  [DAT-10, DAT-11]
- **Form by question** (`sb-chart__rows`, `sb-chart__diverging`, `sb-goal-ring` · `SbShareRows`, `SbHistogram`,
  `SbDeviationChart`, `SbGoalRing`). Shares of a whole: labelled rows. A distribution: a dense histogram. Deviation
  from a middle: diverging bars. A goal of up to 12 units: the ring. Never a pie. [DAT-12]

## Code

- **Code** (`sb-code`, `kbd`, `sb-tok-*`, `sb-diff` · `SbCodeBlock`, `SbCodeSpan`, `SbDiff`). Inline code only for
  machine values; keys are `kbd`. Only keywords, strings, constants and comments get a look, the rest stays plain;
  on Android the app splits the code into these. An error is the wavy underline plus its message in a line of its
  own. Every diff line carries + or − (U+2212), and a sentence gives the sum. [TXT-08, TXT-10, TXT-11]

## Media

- **Audio and video** (`sb-audio`, `sb-video` · `SbAudioRow`, `SbVideo`). Nothing loads before the press, nothing
  starts by itself, a second medium pauses the first. A video has a poster from your own server without text in it,
  a one-sentence description and captions. [BIL-06, BIL-07]
- **Photos and camera on Android** (`SbPhotoThumb`, `SbPageView`, `SbCameraFrame`). Draw the person's photo
  unchanged, no filter, no text on it. Put the screen of `SbPageView` into `SbDarkArea` yourself. The camera gets at
  most five outlines a second. [BIL-08, MOB-12]

## Website only

- **Page numbers** (`sb-pagination`). First, last, the current page and its neighbours, at most five numbers; a gap
  is an unlinked „…“. [WEB-06]
- **Questions** (`sb-faq`). An answer has at most three sentences, says „du“ and ends in a link. [WEB-07]
- **Screenshots** (`sb-shots`). Each one has an alt text, a caption and a light and a dark image. [WEB-08]
- **Licence.** Copy the folder of the copy unchanged and run its check in CI. [TEC-09]

## Not in Compose yet

A page grid, a contents list with breadcrumbs and pager, a part for running prose, and the error look in code
[RAU-02, NAV-08, TXT-06, TXT-11]. When an app needs one, it builds it beside the copy (core rule 3).
