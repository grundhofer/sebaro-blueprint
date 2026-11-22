# Screen checklist

Walk this for every screen in **light and dark**, at **390 px and 1440 px** (desktop apps: smallest and a wide window).
It lists what a person or agent has to look at; what the product's checks test is not repeated here.
Rule ids in brackets, „K5“ = core rule 5 of `design/KERN.md`, which wins where the catalogue differs; details in
https://github.com/grundhofer/sebaro-blueprint/blob/main/rules/rules.json.

## Before you start
- [ ] Product kind named (phone app, website, web app, desktop app); light/dark, language, „Farbton“ and ⌘K sit
      where that kind puts them (K28, section *Light or dark*; NAV-09). A brief that asks otherwise is a question for
      the owner with the rule id, not a reason to move them

## Colour and hierarchy
- [ ] Cobalt only for current place, links, focus and the selected mark; lime only for the one primary action and the
      sebaro key (K4, FAR, AKT)
- [ ] Product colour only in the sign tile, the start and at most one product area per view (overview with one
      value, detail with one value, result, empty state), never behind controls or links; the tile shows the symbol
      alone, no code, unaltered, always beside the app's name or, in a top bar, the view's title (K5, K25)
- [ ] User categories: a dot in one of the six tones next to the word, never a fill or the only cue; search hits
      and highlights: fill with an edge, the current hit with „Treffer n von m“ (FAR-12)
- [ ] Plus and minus in number apps: colour follows the sign, always with + / − and the arrow icon (FAR-14)
- [ ] Status shows glyph + word, never colour alone; „Konflikt“ always with the warning glyph (STA)
- [ ] Layers end in the 2 px ink line; no tinted card grounds, no shadows (EBE)
- [ ] Lists stay lists of flat rows with hairlines at every width, stats flat; directly labelled bars neutral (K10, DAT)
- [ ] Colour scales in classes, at most 4 sequential or 5 diverging, each step tellable from its neighbours and from
      the ground; the legend above the chart names the numbers of every class; a heatmap marks today with the cobalt
      frame („Rahmen: heute“), never like the focus ring; with three or more series the legend shows line styles
      (DAT-10, DAT-11)
- [ ] Partially done is counted („2 offen“, „3 von 5 beantwortet“), never „teils offen“ (STA-09)
- [ ] Sortable tables: the arrow and title weight only on the sorted column; a sum row at the foot under its column,
      „Summe der bekannten …“ when a value is missing, never 0; on phones the table scrolls sideways in its own
      frame, never the page, and never stacks into blocks (DAT-14)

## Actions and behaviour
- [ ] At most one primary action (two panes are one view), at the bottom of the area it acts on, verb + thing; it
      comes **last** in every action group; none without a clear next step, none on a detail view; at most one
      outlined action per area, the rest text actions; wide windows: the state sentence (the status total, once) at the
      start of the zone (K12, K13, AKT, STA)
- [ ] Busy primary action shows its own label and ink bar; no spinner over the view, no toast for the result (AKT)
- [ ] Deleting something saved asks in a dialog that says what is lost; the 45° cut only on actions that cannot be
      undone (K11, K15, AKT, FOR)
- [ ] Required fields empty: the primary action stays enabled, its press sends nothing, says „<Beschriftung> fehlt.“
      at each and moves focus to the first; disabled only while the action cannot work at all (STA-03)
- [ ] Required fields carry no mark; voluntary fields end their label with a grey „(optional)“, never an asterisk or
      a „Pflichtfeld“ legend (EIN-01)
- [ ] Toast only for a reversible result outside the primary action, with „Rückgängig“ (the one without: a copy to
      the clipboard), never for errors, never to say that nothing happened (K14, EBE-05). Removing saved data asks in
      a dialog; only an entry of an unsaved form goes with an undo toast (AKT-07, AKT-08)
- [ ] Every action that stores or sends has its data-path line „<Auslöser>. Ziel: <wohin>.“ directly under it, also
      „Sichern“ in a dialog and the primary action of a window; local data: „Bleibt auf diesem Gerät.“ (BEL-10)
- [ ] Motion only in answer to an action: new content enters from below; only a fade with reduced motion /
      „Bewegung immer reduzieren“ (BEW)
- [ ] Start of an app: the whole screen in the product colour with the white symbol, then the app; in a web app only
      on the first visit per tab; a website has none. „Über“ shows tile, name, version and the sender „Ein Werkzeug
      von“ with the key mark (K29)
- [ ] Android home-screen widget: bg with the ink line, small 2 × 1 or medium 4 × 2, the whole widget one key, text
      up to 125 %, nothing cut in its cell (MOB-11)
- [ ] Camera: „Seite aufnehmen“ as the primary action, camera and full-screen page view always dark, corners also
      without dragging, a capture confirmed by count and small picture, no flash or sound; the user's photos as they
      are, marks on them in accent on a bg seam (MOB-12, BIL-08)

## Light or dark (K28)
- [ ] Website: the labelled button „Hell oder Dunkel“ in the header, after the navigation and the language switch (NAV, WEB)
- [ ] Web app: „Wie das System“ · „Hell“ · „Dunkel“ in the „Mehr“ menu of the top bar, no button (K28)
- [ ] Phone app: „Wie das System“ · „Hell“ · „Dunkel“ in the settings, no button in the app bar (MOB-04)
- [ ] Desktop app: menu „Darstellung“ and the settings view (DSK)
- [ ] Tone „Farbton: Kühl · Warm“: websites in the footer under „Darstellung“, apps next to „Hell oder Dunkel“ (K28);
      only grounds, text and lines turn warm, cobalt, lime, status and tiles stay (FAR-15)
- [ ] Website print is always light, whatever the screen shows, and shows only the content (WEB-11, WEB-04)

## Desktop windows
- [ ] Command palette opens with ⌘K / Ctrl+K (NAV-09)
- [ ] Sidebar and inspector can be hidden (a tool and the menu „Darstellung“); content keeps ≥ 480 px (DSK-04)
- [ ] Rows 32 / 48 / 64 px for one / two / three lines with a pointer, 48 px with touch (RAU)
- [ ] „Menü“ in the narrowest and in a wide window: every level stays inside the window and none covers items of
      another; the menu closes when the window's width changes; a menu command that opens a pane leaves focus on
      „Menü“ (EBE-07, DSK-08, DSK-04)

## Navigation and links
- [ ] Current place: 3 px cobalt line + weight; app navigation with icon + word (NAV)
- [ ] Links: text-coloured word with 2 px cobalt underline; external links end in the external-link icon (LNK)

## Type and text
- [ ] sebaro Sans for UI/prose/numbers; sebaro Mono (Medium 500) only for code, IDs, versions; shortcuts as text with the
      key glyphs („⇧⌘P“) (SCH, ICO)
- [ ] Code only in the five looks (three tones, comments grey, rest ink), no bold or italic; errors and diffs not by colour alone (TXT, FAR)
- [ ] du, verb + thing, concrete sentences; U+00A0 between number and unit in every string you wrote or rewrote;
      German thousands 10.000 (TXT-04)
- [ ] Screen titles are short nouns, also the not-found and error views („Unbekannter Eintrag“); sentence headings
      only on websites (TXT-03)
- [ ] Groups of people: a neutral word („Teilnehmende“, „Mitglieder“), else both forms („Nutzerinnen und Nutzer“);
      never a sign inside the word: no star, colon, underscore, middle dot or Binnen-I (TXT-05)
- [ ] Money, ranks, „etwa“, „keine“ vs „keine Angabe“, no automatic hyphenation in running text; menu paths as
      „Einstellungen, dann Über“ (TXT-12 to TXT-16)
- [ ] Every string exists in German and English (a content site keeps one language); numbers and dates follow the
      page's language (K26, TEC-10)
- [ ] Empty states have a useful sentence; errors say what happened and what to do (TXT)

## Access
- [ ] The focus ring is visible on every control (ZUG)
- [ ] On web and desktop the main flows work by keyboard alone: open and close, Escape, focus enters and returns (K30)
- [ ] Touch targets ≥ 48 px (desktop rows 32 px with pointer) (ZUG, RAU)
- [ ] No page scrolls sideways at 390 px; text that does not fit wraps or ends in an ellipsis (K30)
- [ ] Large text once per screen (Android font scale 1.3, web 200 % zoom at desktop width): it stays usable, an
      ellipsis is fine (K30)
- [ ] Only a virtualised list cuts names and still gives the full name; elsewhere names wrap (TXT-09)

## Content and evidence
- [ ] No claim without proof; outflows stay visible; unknown = „nicht belegt“ (BEL)
- [ ] No ads: „Keine Werbe-SDKs · Keine Werbe-ID“; never „Ohne Werbung“, „werbefrei“ or „ad-free“, also not in store
      texts, on the website or in headings (BEL-01)
- [ ] Where the product shows evidence: website footnote digits are text, notes 1..n in one column with backlinks;
      apps: claim rows (BEL)
- [ ] Nothing loads from third-party servers (K27, HAL-09)
- [ ] Invented data carries the marker „Beispieldaten“ beside the title of its display (BEL-09)
- [ ] Website footer: „Impressum“, „Datenschutz“ and „Lizenzen“ always; „GitHub“ only with a public repository
      (WEB-03)
- [ ] App: „Über“ shows „Datenschutz“ and „Impressum“ (a web app links both in its footer) and leads to the licence
      list with the licence texts; the provider text is the product's own, not the starter's placeholder (TEC-09)

## Done
- [ ] The product's checks ran and passed; `CHECKS.md` holds only what no check sees and every waiver with its
      reason, not a log of the runs (TEC-06)
