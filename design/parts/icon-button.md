# Icon button

`sb-icon-button`, `sb-icon-button--compact` · `SbIconButton`, `SbBackButton`, `SbIconToggle`

A tool that acts in place and is known by its icon alone: „Zurück“, „Schließen“, „Mehr“. Whatever opens a place
shows icon plus word instead.

## States

- Rest: the icon in `text-muted`. Hover: `hover-fill` and the icon in `text`. Pressed: `pressed-fill`. Focus ring.
- Toggle on: the icon in `link`. Where the icon has a filled form, on shows the filled form, so the state does not
  rest on colour.
- Disabled: the icon in `text-subtle`, no fills; a disabled toggle loses its `link` colour too.

## Behaviour

- The target is 48 by 48. The compact form of 32 is for tools in desktop windows and is 48 again under touch.
- A toggle's name names the thing („Licht“), not the act; the state says on or off.
- A disabled button that must stay reachable by keyboard stays focusable.

## Rules

- Every icon button has a name, a German verb or noun. [K30]
- Only tools that act in place may be icon-only. [K17]
- A filled icon only for the on-state. [K25]
- Prefer an enabled button that explains over a disabled one.
