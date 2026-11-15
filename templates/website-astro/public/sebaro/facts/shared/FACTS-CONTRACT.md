# Product facts contract (sebaroDesign)

Status: v1.3, 2026-11-02 (1.3: optional bilingual `licence.label`, checker 1.3.0). Previous: v1.2, 2026-10-20 (1.2: PL1 relaxed by D90, a server may name its operator and its country or `jurisdiction`
without a city; 1.1: optional `check.limit`, note data `--notes` §8.6 with the date rule; checker 1.2.0; changelog §13). Normative for every `facts.json` of a sebaro app or site and for every
design-system draft that shows product facts. Machine-readable twin: [`facts.schema.json`](facts.schema.json).
Checker and verifiers: [`../tools/check_facts.py`](../tools/check_facts.py). Demo files: [`facts/`](facts/).
Decisions: D14 (one facts model, every draft renders it in its own idiom, unverified values are hidden) and
D15 (four check states) in [`../DECISIONS.md`](../DECISIONS.md); background in
[`../concepts/_judging/AUSWAHL.md`](../concepts/_judging/AUSWAHL.md) §3.1–3.2.

This file says **which facts a product publishes, how each fact is backed by a check, and what every draft
must render**. It does not say what the rendering looks like: Nennwert draws a nameplate, Datenweg a data-path
plan, Doppelschnitt footnote references, Hausflagge a logbook. All four read the same file.

**Swap guarantee.** Facts are product data, not design data. Switching a product from draft A to draft B
changes the renderer, never `facts.json`, and never the CI step that verifies it.

**Three rules that override everything below**

1. **Unverified reassurance is hidden, never estimated.** "0 trackers", "no account", "never backed up",
   "Falkenstein (DE)" appear only when a passed check backs them (§8).
2. **Disclosure beats hiding.** Something that leaves the device or is collected (a path that is not
   `never`, a count above 0, an account) is always shown, verified or not; its unverified details are
   replaced by "not verified" (§8.2).
3. **A stale facts file is worse than none.** Facts for another version, or older than their own expiry,
   switch every renderer to a visible "not verified for this version" state (§8.3).

---

## 1. Quick start for agents

```sh
# from the project root (or a target repo that vendors the files, §10.6)
python3 tools/check_facts.py shared/facts/studio.json                     # schema + semantic rules, exit 1 on any error
python3 tools/check_facts.py shared/facts/*.json --json                    # machine-readable, includes the render view (§8.4)
python3 tools/check_facts.py facts.json --app-version 1.4.0                # stale if the build is another version
python3 tools/check_facts.py --list-blocklist                              # the built-in tracker-SDK list (§10.4)
python3 tools/check_facts.py shared/facts/studio.json --notes              # note data per check and per fact (§8.6)
python3 tools/check_facts.py facts.json --note tracking.analytics,tracking.adIds,tracking.cookies --note places.fsn
                                                                           # numbered notes 1, 2 of one page (§8.6)

# CI in a target repo: verify the facts against the real configuration
python3 tools/check_facts.py facts.json --ci --app-version "$VERSION" \
  --android-manifest app/build/intermediates/merged_manifests/release/AndroidManifest.xml \
  --android-res app/src/main/res --deps build/deps-release.txt             # Android
python3 tools/check_facts.py facts.json --ci --csp dist/index.html --deps package-lock.json            # website / web app
python3 tools/check_facts.py facts.json --ci --tauri src-tauri/tauri.conf.json --deps Cargo.lock --deps pnpm-lock.yaml   # Tauri

python3 -m unittest tools.tests.test_check_facts -v                        # self-tests of this tool
```

Workflow for a new product:

1. Copy the demo file of the closest kind (§11, in `shared/facts/` of the maintainers' repository) to the
   product repo as `facts.json`. Set
   `meta.demo: false`, delete `meta.notes` or rewrite it, replace **every** value. Evidence references
   starting with `demo:` are an error in a non-demo file (MD2).
2. Declare every place data can be and every path between places, including the paths that never run
   (Android backup off). Name the operator and city and country for every server; without a city (1.2, D90) name
   the operator and the country or the `jurisdiction` (§5.5).
3. List the checks that back each fact, run them, and record their state honestly: passed, open, skipped
   with reason, failed with reason (§7). Link each fact to its checks in `proof.checks`.
4. Run `check_facts.py` until it says `PASS`; add the verifier flags in CI (§10) with `--ci`.
5. Render it with the chosen draft (§8). Test the hidden, disclosure and stale states, not only the happy path.

---

## 2. Files and lifecycle

| Item | Rule |
|---|---|
| Location in a product repo | `facts.json` at the repo root, or next to the app module. Android bundles a copy as an asset (e.g. `app/src/main/assets/facts.json`); web builds import it or serve it; Tauri bundles it with the UI |
| Demo files | `shared/facts/<product-id>.json`, all `meta.demo: true`, reference content only (§11) |
| Encoding | UTF-8 JSON, 2-space indent recommended; optional `"$schema": "../facts.schema.json"` |
| Language | keys, ids and enum values English; display texts in `meta.lang` (German for DACH products) or as `{"de": …, "en": …}` objects (§5.1) |
| Who edits it | a human, at release time. CI never writes it; CI runs `check_facts.py` against it and fails the build when reality disagrees |
| When it expires | `product.version` ≠ the running version, or `freshness.checkedOn + maxAgeDays` is past (§8.3) |

---

## 3. Data model at a glance

```
facts.json
├─ identity           product · publisher                      (always shown, no proof)
├─ claims with proof  licence · source · tracking.{trackers, analytics, adIds, cookies}
│                     accounts · backup.android · permissions · dependencies
├─ places   (nodes)   device · user-destination · server · third-party      — a remote place carries a proof
├─ paths    (edges)   from place → to place, data[], trigger automatic | on-user-command | never,
│                     transport, retention                                   — every path carries a proof
├─ checks             the check list in execution order, state passed | open | skipped | failed
└─ freshness          checkedOn + maxAgeDays
```

A **proof** (`{"status": "verified" | "unverified", "checks": [check ids]}`) connects a claim to the checks
that back it. A **check** says what was checked, how, with what evidence, when, and with what result.
Renderers never look at the checks to decide visibility; they read `proof.status`. The checker guarantees
that `verified` is only written when every referenced check passed (PR2, PR3).

---

## 4. Top-level structure

| Key | Required | Content |
|---|---|---|
| `schemaVersion` | yes | `"1.0"`, `"1.1"`, `"1.2"` or `"1.3"` (§13); a file that uses a newer field or rule declares that version (SC3) |
| `meta` | yes | `demo` (boolean), `lang` (default language), `notes` (required when demo: what is invented) |
| `product` | yes | `id`, `name`, `kind`, `platforms`, `version`; optional `build`, `appId`, `url`, `tagline` |
| `publisher` | yes | `name`, `country`; optional `brand`, `email`, `url` |
| `licence` | yes | `spdx`, optional `label` (de and en, §5.4), `content` (licence of texts/media), `url`, `proof` |
| `source` | yes | `open`, `url` (when open) or `reason` (when closed), `proof` |
| `freshness` | yes | `checkedOn` (YYYY-MM-DD), `maxAgeDays` (1–366) |
| `tracking` | yes | counters `trackers`, `analytics`, `adIds`; `cookies` required for websites and web apps |
| `accounts` | yes | `mode` none / optional / required, `purpose` unless none, `proof` |
| `places` | yes, ≥ 1 | §5.5 |
| `paths` | yes (may be empty) | §5.6 |
| `backup` | Android: yes | `backup.android` §5.7 |
| `permissions` | yes | `items[]` (`name`, `purpose`, optional `when`) + `proof`; empty list = no permission |
| `dependencies` | yes | `items[]` (dependencies of note: storage, crypto, network, crash reporting, push), optional `blocklistExceptions[]`, `proof` |
| `checks` | yes, ≥ 1 | §7 |

Unknown keys are errors everywhere (the checker suggests the closest valid name, e.g.
`unknown property 'tracker' (did you mean 'trackers'?)`).

---

## 5. Field reference

### 5.1 Texts

Any display text is either a string in `meta.lang` or an object of language tags:
`{"de": "Als CSV exportieren", "en": "Export as CSV"}`. An object must contain `meta.lang` (LG1);
renderers take the requested language and fall back to `meta.lang`. Commands in `check.how` may stay plain
strings.

### 5.2 Product and publisher

| Field | Rule |
|---|---|
| `product.id` | kebab-case; equals the product key of the palette accents and REFERENCE-CONTENT (`studio`, …) |
| `product.kind` | `android-app` · `web-app` · `website` · `desktop-app` · `cli` |
| `product.platforms` | `android` · `web` · `macos` · `windows` · `linux` · `ios` (the platform tag on app cards) |
| `product.version` | the version these facts were verified for; websites use the deploy version (`2026.10.10`) |
| `product.build` | optional; git short hash or versionCode; compared like the version when both sides know it |
| `product.appId` | Android applicationId or Tauri identifier; permissions that start with it count as app-internal (§10.1) |
| `product.url` | `https://…`; for websites and web apps the CSP verifier treats its host as `'self'` (CS6) |
| `publisher.country` | ISO 3166-1 alpha-2 |

### 5.3 Tracking counters

Each counter is `{count, items[], note?, proof}`.

| Counter | Counts |
|---|---|
| `trackers` | third-party tracking or advertising SDKs and scripts (Exodus sense: Firebase Analytics, Crashlytics, AdMob, Facebook SDK …) |
| `analytics` | usage analytics of any kind, first- or third-party, cookieless or not (Matomo, Plausible, PostHog …) |
| `adIds` | advertising identifiers the product reads (Android `AD_ID`, IDFA) |
| `cookies` | cookies the product sets (any purpose). Browser storage that is not a cookie is declared as `place.stores` |

Rules: `count` equals `len(items)` (TR2). **A 0 is a claim**: it needs at least one check in
`proof.checks` (TR1), and it is shown only when verified (§8). Crash reporting (Sentry, Bugsnag) is not a
tracker by default; it is a declared path to a third party (§10.4, DP3).

### 5.4 Accounts, licence, source

`accounts.mode`: `none` · `optional` · `required`; anything but `none` needs `purpose` (AC1). `licence.spdx`
is an SPDX id or simple expression (`AGPL-3.0-only OR LicenseRef-beispiel-commercial`). `source.open: true`
needs `url`, `false` needs `reason` (PD2).

From 1.3, optional `licence.label` is a language object with **both `de` and `en` required**, each a non-empty,
non-whitespace sentence (at most 400 characters); further language tags may be added. When present, render the
localized label **instead of the complete „Lizenz: <spdx>“ / „Licence: <spdx>“ line**, with no licence prefix.
For example: `{"de": "Alle Rechte vorbehalten.", "en": "All rights reserved."}`. Keep `licence.spdx` in the data
(e.g. `LicenseRef-app-proprietary`). Without the label, preserve the existing SPDX wording, including optional
content-licence text. A label replaces that whole display value; proof, hidden and stale rules apply unchanged.
Use the requested language with `meta.lang` as fallback, as for other facts texts. SC3 warns on a label in a file
that declares a version older than 1.3.

### 5.5 Places (nodes)

| Kind | Meaning | Required fields | Proof |
|---|---|---|---|
| `device` | the user's own device or browser | `id`, `kind`, `label` | none |
| `user-destination` | a place the user picks at the moment of the action: save dialog, share sheet | `id`, `kind`, `label` | none |
| `server` | runs for the product: by sebaro or a processor under contract | + `operator`, `city`, `country`; 1.2 (D90): without `city`, `operator` + `country` or `jurisdiction` (PL1) | required when a path reaches it (PL7) |
| `third-party` | a service outside that contract (GIF CDN, Google backup) | + `operator`, `country` or (1.2) `jurisdiction` (PL1); `city` expected (PL2 warning) | required when a path reaches it (PL7) |

Optional: `hosts[]` (lower-case host names, `*.` prefix for subdomains; the CSP and Tauri verifiers match
against them) and `stores` (data at rest that no path brings there, typically on-device storage:
`data[]`, `how`, `atRest`, `retention`).

**Named places only.** "The cloud", "EU servers" and "our infrastructure" are not places. A place whose
label or storage text says cloud/Wolke without city and country is an error (PL3); `EU` is not a country
(PL4). Display form (normative): `label · City (CC)`, e.g. „Server · Falkenstein (DE)“; a place without a city
shows `label · (CC)`; a place named by its jurisdiction shows `label · Rechtsraum EU` / `label · EU jurisdiction`.

**Server location without a city (1.2, D90).** The owner relaxed PL1 on 2026-10-20: a server may be named without
a city when its operator and its legal area are named. The legal area is the `country`, or `jurisdiction` when the
operator only promises a region (`EU` or `EEA`, e.g. a provider's "EU jurisdiction" for stored objects). A `city`
still needs its `country`; `jurisdiction` is not a country code and `EU` stays an error as `country` (PL4). PL3
accepts the same forms (city and country; operator and jurisdiction; for a server operator and country), so a
provider whose name contains "cloud" can be a server named this way. A third party with a country but no city still
gets PL2 and, with cloud wording, PL3, as in 1.1. Renderers show the location by the display form above; a hidden
or stale place hides it like a city (§8.1).

### 5.6 Paths (edges)

| Field | Rule |
|---|---|
| `from`, `to` | ids of declared places, different from each other (PA1, PA6). Every path ends at a named place |
| `data[]` | data categories (§6.1) |
| `trigger` | `automatic` · `on-user-command` · `never`. `never` is a declared non-movement, rendered as a negative statement ("no backup to Google") |
| `action` | label of the UI action that starts the path; required for `on-user-command` (PA2); renderers attach the per-action hint to that action (§8.5 d) |
| `transport` | `tls` · `end-to-end` · `none` · `local` (no network); required unless `never` (PA3); `local` cannot reach a remote place, `none` to a remote place is a warning that renderers must state (PA4) |
| `retention` | how long the destination keeps what this path carries (§6.4); required unless `never` (PA3) |
| `purpose` | optional text |
| `proof` | required |

### 5.7 Android backup (`backup.android`)

| Field | Rule |
|---|---|
| `allowBackup` | the effective `android:allowBackup`; Android's default is **true** |
| `cloudPath` | id of the path to the Google backup place (a remote place). Its trigger states whether Auto Backup runs: `never` or `automatic` (BK1) |
| `deviceTransfer` | `possible` or `excluded`. On Android 12+, `allowBackup="false"` does not reliably stop device-to-device transfer ("varies by manufacturer", Android docs, fetched 2026-10-11); claim `excluded` only with rules that exclude it |
| `dataExtractionRules`, `fullBackupContent` | `@xml/<name>` as in the manifest; required when `allowBackup` is true but the cloud path is `never` (BK2) |

### 5.8 Permissions and dependencies

`permissions.items[]`: `name` as the platform writes it (`android.permission.POST_NOTIFICATIONS`, a Tauri or
macOS capability), `purpose`, optional `when` (`install` · `runtime` · `special`). An empty list means "no
permission" and needs a proof like any reassurance.

`dependencies.items[]`: dependencies of note, `name` as the ecosystem writes it (`io.sentry:sentry-android`,
`@sentry/browser`, `sentry`), `purpose`, optional `version`, `licence`, `dataPath` (the path the dependency
sends data along; required for blocklist entries marked declare-path, DP3). `blocklistExceptions[]`
(`package`, `reason` ≥ 10 characters) accept a blocklist hit; it stays visible as a warning (DP4).

---

## 6. Vocabularies and display labels

Renderers use these labels (or their own wording of the same meaning, in the draft's voice). The enum value
is the contract; the label is a default.

### 6.1 Data categories

| Value | de | en |
|---|---|---|
| `content` | deine Inhalte | your content |
| `settings` | Einstellungen | settings |
| `account` | Kontodaten | account data |
| `ip-address` | IP-Adresse | IP address |
| `device-info` | Geräte- und Browserangaben | device and browser details |
| `usage` | Nutzungsdaten | usage data |
| `crash-report` | Absturzberichte | crash reports |
| `contact` | Kontaktdaten | contact details |
| `search-terms` | Suchbegriffe | search terms |

### 6.2 Triggers

| Value | de | en |
|---|---|---|
| `automatic` | automatisch | automatically |
| `on-user-command` | nur auf deinen Befehl | only when you ask |
| `never` | nie | never |

### 6.3 Check states (D15)

| Value | de | en | Required with it |
|---|---|---|---|
| `passed` | bestanden | passed | evidence (CK3) |
| `open` | offen | open | — |
| `skipped` | übersprungen | skipped | reason (CK1) |
| `failed` | nicht bestanden | failed | reason + evidence (CK2, CK3) |

### 6.4 Retention, transport, storage, accounts

| Field | Values (de / en) |
|---|---|
| `retention.policy` | `none` nicht gespeichert / not stored · `session` bis zum Schließen / until closed · `days` N Tage / N days (`days` required) · `until-deleted` bis du es löschst / until you delete it · `user-controlled` liegt bei dir / yours to keep · `processor-terms` nach den Bedingungen von … / under …'s terms (`note` required, PA5) |
| `transport` | `tls` verschlüsselt (TLS) / encrypted (TLS) · `end-to-end` Ende-zu-Ende / end-to-end · `none` unverschlüsselt / unencrypted · `local` ohne Netz / no network |
| `stores.atRest` | `end-to-end` Ende-zu-Ende · `app-encrypted` von der App verschlüsselt · `storage-encrypted` durch Geräte-/Datenträgerverschlüsselung · `plain` unverschlüsselt |
| `accounts.mode` | `none` kein Konto / no account · `optional` Konto freiwillig / account optional · `required` Konto nötig / account required |

### 6.5 Fixed state words (not draft-specific)

Unlike the labels above, these words are the same in every draft, so a user who knows one sebaro product reads
the facts of the next one without learning new terms. `tools/check_demo.py` checks them on `demo/facts.html`
(`shared/reference-strings/facts.txt`). The check-state words of §6.3 are fixed in the same way.

| Meaning (§8.1, §8.3, §8.5) | de | en |
|---|---|---|
| hidden fact, unverified disclosure | nicht belegt | not verified |
| unverified remote place | Ort nicht belegt | location not verified |
| compact-form cell when n values are hidden | n nicht belegt | n not verified |
| stale notice | Nicht für diese Version geprüft (geprüft für 1.3.0 am 01.09.2026) | Not verified for this version (verified for 1.3.0 on 2026-09-01) |
| on-device data at an action | Bleibt auf diesem Gerät. | Stays on this device. |
| demo marker | Beispieldaten | Demo data |

---

## 7. Checks (D15)

Each check: `id`, `title`, `what` (what was checked), `how` (command, tool or manual procedure), `state`,
`date` (when it ran; for `open`, when it was registered), and as required by the state `reason` and
`evidence[]` (`kind`: `ci-run` · `log` · `file` · `url` · `commit` · `manual-note`, `ref`, optional
`sha256`). Optional: `verifier` (which `check_facts.py` verifier performs it), `version` and `build` (what it
ran against), `by` (`ci` or a role), `limit` (1.1: what the check does not cover; notes show it as
„Nicht geprüft: …“, §8.6).

- **Order is execution order.** Renderers keep it.
- **Nothing is removed.** Skipped and failed checks stay in the list with their reason; a failed check is a
  warning in the checker (CK6) and visible in every rendering.
- **A check for another version is stale** (CK4): re-run it or set it to `open`.
- **A check that names a verifier must agree with it** (CK7): if the verifier runs and fails, a `passed`
  check is an error. With `--ci`, every `passed` check that names a verifier must have that verifier run in
  the same invocation (CI1), so CI cannot silently drop a verification.

---

## 8. Rendering: visibility, staleness and what every draft must show

### 8.1 Visibility of a fact

For every proof-carrying fact (licence, source, each tracking counter, accounts, each remote place, each
path, backup, permissions, dependencies):

```
if stale(facts)                    -> state "stale"                  (§8.3)
elif proof.status == "verified"    -> state "shown"                  value shown
elif is_disclosure(fact)           -> state "unverified-disclosure"  value shown + "not verified" marker
else                               -> state "hidden"                 value NOT shown; "— not verified" in its place
```

Identity (product name, version, publisher) is always shown. Device and user-destination places have no
proof and are shown unless stale. A path is drawn with its destination's state: an unverified server shows
its label with "location not verified" instead of its location (city and country, or country or jurisdiction).

### 8.2 Disclosure versus reassurance

| Fact | Disclosure (shown even when unverified) | Reassurance (hidden when unverified) |
|---|---|---|
| tracking counter | `count > 0` | `count == 0` |
| accounts | `optional`, `required` | `none` |
| path | trigger `automatic`, `on-user-command` | trigger `never` |
| remote place | — | city, country, jurisdiction, operator (location is always a reassurance) |
| backup.android | cloud path not `never` | cloud path `never` |
| permissions, dependencies | non-empty list | empty list |
| source | `open: false` | `open: true` |
| licence | — | always a reassurance |

Reason: hiding an unverified outflow would make an app look more private than it is. The owner's rule
"unverified = hidden, never estimated" is about values that reassure; anything that tells the user data
leaves or is collected must never disappear because nobody has verified it yet.

### 8.3 Staleness

- **R1 version rule (every renderer).** Running version ≠ `product.version`, or both builds known and
  different → stale.
- **R2 age rule (renderers of products with at least one non-never path to a server or third party).**
  Today > `freshness.checkedOn + maxAgeDays` → stale. Remote facts (hosting place, retention) can change
  without a release; a local-only app binary does not change, so R2 does not apply to it at run time.
- **CI** applies the age rule to every product (FR1, an error; a warning for demo files) and the version
  rule through `--app-version` / `--app-build` (FR4).
- **Stale state:** every proof-backed value is withheld; identity and the check list stay; a visible notice
  replaces the facts: „Nicht für diese Version geprüft (geprüft für 1.3.0 am 01.09.2026)“ / "Not verified
  for this version (verified for 1.3.0 on 2026-09-01)".

### 8.4 The render view (`--json`)

`check_facts.py --json` emits `view` per file, computed for `--today`, `--app-version` and `--app-build`:
`demo`, `stale`, `staleReasons[]`, `network` and `userDestinations` (`none` · `on-user-command` ·
`automatic`: the strongest trigger of any path to a remote place resp. a user destination), `countries`
(verified remote places reached), `countriesUnverified`, `outsideEEA` (EU 27 + IS, LI, NO; derived, never a
pass/fail criterion), `fields[]` (`where` JSON path + state from §8.1), `checks` (count per state). Build-time
renderers may use the view; run-time renderers apply §8.1–8.3 themselves (the logic is the pseudocode above).
Footnote and claim-row renderers read the note data of `--notes` (§8.6) instead of assembling note text.

### 8.5 How each draft renders facts (requirements, not designs)

Every draft (Nennwert, Datenweg, Doppelschnitt, Hausflagge, and any later one) must provide all of the
following on Android (Compose) and web (CSS/HTML), fed only from `facts.json`, never from literals:

| # | Form | Must contain | Typical home |
|---|---|---|---|
| a | **Compact form**: one line or one badge row | the shown tracking counters, accounts, network level, countries (`City (CC)` where verified); when ≥ 1 compact value is hidden, one extra cell "n not verified" that links to the full form; the demo marker when `meta.demo` | app card, footer, store graphic, OG image |
| b | **Full form**: about/settings page | every fact of §4 in a fixed order the draft documents; places with display form §5.5; every path with data, trigger, transport, retention; hidden facts as label + "— not verified"; product version and `freshness.checkedOn` | about screen, Einstellungen › Daten, Datenschutz page |
| c | **Check list** | every check in execution order with title, state word, date, reason for skipped/failed, evidence link; the four states distinguishable **without colour** (shape or glyph **and** word); skipped visibly different from failed and from open | behind „Wie geprüft?“ / "How was this checked?" in the full form |
| d | **Per-action hint** | under every UI action named in a path's `action`, and once per screen where an automatic path to a remote place starts: destination (display form, or label + "location not verified"), trigger, and for on-device data „Bleibt auf diesem Gerät.“ / "Stays on this device." | export button, share dialog, sync toggle, toast after the action |
| e | **Hidden / unverified / stale states** | the three non-shown states of §8.1 and the stale notice of §8.3 as designed, tested states, including the disclosure marker for unverified outflows | everywhere a fact can appear |
| f | **Demo marker** | a visible „Beispieldaten“ / "Demo data" label on every rendering of a file with `meta.demo: true` | all forms above |

Further rules: no rendering may contradict another (Nennwert's boundary mark and nameplate, Datenweg's plan
and path marker read the same paths); a draft may leave a fact out of the compact form, never out of the full
form; dates are full dates (no "3 days ago" alone); text never says "cloud" or "EU servers" in place of a
named place. How the four drafts are expected to map it (orientation only): Nennwert → nameplate (S1) +
boundary mark (S3); Datenweg → data-path plan + path marker; Doppelschnitt → Beleg footnote whose source is
the check; Hausflagge → "Bordbuch" (what stays aboard, what leaves the harbour).

### 8.6 Notes for footnotes and claim rows (`--notes`, 1.1)

`check_facts.py --notes` (implies `--json`) adds a `notes` block per file with the data a footnote renderer (web:
digit + note list) and a claim-row renderer (apps: claim, short note, the full note on tap; D40) need, so neither
assembles note text from literals and the web build and the Gradle build read the same JSON (research/12 §6.6).
`--note FACTS` (repeatable, exactly one facts file) adds the numbered notes of one page. Without `--notes` the
checker's output is the 1.0 output.

```sh
python3 tools/check_facts.py shared/facts/studio.json --notes --today 2026-10-11                 # per check and per fact
python3 tools/check_facts.py shared/facts/studio.json --today 2026-10-11 \
  --note tracking.analytics,tracking.adIds,tracking.cookies --note places.fsn                      # notes 1 and 2 of a page
```

**Fact refs.** The JSON path without `$.`, places and paths by id: `licence`, `source`,
`tracking.trackers|analytics|adIds|cookies`, `accounts`, `places.<id>`, `paths.<id>`, `backup.android`,
`permissions`, `dependencies`. The view form (`$.places[1]`) is accepted too. One `--note` is one claim: the facts its
sentence states, comma-separated („ohne Analyse-Skripte, ohne Werbe-IDs, ohne Cookies“ =
`tracking.analytics,tracking.adIds,tracking.cookies`). Notes are numbered 1..n in the order given: one numbering per
page, in the order of first appearance (research/12 §6.1).

| Key of `notes` | Content |
|---|---|
| `contract`, `lang` | `"1.1"`, `meta.lang` |
| `freshness` | `checkedOn`, `maxAgeDays`, `nextDue` |
| `stale` | as `view.stale` (§8.3) |
| `labels` | `demo` („Beispieldaten“ / "Demo data", or null), `stale` (the §8.3 notice with `product.version` and `freshness.checkedOn`; shown only when `stale`), `nextDue` |
| `checks[]` | every check in execution order: `id`, `state`, `date`, `version`, `by`, `byKind`, `verifier`, `title`, `what`, `how`, `reason`, `limit`, `limitSource` (`facts`, `verifier` or null), `evidence`, `labels` (`state`, `date`, `by`, `limit`) |
| `claims[]` | one note per proof-carrying fact, in view order (§8.4) |
| `numbered[]` | with `--note` only: one note per claim, with `n` |

**A note** has `n` (numbered notes only), `refs`, `where`, `state` (the §8.1 state; for several facts the worst:
shown < unverified-disclosure < hidden < stale), `disclosure` (true when every fact is a disclosure), `result` (the
worst state of its checks in contract order: passed < open < skipped < failed), `checks` (ids in execution order),
`checkedOn`, `forVersion`, `nextDue`, `by` (`automatic`, `manual`, `mixed` or `unknown`), `method[]` (the checks'
`what`), `reasons[]` (skipped and failed checks), `limits[]`, `proofNotes[]` (`proof.note` of the facts),
`disclosures[]` and `labels` (`state`, `checkedOn`, `forVersion`, `nextDue`, `by`, `limits[]`, `notVerified`, `demo`).
Facts texts come as `{lang: text}` objects; the tool's labels carry `de` and `en`.

**What a renderer does with it** (the rules of §8.1–8.3, unchanged): it shows a reassuring claim only when the note
`state` is `shown`, a disclosure also when it is `unverified-disclosure` (with `labels.notVerified`), and when `stale`
it shows `labels.stale` instead of any claim. Order of the note text (research/12 §6.8): result and date, method,
disclosures, limits, who checked, link to the check list („Wie geprüft?“, D24).

**Date rule** (research/12 §8 item 7 left it open):

- „geprüft am <date>“ (`checkedOn`) is the date of the checks behind the note, never `freshness.checkedOn`: the oldest
  `date` among the note's checks in the `result` state. For `open` the phrase is „offen seit“ (the date the check was
  registered), for `skipped` „übersprungen am“.
- „Nächste Prüfung fällig am <date>“ (`nextDue`) is `freshness.checkedOn + maxAgeDays`: the day the whole file must be
  checked again (FR1 in CI, R2 at run time). It is the same on every note of a file and never computed from a check
  date.
- The two dates answer different questions (when was this checked, when is the file checked again). A note may show
  08.10.2026 and 08.01.2027 although 08.10. plus 90 days is 06.01.: the file was reviewed on 10.10.2026 with that
  check in it. A check is never newer than `freshness.checkedOn` (FR3).
- German dates `DD.MM.YYYY`, English ISO `YYYY-MM-DD` (the §6.5 examples). `forVersion` is `product.version` when
  every check in the `result` state names that version; apps show it („für 1.4.0“), websites usually leave it out.

**Who checked (`by`; D40: every note names „Eigene Prüfung“).** A check's `by` `ci` means automatic („Eigene
Prüfung, automatisch“ / "Own check, automated"), any other role by hand („Eigene Prüfung, von Hand“ / "Own check, by
hand"); several kinds give „Eigene Prüfung, automatisch und von Hand“; a check without `by` gives „Eigene Prüfung“
alone (NT1 warns about passed and failed ones). Never „zertifiziert“ or „unabhängig geprüft“ (research/12 §5.5).

**Limits („Nicht geprüft: …“).** The check's own `limit` (1.1) wins. Otherwise a check that names a verifier gets
that verifier's built-in limit, what §10.5 says it cannot see:

| Verifier | Built-in limit (de; en in `check_facts.py` `VERIFIER_LIMITS`) |
|---|---|
| `android-manifest` | Verhalten der App zur Laufzeit. |
| `csp` | Daten, die der Server selbst speichert oder weitergibt. |
| `tauri` | Verbindungen, die der Rust-Code außerhalb des HTTP-Plugins öffnet. |
| `deps` | Bibliotheken, die nicht auf der Liste der <n> bekannten Tracker-, Analyse- und Werbe-ID-Bibliotheken stehen. (<n> = blocklist entries that count against a counter, computed by the tool; 22 today) |

Other checks without `limit` give no limit line; NT3 (info) lists every passed check behind a shown reassurance that
states none.

**Outflows that belong to a claim** (`disclosures[]`; research/12 §6.8 rule 6): live paths (trigger not `never`) to a
remote place, picked by the facts of the note: tracking counters, every live path to a remote place (what leaves even
without trackers, such as the server log); `places.<id>`, the live paths to that place; `accounts`, live remote paths
that carry `account` data; `dependencies`, live remote paths named by a dependency's `dataPath`; `backup.android`, its
cloud path when it runs; licence, source, permissions and paths, none. Each comes with its labels (§6.1, §6.2, §6.4);
an unverified destination reads „<label> · Ort nicht belegt“ (§8.1).

**Optional claim gate.** The same data can feed a claim gate (research/12 §6.6, `check_claims.py`, not built). Such a
gate is a tool a product repo may use, not a requirement: the owner did not choose a mandatory claim check (D40).

---

## 9. Rule table

Severity: **error** = exit 1; **warning** = reported, exit 0 (exit 1 with `--strict`); **info** = shown
with `--verbose`.

| Code | Rule | Severity |
|---|---|---|
| SC0 | facts file missing or not valid JSON | error |
| SC1 | schema violation (missing/unknown keys, wrong types, patterns); nothing else runs | error |
| SC2 | a date that matches YYYY-MM-DD but is no calendar date | error |
| SC3 | a newer field or rule in a file that declares an older version: `check.limit` (1.1) in `"1.0"`; `place.jurisdiction` or a server without a city (1.2) in `"1.0"` or `"1.1"` | warning |
| LG1 | text object without the `meta.lang` entry | error |
| MD0 | file is demo data (renderers must show the demo marker) | info |
| MD1 | demo file without `meta.notes` | error |
| MD2 | `demo:` evidence reference in a non-demo file | error |
| ID1 | duplicate id in places, paths or checks | error |
| PD1 | android-app without `backup.android`; website/web-app without `tracking.cookies` (error); android-app without platform `android` (warning) | error / warning |
| PD2 | open source without `url`, closed source without `reason` | error |
| FR1 | `checkedOn` older than `maxAgeDays` | error (warning for demo files) |
| FR2 | `checkedOn` in the future | error |
| FR3 | a check is newer than `checkedOn` | warning |
| FR4 | `--app-version` / `--app-build` differ from `product.version` / `product.build` | error |
| PL1 | remote place without operator; a city without its country; a server without city and country that names neither country nor jurisdiction (1.2, D90); a third party without country or jurisdiction | error |
| PL2 | third party reached by a path names no city | warning |
| PL3 | cloud/Wolke wording without city and country (place texts, or path texts towards such a place); 1.2: operator + jurisdiction, or for a server operator + country, also name the place | error |
| PL4 | `EU`, `EZ`, `UN`, `XX`, `ZZ` used as a country | error |
| PL5 | non-device place used by no path | warning |
| PL6 | local place with operator, city, country or hosts | warning |
| PL7 | remote place reached by a path has no proof | error |
| PA1 | path from/to an unknown place | error |
| PA2 | on-user-command path without `action` | error |
| PA3 | non-never path without `transport` or `retention` | error |
| PA4 | `local` transport to a remote place (error); unencrypted transport to a remote place (warning) | error / warning |
| PA5 | retention `days` without days, `processor-terms` without note (error); `days` with another policy (warning) | error / warning |
| PA6 | path from a place to itself | error |
| TR1 | counter 0 without any check in `proof.checks` | error |
| TR2 | counter `count` ≠ number of `items` | error |
| AC1 | accounts optional/required without purpose | error |
| BK1 | `cloudPath` unknown or not ending at a remote place | error |
| BK2 | allowBackup false but cloud path not `never`; allowBackup true, path `never`, no rules declared | error |
| DP6 | dependency `dataPath` names an unknown path | error |
| CK1 | skipped check without reason | error |
| CK2 | failed check without reason | error |
| CK3 | passed or failed check without evidence | error |
| CK4 | check `version` ≠ `product.version` | error |
| CK5 | check date in the future | error |
| CK6 | failed check (warning, stays visible); open and skipped checks (info) | warning / info |
| CK7 | check names a verifier: passed but the verifier failed now (error); not passed but the verifier passed (info) | error / info |
| CI1 | `--ci`: passed check names a verifier that was not run | error |
| PR1 | proof references an unknown check | error |
| PR2 | `verified` without checks | error |
| PR3 | `verified` but a referenced check is not passed | error |
| PR4 | `unverified` although every referenced check passed | info |
| NT1 | `--notes` only: a passed or failed check that backs a fact has no `by` (its notes cannot say automatisch / von Hand) | warning |
| NT2 | `--note` only: a fact ref that names no proof-carrying fact, or an empty note | error |
| NT3 | `--notes` only: a passed check behind a shown reassurance states no `limit` and names no verifier | info |
| AM0–AM8 | Android manifest verifier (§10.1) | see there |
| CS0–CS6 | CSP verifier (§10.2) | see there |
| TA0–TA6 | Tauri verifier (§10.3) | see there |
| DP0–DP5 | dependency verifier (§10.4) | see there |

---

## 10. Verifiers

Verifiers compare the facts with the real build configuration. Each one is a result with the D15
vocabulary (`passed` / `failed`, partial gaps as warnings) and its own findings. They need exactly one
facts file and run only when the file is schema-valid.

### 10.1 `--android-manifest <AndroidManifest.xml>` (+ `--android-res <res dir>`)

Run it against the **merged** manifest (`app/build/intermediates/merged_manifests/<variant>/…`): libraries
add permissions during the merge, and only the merged file has `uses-sdk` and `versionName`.
`tools:node="remove"` entries are honoured; permissions that start with the package or `product.appId`
(e.g. `….DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`) count as app-internal and are not compared.

| Code | Check | Severity |
|---|---|---|
| AM0 | manifest unreadable, not XML, root not `<manifest>` | error |
| AM1 | `INTERNET` present but no non-never path to a remote place; or remote paths declared without `INTERNET` | error |
| AM2 | effective `allowBackup` (absent = true) ≠ `backup.android.allowBackup`; unevaluable value (placeholder); no `backup.android` | error |
| AM3 | backup claims: facts say the cloud path is `never` while Auto Backup is on, or `deviceTransfer: excluded` → the rules must exclude every core domain (`root` or `file`+`database`+`sharedpref`, plus `external`, each `path="."`); `dataExtractionRules` (`<cloud-backup>` / `<device-transfer>`) when targetSdk ≥ 31, `fullBackupContent` when minSdk < 31 or targetSdk < 31; rules file missing → "cannot verify" error; `device_*` domains not excluded → warning | error / warning |
| AM4 | manifest requests a permission that `facts.permissions` does not list | error |
| AM5 | facts list an Android permission the manifest does not request (stale) | error |
| AM6 | `com.google.android.gms.permission.AD_ID` present but `adIds.count` is 0 (error); `adIds > 0` without it (warning) | error / warning |
| AM7 | `versionName` ≠ `product.version` (error); no versionName (info) | error / info |
| AM8 | `uses-sdk` min/target not found: worst case assumed for backup rules | warning |

Backup semantics follow https://developer.android.com/identity/data/autobackup (fetched 2026-10-11):
default `allowBackup` is true; a missing rules section means that mode is fully enabled; `<exclude>` wins
over `<include>`; `allowBackup="false"` on Android 12+ may not stop device-to-device transfer. Not
documented there and therefore **not** treated as disabling: `android:fullBackupContent="false"`.

### 10.2 `--csp <html file | headers file | policy string>` (repeatable)

Reads `<meta http-equiv="Content-Security-Policy">` from HTML, `Content-Security-Policy:` lines from a
headers file (`_headers`, nginx snippet), or a policy string. Report-only policies are ignored (warning).
Directives: every fetch directive (falls back to `default-src`), `form-action`, `report-uri` (violation
reports are a data path). Local sources (`'self'` for Tauri, `data:`, `blob:`, `ipc:`, `*.localhost`) are
not destinations. Declared destinations = `hosts` of remote places reached by a non-never path.

| Code | Check | Severity |
|---|---|---|
| CS0 | argument is neither a readable file nor a CSP string | error |
| CS1 | a host in any directive is not a declared destination | error |
| CS2 | `connect-src` allows `*` or a bare scheme, or neither `connect-src` nor `default-src` is set (error); wildcard in another directive, unclassifiable source (warning) | error / warning |
| CS3 | no enforced CSP found (error); report-only policy ignored (warning) | error / warning |
| CS4 | a known tracker/analytics host (`--list-blocklist`) while the matching counter is 0 | error |
| CS5 | a declared destination is not allowed by the CSP (stale fact or CSP too strict) | warning |
| CS6 | websites/web apps: `'self'` is used but the host of `product.url` is not a declared server host (error); `product.url` missing (warning) | error / warning |

### 10.3 `--tauri <tauri.conf.json>`

Tauri 2 (`app`/`identifier` keys; also reads `capabilities/*.json` next to the config and inline
`app.security.capabilities`) and Tauri 1 (`tauri.allowlist`).

| Code | Check | Severity |
|---|---|---|
| TA0 | config or capability file unreadable / not JSON (`.json5`, `.toml` unsupported) | error |
| TA1 | an `http:*` capability `allow` URL (v2), an allowlist scope URL (v1) or a remote window URL reaches an undeclared host | error |
| TA2 | HTTP scope allows any host (error); scope-less allowlist, unparsed capability file (warning); `http:` permission without scope (info) | error / warning / info |
| TA3 | updater endpoint host not declared (an update check is a data path) | error |
| TA4 | config `version` (v2, may point to a package.json) / `package.version` (v1) ≠ `product.version` | error |
| TA5 | `security.csp` null or absent: the webview may connect anywhere | error |
| TA6 | a declared destination is reachable neither by the CSP nor an HTTP scope | warning |

The Tauri CSP then runs through the CSP rules (CS1, CS2, CS4) with `'self'` treated as local.

### 10.4 `--deps <file>` (repeatable) and the tracker-SDK blocklist

Formats: `package-lock.json` (v1–v3; dev-only packages are flagged as warnings), `package.json`, `Cargo.lock`,
and any text (Gradle `dependencies` dump, version catalog, `yarn.lock`, `pnpm-lock.yaml`) scanned for
`group:artifact` and `name@version` tokens.

| Code | Check | Severity |
|---|---|---|
| DP0 | file unreadable | error |
| DP1 | a tracker/analytics/advertising-ID SDK is present but the matching counter is 0 | error (warning if dev-only) |
| DP2 | present and counted, but not named in the counter's `items` | warning |
| DP3 | a declare-path SDK is present without a `dependencies.items[]` entry whose `dataPath` names a non-never path | error (warning if dev-only) |
| DP4 | hit accepted through `blocklistExceptions` (stays visible) | warning |
| DP5 | no dependency coordinates found: nothing was verified | error |

**Built-in blocklist (version 1.0, INCOMPLETE).** A clean result means "none of these", not "no tracker".
It is a small list of the SDKs most often found in Android, web and Tauri apps; it is not synced with
Exodus Privacy's much larger signature list. Exact patterns: `python3 tools/check_facts.py --list-blocklist`.

| SDK | Category | Counter / requirement |
|---|---|---|
| Firebase Analytics | tracker | `trackers` |
| Firebase Crashlytics | tracker | `trackers` (tied to Google Analytics for Firebase) |
| Google Analytics | tracker | `trackers` |
| Google Mobile Ads (AdMob) | tracker | `trackers` |
| Google advertising ID | adid | `adIds` |
| AppsFlyer | tracker | `trackers` |
| Adjust | tracker | `trackers` |
| Facebook SDK | tracker | `trackers` |
| Branch | tracker | `trackers` |
| Flurry | tracker | `trackers` |
| OneSignal | tracker | `trackers` |
| Unity Ads | tracker | `trackers` |
| ironSource | tracker | `trackers` |
| Amplitude | analytics | `analytics` |
| Mixpanel | analytics | `analytics` |
| Segment | analytics | `analytics` |
| PostHog | analytics | `analytics` |
| Microsoft Clarity | analytics | `analytics` |
| Hotjar | analytics | `analytics` |
| Matomo | analytics | `analytics` (also when self-hosted) |
| Plausible | analytics | `analytics` (also when cookieless) |
| Aptabase | analytics | `analytics` |
| Sentry | declare-path | not a tracker by default; must be a declared path (`dataPath`) |
| Bugsnag | declare-path | as Sentry |
| Firebase Cloud Messaging | declare-path | push tokens go to Google: declared path |

CSP tracker hosts (CS4): google-analytics.com, analytics.google.com, googletagmanager.com, doubleclick.net,
googlesyndication.com, connect.facebook.net (tracker); hotjar.com, clarity.ms, segment.com, segment.io,
mixpanel.com, amplitude.com, plausible.io, matomo.cloud, posthog.com (analytics).

### 10.5 What the verifiers do not see

Network traffic at run time (use a Playwright/proxy check and record it as a check), code paths behind
`INTERNET` (which hosts an Android app really contacts: declare `hosts` and test them), server-side
facts (hosting place, log retention: manual checks with evidence), dynamic `<meta>` CSP inserted by
JavaScript, iOS. These belong in the check list as manual or tool-specific checks with honest states.

### 10.6 Using it in a target repo

`check_facts.py` imports the schema validator from `check_palette.py`, which imports `color.py`. Vendor
`tools/check_facts.py`, `tools/check_palette.py`, `tools/color.py` and `shared/facts.schema.json` with the
same relative layout (`tools/` next to `shared/`), or run it from a sebaroDesign checkout. Python 3.10+,
standard library only.

**In a profile copy** (export 1.35.0, systems/sebaro/CHECKS.md §132): the pack `facts` of every profile carries
these four files and this text in that layout under `facts/`, the maintainers' files byte for byte:
`facts/tools/check_facts.py`, `facts/tools/check_palette.py`, `facts/tools/color.py`,
`facts/shared/facts.schema.json` and `facts/shared/FACTS-CONTRACT.md`. A product with the pack runs
`python3 -B <copy>/facts/tools/check_facts.py facts.json --ci …` and needs nothing else (`--packs facts` adds the
pack; on the web it needs `notes`, which the updater names when it is missing). `-B`: without it Python writes
`__pycache__` into `facts/tools/`, which the copy's `checks/verify-export.mjs --strict` reports as an added file.
Links of this text into the maintainers' repository (the demo files, `DECISIONS.md`) do not resolve in a copy.

---

## 11. Demo files (`shared/facts/`)

All five are `meta.demo: true` reference data for the drafts' demos, consistent with
`REFERENCE-CONTENT.md` (W1: servers in Germany and Finland). None is a statement about a real product. Each but
`studio.json` is named by the id of a sample product of the demo; the table names them by their kind.

| File | Kind | Shows | Expected result (`--today 2026-10-11`) |
|---|---|---|---|
| `studio.json` | website | static site, server log 7 days in Falkenstein (DE), theme choice in the browser | PASS, 0 warnings |
| an Android app's file | android-app | no network, no account, CSV export on user command, Android backup off (`never` path), device transfer possible; a **skipped** and an **open** check | PASS, 0 warnings |
| a web app's file | web-app | server Helsinki (FI), automatic GIF path to a US third party whose location is unverified (hidden place, disclosed path), open check | PASS, 1 warning (PL2) |
| a desktop app's file | desktop-app | no path at all (minimal form: one place, "stays here"), skipped check | PASS, 0 warnings |
| the second website's file | website | **all four states**, a failed check that hides the licence, a skipped verifier check | PASS, 1 warning (CK6) |

Matching verifier inputs live in `tools/tests/fixtures/facts/` (README there).

The demo files stay on `"schemaVersion": "1.0"` without `limit`. Every round-1 draft copies them byte for byte
into its demo pages (`<!-- sb:inline src="../../../shared/facts/<id>.json" -->`), so any edit, even an additive
one, makes gate step 7 (`inline_assets.py --check`) fail for all four drafts until their demos are re-inlined. Notes
built from them therefore show built-in verifier limits only (§8.6); limit texts for the manual checks wait for that
re-inlining or for demo files of their own.

---

## 12. Known limitations and open questions (read before trusting a PASS)

- **Real hosting and rule PL1: decided (D90, contract 1.2).** The live site of one product runs on Cloudflare
  Durable Objects pinned to the EU *jurisdiction* (its privacy document says so), and another product's
  website is configured for Cloudflare Pages (its site configuration). Neither names a city
  or a country, so their real facts files failed PL1 under 1.1. The owner relaxed PL1 on 2026-10-20: such a
  server is named by its operator and `"jurisdiction": "EU"` (§5.5). Cloudflare Pages without a jurisdiction
  promise names neither a country nor a jurisdiction and still fails PL1. The demo files keep their invented named
  places (§11).
- **Disclosure beats hiding (§8.2)** refines the instruction "unverified = hidden": unverified outflows stay
  visible with a marker. This is an orchestrator-level design choice inside D14, not an owner decision yet.
- The blocklist is small and incomplete (§10.4); text scanning can miss coordinates written as
  `group = "…", name = "…"` and can produce false hits on `name@1` strings in unrelated text.
- The CSP verifier sees only declared policies; it treats every host in any fetch directive as a
  destination, which can be stricter than real use (a host allowed but never loaded still must be declared).
- Android: no `xml-v31` resource qualifiers, no `<include>` analysis (a rules file counts as excluding only
  through whole-domain `<exclude path=".">` entries), no manifest placeholders. Backup behaviour beyond the
  Android documentation (manufacturer differences in device transfer) cannot be verified statically.
- Tauri: `.json5`/`.toml` configs and capability files are not parsed; Rust code that opens sockets outside
  the HTTP plugin is not seen.
- The staleness age rule at run time depends on a correct device clock.
- Country codes are checked by pattern, not against the full ISO 3166 list.

---

## 13. Changing this contract

- `schemaVersion` is an `enum` of every minor version of the current major (`CONTRACT_VERSIONS_ACCEPTED` in
  `check_facts.py`; 1.2: `"1.0"`, `"1.1"`, `"1.2"`; 1.0 had a `const`), because an additive version must not invalidate files
  written against the one before. Additive, backwards-compatible changes (a new optional key, a new
  warning, a blocklist entry) → next minor; anything that can turn a passing file into a failing one (new
  required key, warning → error, stricter rule) → `2.0`, which drops the 1.x versions from the enum, with every file
  in `shared/facts/` re-checked in the same change.
- Every change updates, in one go: this file, `facts.schema.json`, `check_facts.py` (constants at the top),
  the tests and the demo files. `ContractDoc` in `tools/tests/test_check_facts.py` fails when a rule code or
  a blocklist entry the checker emits is missing here; `SchemaFile` fails when schema enums and checker
  constants drift apart.

### 1.3 (2026-11-02, checker 1.3.0)

Additive: optional `licence.label` with readable sentences in de and en replaces the displayed licence line (§5.4).
SPDX data and proof remain required. Earlier minor versions remain accepted; SC3 warns on the new field in them.

### 1.2 (2026-10-20, checker 1.2.0)

Additive: no file that passed 1.1 fails 1.2 (PL1 and PL3 only accept more). Owner decision D90 („regeln lockern:
Serverort in Belegen“).

- `schemaVersion` accepts `"1.0"`, `"1.1"` and `"1.2"`; new optional `place.jurisdiction` (`EU`, `EEA`).
- PL1: a server may omit `city` when it names `operator` and `country` or `jurisdiction`; a third party may name
  `jurisdiction` instead of `country`; a `city` without `country` stays an error for both kinds, also next to a
  `jurisdiction`. PL3 accepts operator + jurisdiction, and for a server operator + country. PL4's message points to
  `jurisdiction`. SC3 warns when a file declaring `"1.0"` or `"1.1"` uses `jurisdiction` or a server without a city.
- Display form (§5.5) and `place_display`: `label · Rechtsraum EU` / `label · EU jurisdiction` (`EWR` / `EEA`).
- The `--json` render view gains `jurisdictions` and `jurisdictionsUnverified` (empty for files without
  `jurisdiction`); `tool.contract` and `notes.contract` say `"1.2"`. The text output adds a jurisdictions part only
  when a file names one.
- Demo files unchanged (§11); generated note data (`demo/data/*.notes.json`) changes only in the tool and contract
  version lines and needs a re-run and re-inline (spec/10 §1 of the system).

### 1.1 (2026-10-15, checker 1.1.0)

Additive: no file that passed 1.0 fails 1.1. Without `--notes` the findings and the text output are unchanged; the
`--json` output differs only in `tool.version` and `tool.contract`.

- `schemaVersion` accepts `"1.0"` and `"1.1"`; new optional `check.limit` (a text, LG1 applies); SC3 warns when a file
  declaring `"1.0"` uses it (a 1.0 checker would fail it as an unknown key).
- `--notes` and `--note` (§8.6): note data per check and per fact, numbered notes per page, built-in verifier limits,
  the date rule, the outflows that belong to a claim, „Eigene Prüfung, automatisch / von Hand“ (D40). Rules NT1–NT3
  fire only in that mode.
- Demo files unchanged (§11): they are inlined byte for byte into the round-1 demos.

## Sources

- Android Auto Backup and data extraction rules: https://developer.android.com/identity/data/autobackup
  (fetched 2026-10-11; default `allowBackup`, rules syntax, device-transfer note, missing-section rule).
- Content Security Policy Level 3 (fetch directive fallback to `default-src`, first directive wins):
  https://www.w3.org/TR/CSP3/ (not re-fetched for this contract; behaviour as implemented in browsers).
- Tauri 2 configuration and capabilities: https://v2.tauri.app/reference/config/ ,
  https://v2.tauri.app/security/capabilities/ (shape cross-checked against a desktop product's
  `apps/desktop/src-tauri/`, not re-fetched).
- Concept sources: `concepts/nennwert/concept.md` (Typenschild, `nameplate.json`), `concepts/datenweg/concept.md`
  (Datenwegplan, `datapath.json`), `concepts/werkblatt/concept.md` (Schriftfeld, Prüfprotokoll,
  `werkblatt-stand.json`), `concepts/doppelschnitt/concept.md` (Beleg), `concepts/hausflagge/concept.md`.
