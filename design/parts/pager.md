# Pager

`sb-pager` · web only

The link to the next page at the end of a page, in documentation or a long text.

## States

- Rest: the label „Weiter“ small and `text-muted`, then a chevron icon and the next page's title in the strong
  weight with the link underline.
- Hover: the title turns `link`.

## Behaviour

- It is one link without a box, with a hairline on top and a generous height.
- Under page numbers it follows them.

## Rules

- It names its goal: the title of the next page, not „Weiter“ alone. [WEB-06]
- One hairline on top, no box, never lime. [NAV-08, WEB-06]
- Not in Compose yet. An app that needs one builds it beside the copy. [K3]
