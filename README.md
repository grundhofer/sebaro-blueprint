# sebaro Blueprint

Der Gestaltungsleitfaden für alles, was sebaro baut: Apps am Handy, Websites, Web-Apps und Desktop-Programme. Er
sagt, was gilt und warum. Die Website zeigt die 31 Kernregeln auf Deutsch, was je Produktart dazukommt, und zum
Nachschlagen Bauteile und Daten.

**Ansehen:** <https://grundhofer.github.io/sebaro-blueprint/>

| Seite | Inhalt |
|---|---|
| [Start](https://grundhofer.github.io/sebaro-blueprint/) | kurz, was sebaro ist; die 31 Kernregeln aus `design/KERN.de.md`; die Seiten je Produktart; wo man nachschlägt |
| [Bauteile](https://grundhofer.github.io/sebaro-blueprint/bauteile.html) | jede Komponente mit allen Zuständen und Markup |
| [Daten](https://grundhofer.github.io/sebaro-blueprint/daten.html) | jede Datenart einmal dargestellt |

Die Adressen der früheren Seiten (Regeln, Grundlagen, Plattformen, Web, App, iOS, Desktop, Gedanken, Ausblick) zeigen
je eine kleine Seite, die sagt, wo der Inhalt jetzt steht; Suchmaschinen sollen sie nicht aufnehmen.

## Was hier liegt

| Ort | Inhalt |
|---|---|
| [design/KERN.md](design/KERN.md) | die 31 Kernregeln; auf Deutsch in [design/KERN.de.md](design/KERN.de.md), `tools/check_budget.py` hält beide gleich |
| [design/views.md](design/views.md) | die 21 Ansichtstypen |
| [design/platforms/](design/platforms/) | je Produktart eine Seite: Handy-App, Website, Web-App, Desktop-App |
| [design/parts/](design/parts/) | je Bauteil eine Seite: was es ist, wie es sich verhält, welche Regeln es trägt |
| [design/checklist.md](design/checklist.md) | Prüfliste je Bildschirm |
| [rules/rules.json](rules/rules.json) | der ganze Katalog zum Nachschlagen, jede Regel mit ihrem Grund; [rules/home.json](rules/home.json) sagt, wo jede Regel wirkt |
| [skills/sebaro/](skills/sebaro/) | der Skill für Agenten, dazu der Abschnitt für die `AGENTS.md` eines Produkts |

Claude, Codex und andere Agenten beginnen bei [AGENTS.md](AGENTS.md) (`CLAUDE.md` verweist dorthin). Wie man dieses
Repository baut, prüft und veröffentlicht, steht auf Englisch in [MAINTAINING.md](MAINTAINING.md).

## Was in der Werkstatt liegt

Womit und wie gebaut wird, liegt in der Werkstatt **sebaro Foundry**, einem privaten Repository: der Technik-Bauplan
und die Startvorlage je Produktart, die Bauteile im Code, Tokens, Schriften, Icons, Prüfungen, Veröffentlichungen und
das Entscheidungsprotokoll. `docs/sebaro/` ist die eingecheckte Kopie einer Veröffentlichung des Systems, mit der
diese Website läuft; ihr eigenes `checks/update-copy.mjs` schreibt sie, von Hand wird sie nicht geändert. Regeln
ändern sich nur in `rules/rules.json`. `tools/build.py` setzt die Kernregeln aus `design/KERN.de.md` in die Startseite
und schreibt `docs/rules.json`, `docs/llms.txt` und die Seiten an den früheren Adressen.

```sh
python3 tools/build.py              # Seitenblöcke und Ausgaben erzeugen
python3 tools/check_site.py         # Seiten, Links, keine fremden Server, nur Tokens, Regeln, Änderungsprotokoll, Lizenz
python3 tools/check_budget.py       # Budgets in Wörtern, Katalog und Kernregeln stimmig
npm ci && node tools/check_a11y.mjs # axe: hell bei 390 px, dunkel bei 1440 px
node tools/og.mjs                   # Vorschaubilder der Seiten neu rendern, danach tools/build.py
python3 -m http.server -d docs 8000 # lokal ansehen
```

## Vorschaubilder

Jede der drei Seiten hat ein Vorschaubild zum Teilen (Regel WEB-09), gerendert aus der Seitenliste `src/og/pages.json`
(die `tools/build.py` aus Überschrift und Beschreibung jeder Seite schreibt) mit dem Produkt-Kit der Kopie
(`docs/sebaro/product/render.mjs share`). `node tools/og.mjs` legt die Bilder unter `docs/og/` und die Kopfzeilen
unter `src/og/head/` ab, `tools/build.py` setzt sie in den Kopf jeder Seite. Gerendert wird auf dem eigenen Rechner;
die CI rendert nur zur Kontrolle nach und vergleicht die Kopfzeilen, nicht die Pixel (Linux zeichnet die Schrift etwas
anders als macOS). Ändert sich in `docs/sebaro/` ein Token, eine Schrift oder ein Zeichen, warnt `tools/check_site.py`
(OG); dann neu rendern.

## Versionen und Änderungsprotokoll

Blueprint und Regelkatalog haben eine gemeinsame Version. Jede neue, geänderte oder entfallene Regel steht mit ihrer
ID unter „Unveröffentlicht“ in [CHANGELOG.md](CHANGELOG.md) und bekommt ein neues Datum; sonst schlägt
`check_site.py` fehl. `python3 tools/release.py <version>` macht daraus eine Version und legt ihren Abzug in
`rules/releases/` ab; nur der letzte Abzug bleibt. Hauptversion, wenn eine Regel entfällt oder sich umkehrt;
Nebenversion für neue Regeln und Werte; Korrektur für Wortlaut und Beispiele.

## Stand

Alle Beispieldaten sind erfunden. Die CI prüft in Chromium: jede Seite hell bei 390 px und dunkel bei 1440 px, die
Startseite dazu bei 200 % Schrift. Echte Geräte, Windows, WebKit und Screenreader sind nicht geprüft.

## Lizenz

[LICENSE.md](LICENSE.md) ist dieselbe Datei wie in der Werkstatt und in `docs/sebaro/`: Icons, CSS und
Token-Dateien, Komponenten-Code, Regeln, Spezifikationen und Werkzeuge unter MIT; die Schriften sebaro Sans und
sebaro Mono unter der SIL Open Font License 1.1; der Name sebaro, Produktnamen, Wortmarke, Logo, App-Zeichen,
App-Icons und erzeugte Bilder sind vorbehalten. `check_site.py` prüft, dass beide Dateien gleich sind.
