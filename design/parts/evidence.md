# Evidence

Rules shared by the evidence parts: note digit, notes list, note popover, claim list, claim row, check state,
check summary, check list, facts line, closing line, action hint, stale notice.

A claim about data, privacy or licence carries evidence: a note that says what was checked, when, by whom, and
what was not checked. Websites show a digit after the claim and the notes in a list „Belege“. Apps show claim
rows that open to their note. Showing evidence is optional; a product that shows it follows all of this.

## States

Each fact has one of four states.

- Shown: the check passed and is current. The claim is written with its result.
- Unverified outflow: data leaves, the proof is missing. The claim is still written, with „nicht belegt“.
- Hidden: a reassuring claim without proof. The claim is not written. The full form shows only the fact's label
  with „nicht belegt“; the compact line counts it („1 nicht belegt“).
- Stale: checked for another version, or the check is too old. The stale notice replaces every claim; the check
  list stays.

Sample data carries the marker „Beispieldaten“ in every form.

## Rules

- A reassuring claim appears only with a passed, current check. A disclosure (data that leaves or is collected)
  always appears. [K27, BEL-01]
- Note text is generated from the product's facts, never typed. The claim itself states exactly the value of the
  fact. [BEL-06]
- Every note names who checked („Eigene Prüfung, automatisch“, „Eigene Prüfung, von Hand“, or both) and what
  was not checked („Nicht geprüft: …“). Never „zertifiziert“, „unabhängig geprüft“ or „garantiert“. [BEL-04]
- A note reads in this order: result line with the check glyph, method, proof notes and reasons, outflows,
  limits, sender, link to the check list. All in `text`, the sender in `text-muted`; caption size, never
  smaller; no internal ids in visible text. [BEL-05]
- The three forms (compact line, full form of claim rows, check list) never contradict each other, and none
  leaves a disclosure out. [BEL-05]
- Websites use digits; apps never do. Evidence never opens in a modal sheet. [BEL-02, BEL-03]
- The result line gives the date of the checks behind its note. Apps add the version, websites leave it out.
- The fixed words are the same in every product: the four check states, „nicht belegt“, „Ort nicht belegt“,
  „Bleibt auf diesem Gerät.“, „Beispieldaten“, „Wie geprüft?“. [K20]
- Name the facts, not a vague term: „ohne Analyse-Skripte, ohne Werbe-IDs, ohne Cookies“ instead of „ohne
  Tracking“. An app without ads says „Keine Werbe-SDKs · Keine Werbe-ID“, never „Ohne Werbung“ or „werbefrei“.
  [BEL-01]
- Never ship invented sample facts in a product. [BEL-08]
