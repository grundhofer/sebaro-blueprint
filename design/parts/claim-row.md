# Claim row

`sb-claims-block`, `sb-claim-rows`, `sb-claim-row` · `SbClaimRows`, `SbClaimRow`

A claim in an app or on a facts page that opens to its evidence. Together the rows are the full form, for
example under settings › privacy or in „Über“. Shared rules: Evidence.

## States

- Closed: the claim in strong weight („Keine Werbe-ID“); under it the check glyph and the result line
  („bestanden · geprüft am 10.10.2026 für 1.4.0“); a chevron at the end.
- Open: the `accent` start edge on the row, the chevron turned, and the note below: method, proof notes,
  outflows, limits, sender and „Wie geprüft?“.
- Unverified outflow: the claim is written, and the result line starts with „nicht belegt“.
- Hidden: the row shows only the fact's label („Konto“) with „nicht belegt · …“ and opens to the reasons.
- Stale: the stale notice stands in place of all rows.

## Behaviour

- The whole row is the target, at least 56 high. Hairlines divide the rows.
- The claim of a remote place starts with the pin icon.
- The block has a title, with „Beispieldaten“ for sample data.
- First comes „Auf diesem Gerät“: plain rows without a note, one per place on the device, each with „Bleibt auf
  diesem Gerät.“
- Then the claims in a fixed order: account, tracking, remote places, data paths, backup, permissions and
  libraries, licence and source.
- The block ends with the closing line, the check summary and „Wie geprüft?“.
- The note opens with a short motion, none under reduced motion.

## Rules

- A screen may show a subset of the rows. It never contradicts another form and never leaves a disclosure out.
- Never a digit in an app, a modal sheet for evidence, a coloured row ground or a hidden outflow row. [BEL-03]
- The claim states exactly the value of its fact. [BEL-06]
