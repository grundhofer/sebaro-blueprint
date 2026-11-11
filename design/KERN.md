# sebaro core rules

Read this before you build or change a sebaro screen. These 31 rules are the ones you have to hold in mind; the
rest is built into the parts ([parts.md](parts.md) says what a part still needs from you), the view templates
([views.md](views.md)) and the checks. `[AKT-01]` points to the
long catalogue `rules/rules.json` (reason and examples), `D<n>` to an owner decision. Look them up only when you
need the reason. Where the catalogue says something else, this file wins.

## The system

1. Use the parts and tokens of the sebaro copy in your project. No raw colours, sizes or fonts, no second design
   system. Never edit the copy. [HAL-07, TEC-01]
2. Build every screen from a view type. Fill its slots; change its fixed points only for the one view that is the
   app's reason to exist. [D145]
3. If a part is missing, build it beside the copy from tokens and existing parts and write it into the project's
   gap list. A deviation is decided for the product and recorded in the product. It moves into sebaro when a second
   product needs it.

## Colour

4. One colour, one job. Cobalt: current place, link, focus, selected mark. Lime: the one next step, and the sebaro
   brand key. Status colours: only as glyph plus word. Everything else is grey with hairlines.
   [FAR-01, FAR-03, EIN-03, D143]
5. The product colour stands in the app's sign tile, on the start screen and in at most one product area per view,
   and only on entry, overview (one value), detail with one value, result and the empty state. Never behind
   controls or links. [D143, D145; replaces ZEI-01]
6. No coloured fill behind text except the primary action. Grounds are the four greys of the tokens.
   [FAR-02, FAR-05]
7. Light and dark are equal. Every view works in both and in the tones „Kühl“ and „Warm“. [FAR-09, FAR-15]

## Type, space, shape

8. Two font families: sebaro Sans for everything, sebaro Mono for code, IDs and versions. Only the type roles of
   the tokens. Numbers use tabular figures, never mono. [SCH-01, SCH-03, SCH-04]
9. Spacing only from the scale. Layout is start-aligned, never centred. Fixed row heights, one density.
   [RAU-01, RAU-04, RAU-05]
10. Layers are separated by a 2 px ink line, never by shadow, tint or elevation. Cards only group settings or
    figures. A list stays a list of flat rows with hairlines, in every app and at every width.
    [EBE-01, EBE-02, DAT-01, FOR-02, D145]
11. No gradients, glow, textures or ornament. One radius per class (4, 8, 12, 16). The 45° cut means „final“ and
    stands only on actions that cannot be undone. [FOR-01, FOR-03, FOR-04, HAL-06]

## Actions

12. At most one lime primary action per view (a frame with two panes is one view), at the bottom of the area it
    acts on, labelled verb plus thing, last in its group. None where no clear next step exists; a detail view has
    none. [AKT-01, AKT-02, AKT-04, AKT-11, D145]
13. Three levels: lime for the next step, at most one outlined action per area, everything else a text action.
    [AKT-06, D143]
14. The primary action shows its own progress and result. No spinner over the view. A toast only for a reversible
    result, with „Rückgängig“. [AKT-05, EBE-05]
15. Deleting something saved always asks in a dialog that says what is lost. [AKT-07, AKT-08, D119]
16. Under an action that sends data somewhere, one line says where it goes. Local only: „Bleibt auf diesem Gerät.“
    [BEL-10]

## Navigation

17. The current place is a 3 px cobalt line plus a second cue (filled icon, weight). Whatever opens a place shows
    icon plus word; only tools that act in place may be icon-only. [NAV-01, NAV-02, NAV-10]
18. Phone: bottom navigation with three to five top-level places, sub-screens get „back“. From 840 dp: a rail at
    the edge and two panes, list at the start, detail at the end. The top bar never carries the primary action.
    [NAV-03, NAV-04, NAV-05, D145]
19. One link style: the word in text colour with a 2 px cobalt underline. A link that leaves the app ends in the
    external-link icon. [LNK-01, LNK-02]

## Content

20. Status is a glyph plus a word from the fixed words, never colour alone. Disabled stays readable.
    [STA-01, STA-02, STA-03]
21. Fields have a visible label above. An error is a red line, a glyph and a sentence that says what is wrong and
    what to do. [EIN-01, EIN-02, TXT-07]
22. Empty: „Noch keine <Ding>“ plus one sentence on how it fills; the action stays at the bottom. Loading: local
    work shows nothing; remote work over 1 s says „Wird geladen …“. [DAT-07, STA-06]
23. Calm: no count badges, red dots or banners. Motion only answers an action (8 px from below, at most 200 ms)
    and follows the system's reduce-motion setting. [HAL-05, BEW-01, BEW-02, BEW-04]
24. Charts and figures are grey; only the current period is cobalt. [DAT-04]
25. Icons only from the sebaro set, one function each. Arrows and chevrons are icons, not characters. Filled only
    for the current place, an on-state and status. A sign is never altered and always stands beside the app's
    name. [ICO-03, ICO-05, ICO-06, ZEI-06, ZEI-07]

## Words

26. German UI says „du“. Titles are short nouns. Numbers: U+00A0 between number and unit, „10.000“, „12,90 €“,
    „08:00–22:00“. No text built in code; every string comes from the string table, so a second language can
    follow. [TXT-01, TXT-03, TXT-04, TXT-12, TEC-10]
27. Honest: no claim without proof, concrete facts instead of slogans, failures and missing values said in words,
    sample data marked „Beispieldaten“. Nothing loads from third-party servers.
    [HAL-03, HAL-04, HAL-09, BEL-01, BEL-09, TXT-02]

## Fixed places

28. The theme choice is called „Hell oder Dunkel“, with „Farbton: Kühl · Warm“ beside it. Phone app: in settings.
    Website: a button in the header. Web app: in the „Mehr“ menu. Desktop: in the menu „Darstellung“.
    [AKT-09, D143]
29. Start: the whole screen in the product colour with the white symbol, then the app. „Über“ shows tile, name,
    version and the sender „von sebaro“. [D143, D144; replaces STR-01]

## Accessibility floor

30. This floor is enough. Do not add more where it makes normal use worse. [ZUG-01 to ZUG-04, owner 2026-11-11]
    - Contrast comes from the tokens (4.5:1 for text, 3:1 for large text and shapes).
    - Touch targets 48 dp or px. Compact 32 px rows only in desktop windows used with a pointer.
    - Every control has a name. Status never by colour alone (rule 20).
    - Focus is visible. On web and desktop the main flows work with the keyboard.
    - Text follows the system text size. Check each screen once at a large size (Android font scale 1.3, web
      200 % zoom at desktop width). It must stay usable; an ellipsis is fine.
    - On the web: headings, landmarks, the page language and alt texts.

## Done

31. A screen is done when the project's checks ran green and you looked at it in light and dark, on the phone and
    wide. Say what you could not check. [TEC-06]
