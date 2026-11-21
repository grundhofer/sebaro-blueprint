# About head

`sb-about-head` · `SbAboutHead`

The head of the view „Über“: which app this is and in which version.

## Behaviour

- The sign tile stands at the start. Beside it stand the name as a heading, the one-liner and a grey line
  „Version 1.4.0 vom 20.10.2026“ with the version in sebaro Mono.
- A screen reader skips the tile, because the name stands beside it.
- In a narrow place the text moves under the tile.
- The sender row follows the head, then the compact facts line and the claim rows.
- Below them „Über“ shows the legal information, „Datenschutz“ and „Impressum“ (a web app links both in its footer
  instead), and a row leads to the licence list with the licence texts.
- The side gutter belongs to the place: in a phone view the head takes the page gutter; inside a container that
  brings its own, it adds none.

## Rules

- Never centred; the head reads in the same direction as the lists and rows below it. [ZEI-13]
- Tile, name, version and sender always show. [K29]
- The tile always stands beside the visible name. [K25]
- A product ships the licence texts of what it contains. [TEC-09]
- The provider text („Impressum“) of a starter is a marked placeholder: no release until the product's own text has
  replaced it. [TEC-09]
