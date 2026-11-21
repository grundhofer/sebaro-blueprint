# Facts closing line

`sb-facts-closing` · web only

The last line of the full form, under the claim rows: which version the facts belong to and when they were
checked. Shared rules: Evidence.

## Behaviour

- It reads „<Produkt> <Version> · Fakten geprüft am <Datum> · Nächste Prüfung fällig am <Datum>“.
- Caption in `text-muted`.
- The check summary and „Wie geprüft?“ follow it.

## Rules

- „Nächste Prüfung fällig am …“ stands only here, once per product, never in a single note.
- The dates come from the product's facts, never typed. [BEL-06]
