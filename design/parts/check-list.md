# Check list

`sb-check-list-block`, `sb-check-list` · `SbCheckList`

The list behind „Wie geprüft?“ (on a website behind „Alle Prüfungen“): every check behind a product's facts.
Shared rules: Evidence.

## Behaviour

- The heading is „Wie geprüft?“ with product and version, and „Beispieldaten“ for sample data.
- The checks stand one below the other, in the order they ran, divided by hairlines.
- Each check shows:
  - the check state as glyph and word,
  - its title,
  - date and sender in `text-muted` („geprüft am 10.10.2026 · Eigene Prüfung, automatisch“),
  - for a skipped or failed check the reason („Grund: …“),
  - the limit („Nicht geprüft: …“),
  - the evidence: a link when it is an address, otherwise as code.
- It stays a list on a phone and never becomes a table.
- When the facts are stale, the check list still shows.

## Rules

- Skipped, open and failed checks stay in the list. [K27]
- The texts come from the generated notes, never typed. [BEL-06]
