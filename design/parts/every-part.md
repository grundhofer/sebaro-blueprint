# Every part

`sb-<block>`, `sb-<block>__<part>`, `sb-<block>--<variant>` · `Sb<Name>`

What holds for all parts. A part's own page only adds what differs.

## Names

- Names say the function, never a story. [HAL-02]
- A state lives in the platform's own state (ARIA or native on the web, semantics on Android), never in a parallel
  class; where the platform has no word for it, in `data-sb-state`. [TEC-02]

## States

- Default: `text` on `bg`, control boundaries `border-strong`, hairlines `border`. A hairline is never a control's
  only boundary. [FAR-07]
- Secondary text is `text-muted`; `text-subtle` only for large text or text nobody needs to read. [FAR-06]
- Hover: `hover-fill`, or the underline on links and text actions. Pressed: `pressed-fill`. Never a tint, shadow,
  ripple or motion. On Android your own clickable sets `indication = null` and draws `hoverFill` or `pressedFill`
  itself. [FAR-08]
- Focus: the one focus ring; a control inside a frame puts it on the frame. [K30]
- Disabled: one grey step lighter, never opacity: `text` becomes `text-muted`, `text-muted` becomes `text-subtle`,
  the boundary `border`. No fills, no lime. [K20]
- Busy (remote work over 1 s): the turning loader icon replaces the leading icon, the label stays. [K22]
- Selected or current: the `accent` edge plus a cue that is not colour (filled icon, check, title weight). Never a
  filled pill or a tint. [K17]
- On: the mark in `accent`, never lime. [K4]
- Error: a `danger` baseline, the error glyph and a message in `text`. Never red text or a red fill. [K21]

## Sizes and targets

- Every control is 48 high or has a 48 hit area. On pointer pages inline and breadcrumb links may be 24. [K30]
- In desktop windows rows are 32, 48 or 64 and tools 32; under touch all are 48. [K30]
- One radius per class: 4 for tags, inline code and the checkbox; 8 for buttons, fields, segments and chips; 12 for
  cards, callouts, code blocks, toasts and menus; 16 for dialogs and sheets. [K11]
- The pill radius only for avatar, switch, radio and the range thumb; rails, bars and rings have square ends.
  [FOR-06]

## Motion

- Motion only answers an action; nothing moves on load except the start. [K23]
- Only the three durations and three easings of the tokens; colour changes, the switch thumb and a chevron's turn
  take the shortest. [BEW-03]
- What an action opens or inserts enters from below. Closing never moves. [K23]
- Under reduced motion (the system's setting or the app's „Bewegung immer reduzieren“) new content only fades and
  the spinner stands still. [K23]
- On Android your own animation enters with `sbEnter()` and asks `sbReduceMotion()`. [BEW-03]
