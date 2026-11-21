# Signed number

`sb-signed`, `sb-signed--plus`, `sb-signed--minus` · `SbSignedNumber`

A number with a direction, in apps about numbers: a change, a balance.

## States

- Plus: `success`, with „+“ and the arrow up.
- Minus: `danger`, with the minus sign (U+2212) and the arrow down.
- Zero: „±0“, no arrow, `text`.

## Rules

- Write the sign yourself (+, U+2212, ±0), on the web also the arrow icon. [FAR-14]
- The colour means direction, never good or bad. The words after the number stay `text`. [FAR-14]
