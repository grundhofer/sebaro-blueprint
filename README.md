# sebaro Guide

Der Gestaltungsleitfaden für alles, was sebaro baut: Apps am Handy, Websites, Web-Apps und Desktop-Programme. Die
Website zeigt die 31 Kernregeln auf Deutsch, die Baupläne und Startvorlagen je Produktart und zum Nachschlagen
Bauteile und Daten.

**Ansehen:** <https://grundhofer.github.io/sebaro-guide/>

| Seite | Inhalt |
|---|---|
| [Start](https://grundhofer.github.io/sebaro-guide/) | kurz, was sebaro ist; die 31 Kernregeln aus `design/KERN.de.md`; Baupläne und Startvorlagen; wo man nachschlägt |
| [Bauteile](https://grundhofer.github.io/sebaro-guide/bauteile.html) | jede Komponente mit allen Zuständen und Markup |
| [Daten](https://grundhofer.github.io/sebaro-guide/daten.html) | jede Datenart einmal dargestellt |

Die Adressen der früheren Seiten (Regeln, Grundlagen, Plattformen, Web, App, iOS, Desktop, Gedanken, Ausblick) zeigen
je eine kleine Seite, die sagt, wo der Inhalt jetzt steht; Suchmaschinen sollen sie nicht aufnehmen. Als Beispiele
dienen die Startvorlagen unter [templates/](templates/README.md).

## Für Agenten

Claude, Codex und andere Agenten beginnen bei [AGENTS.md](AGENTS.md) (`CLAUDE.md` verweist dorthin), einem kurzen
Wegweiser. Pflichtlektüre sind die 31 Kernregeln in [design/KERN.md](design/KERN.md) und die 21 Ansichtstypen in
[design/views.md](design/views.md); dieselben Kernregeln auf Deutsch stehen in [design/KERN.de.md](design/KERN.de.md),
`tools/check_budget.py` hält beide Fassungen gleich. Der ganze Katalog steht zum Nachschlagen maschinenlesbar in
[rules/rules.json](rules/rules.json); [rules/home.json](rules/home.json) sagt, wo jede seiner Regeln heute wirkt. Für
ein neues Projekt gibt es [Vorlagen](templates/README.md), darunter einen Abschnitt zum Einfügen in die `AGENTS.md`
eines Produkts. Wie man dieses Repository baut, prüft, abgleicht und veröffentlicht, steht auf Englisch in
[MAINTAINING.md](MAINTAINING.md).

## Woher die Werte kommen

Die Quellen von sebaro (Paletten, Verträge, Generatoren, Prüfungen und das Entscheidungsprotokoll D1–D111) liegen in
der Werkstatt **sebaroDesign**, einem privaten Repository. Dieser Guide schreibt keine Farbe, Schrift und kein Icon ab:
`docs/sebaro/` ist ein geprüfter Web-Export (`tools/sync_from_design.py`), jede Datei mit Prüfsumme. Regeln ändern sich
nur in `rules/rules.json`. `tools/build.py` setzt die Kernregeln aus `design/KERN.de.md` in die Startseite und schreibt
`docs/rules.json`, `docs/llms.txt` und die Seiten an den früheren Adressen.

```sh
python3 tools/sync_from_design.py   # sebaro neu aus sebaroDesign holen
python3 tools/build.py              # Seitenblöcke und Ausgaben erzeugen
python3 tools/check_site.py         # Seiten, Links, keine fremden Server, nur Tokens, Regeln, Änderungsprotokoll, Lizenz
npm ci && node tools/check_a11y.mjs # axe in Hell und Dunkel bei 390 und 1440 px
node tools/og.mjs                   # Vorschaubilder der Seiten neu rendern (D96), danach tools/build.py
python3 -m http.server -d docs 8000 # lokal ansehen
```

## Vorschaubilder (D96)

Der Guide hält sich an seine eigene Regel WEB-09: Jede seiner drei Seiten hat ein Vorschaubild zum Teilen, gerendert aus
der Seitenliste `src/og/pages.json` (die `tools/build.py` aus Überschrift und Beschreibung jeder Seite schreibt) mit
dem Skript `docs/sebaro/brand/og/render.mjs` aus dem Export. `node tools/og.mjs` legt die Bilder unter `docs/og/` und
die Kopfzeilen unter `src/og/head/` ab, `tools/build.py` setzt sie in den Kopf jeder Seite. Gerendert wird auf dem
eigenen Rechner; die CI rendert nur zur Kontrolle nach und vergleicht die Kopfzeilen, nicht die Pixel (Linux zeichnet
die Schrift etwas anders als macOS). Ändert ein Abgleich nur ein Token, eine Schrift oder ein Zeichen, bleibt die CI
grün und `tools/check_site.py` warnt (OG); dann neu rendern.

## Versionen und Änderungsprotokoll

Guide und Regelkatalog haben eine gemeinsame Version (D88). Jede neue, geänderte oder entfallene Regel steht mit ihrer
ID unter „Unveröffentlicht“ in [CHANGELOG.md](CHANGELOG.md) und bekommt ein neues Datum; sonst schlägt
`check_site.py` fehl. `python3 tools/release.py <version>` macht daraus eine Version und legt einen Abzug in
`rules/releases/` ab. Hauptversion, wenn eine Regel entfällt oder sich umkehrt; Nebenversion für neue Regeln und
Werte; Korrektur für Wortlaut und Beispiele.

## Abgleich und Pakete (eingerichtet, läuft ab dem nächsten Stand der Werkstatt)

- **Automatischer Abgleich (D88):** Ein Ablauf in sebaroDesign exportiert jeden neuen Stand, sobald dessen Prüfungen
  grün durchgelaufen sind (seit 22.10.2026; vorher lief er neben ihnen), baut die Seiten mit den Werkzeugen dieses Repositorys und legt, wenn der Guide zurückliegt, einen Zweig `sync/<kurzer Commit>` an.
  Daraus öffnet `.github/workflows/sync-pr.yml` einen Änderungsantrag; die Prüfungen laufen mit. Nichts wird ohne
  Durchsicht übernommen, ein neuerer Abgleich schließt den älteren Antrag.
- **Von Hand einzurichten:** der Deploy-Schlüssel mit Schreibrecht auf dieses Repository als Geheimnis in sebaroDesign,
  die Liste der Produkte, die der öffentliche Guide nicht zeigen darf, als zweites Geheimnis, und hier die Einstellung
  „Allow GitHub Actions to create and approve pull requests“. Bis das steht, läuft der Abgleich nicht.
- **Private Pakete (kommt):** Bei einem Versions-Tag der Werkstatt entstehen private Pakete auf GitHub Packages:
  `@grundhofer/sebaro` (npm, Web und Tauri) und ein Maven-Artefakt für Android (Compose). Ihre Version folgt dem
  Token-Vertrag: mit Vertrag 1.10 (seit 25.10.2026) heißen sie `1.10.x`, die erste wird `1.10.0` (eine 1.9 wurde nie veröffentlicht). Ein Paket gibt
  es noch nicht; die CI der Werkstatt ist derzeit blockiert, ein eigener Rechner dafür kommt später (D95). Dieser Guide zeigt weiter seinen öffentlichen Web-Export.

## Stand

Alle Beispieldaten sind erfunden. Geprüft ist im Browser (Chromium) in Hell und Dunkel bei 390 und 1440 px und bei 200 % Schrift auf 320, 360 und 390 px; echte
Geräte, Windows, WebKit und Screenreader kommen später (D79); die CI prüft vorerst nur in Chromium (D96).

## Lizenz

[LICENSE.md](LICENSE.md) ist dieselbe Datei wie in der Werkstatt und in jedem Export (D76): Icons, CSS und
Token-Dateien, Komponenten-Code, Regeln, Spezifikationen und Werkzeuge unter MIT; die Schriften sebaro Sans und
sebaro Mono unter der SIL Open Font License 1.1; der Name sebaro, Produktnamen, Wortmarke, Logo, App-Zeichen und
App-Icons sind vorbehalten. Auch Token-Dateien, Compose- und Swift-Code und Skripte fallen unter MIT, erzeugte Bilder
bleiben vorbehalten; diese Lesart hat der Inhaber bestätigt (D92). `check_site.py` prüft, dass beide Dateien gleich sind.
