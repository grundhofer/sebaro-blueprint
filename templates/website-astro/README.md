# Startvorlage: Website mit Astro

Eine kleine statische Website („Beispielseite“, erfunden) mit Astro und sebaro, jede Seite auf Deutsch und Englisch,
so gebaut, wie der [sebaro Guide](https://grundhofer.github.io/sebaro-guide/) es vorschreibt: Kopf mit Lockup, den
vier Wörtern, DE / EN und „Hell oder Dunkel“, Fußzeile mit Impressum, Datenschutz, Barrierefreiheit und „Darstellung“,
ein Artikel mit Fußnoten, eine Seite „Über“, die Pflichtseiten, eine 404-Seite und ein Vorschaubild je Seite und
Sprache.
Kopier den Ordner, ersetz Namen und Inhalte, behalte die Regeln. Die Regeln zur Technik stehen in
[`BLUEPRINT.md`](BLUEPRINT.md).

## Starten

Node 22.12 oder neuer; für das Produkt-Kit der Kopie (`npm run sebaro:verify`, `npm run sebaro:product`) Python 3.10
oder neuer.

```sh
npm ci
npx playwright install chromium   # für die Vorschaubilder und die Tests
npm run dev                        # Entwicklung: ohne Vorschaubilder, mit dem ganzen Stylesheet der Kopie
npm run check && npm run lint      # astro check; ESLint und Prettier (npm run format schreibt)
npm run build                      # Vorschaubilder, Zuschnitt, dist/, Budgets, Sprachen
npm test                           # nach npm run build: Lint der Kopie, Vitest, Playwright in Chromium
npm run preview
npm run sebaro:verify              # die Kopie ist unverändert, die Produktdateien sind aktuell
```

`npm run build` läuft in dieser Reihenfolge:

1. `scripts/site-root.mjs` kopiert Favicons und Manifest aus `sebaro-product/web/` an die Wurzel der Seite (nach
   `public/`, nicht im Repository).
2. `scripts/og.mjs` zeichnet die Vorschaubilder nach `public/og/`.
3. `astro build --mode pages` baut die Seiten einmal nach `build/pages/`, mit dem ganzen Stylesheet und dem ganzen
   Sprite.
4. `scripts/cut.mjs` schneidet Stylesheet und Icon-Sprite der Kopie auf diese Seiten zu, mit den beiden Skripten aus
   dem README der Kopie (`scripts/cut-css.mjs` mit `purgecss`, `scripts/cut-icons.mjs`; beide stehen unverändert da):
   `public/css/sebaro.cut.css` und `build/sprite.svg`.
5. `astro build` baut `dist/`: Die Seiten laden `css/sebaro.cut.css` anstelle von `tokens.css` und `css/sebaro.css`
   und tragen den zugeschnittenen Sprite.
6. `scripts/budgets.mjs` misst jede gebaute Seite und bricht über dem Budget ab: HTML 100&nbsp;KB, CSS 90&nbsp;KB
   (alle verlinkten Stylesheets zusammen), Inline-Skript der Startseite jeder Sprache 1,5&nbsp;KB, jedes andere Skript
   aus der Liste im Skript. Die zugeschnittene Datei ist nicht minifiziert (kein Bundler liest sie); die gemessenen
   Größen druckt der Build.
7. `scripts/languages.mjs` prüft die Sprachen der gebauten Seiten (Abschnitt „Sprachen“).

## Seiten

| Seite | Adresse (deutsch; englisch mit `/en` davor) | Teil in `src/components/` | Zeigt |
|---|---|---|---|
| Start | `/` | `Start.astro` | eine Hauptaktion, zuletzt in ihrer Gruppe |
| Apps | `/apps/` | `Apps.astro` | leerer Zustand „Noch keine App“ |
| Projekte | `/projekte/` | `Projects.astro` | Liste mit Schlusssatz |
| Artikel | `/projekte/liste-als-csv/` | `Article.astro` | Brotkrumen, Inhalt, Code, Hinweis, Zitat, Fußnoten mit zwei Rücksprüngen, Popover unter 1024&nbsp;px, „Weiter:“ |
| Über, Kontakt | `/ueber/`, `/kontakt/` | `About.astro`, `Contact.astro` | Person als Initialen; E-Mail als Aktion mit dem Hinweis zum Datenweg |
| Impressum, Datenschutz, Barrierefreiheit | `/impressum/`, `/datenschutz/`, `/barrierefreiheit/` | `Imprint.astro`, `Privacy.astro`, `Accessibility.astro` | Pflichtseiten des Fußes, als Beispieldaten markiert |
| 404 | `/404.html`, einmal | – (`src/pages/404.astro`) | beide Sprachen auf einer Seite: was passiert ist, was du tun kannst, „Technische Angaben“ |

Jede Adresse hat ihre Datei in `src/pages/` und in `src/pages/en/`; beide zeigen denselben Teil, jede in ihrer Sprache
(`<About lang="en" />`). Alle Wörter stehen je Sprache in `src/strings/` (`de.mjs`, `en.mjs`, dieselben Schlüssel).
Eigene Gestaltung steht nur in
`public/css/site.css` (als Datei verlinkt, nicht importiert: `astro dev` setzte sie sonst als `<style>` ein, das die Content-Security-Policy sperrt), mit dem Präfix `app-` und nur mit `var(--sb-*)`.
Logik steht als reine Funktionen in `src/lib/`, jede mit ihrem Vitest-Test daneben (heute die Adressen und Wörter je
Sprache, `src/lib/languages.mjs`, und die Seitenliste der Vorschaubilder, `src/lib/og-pages.mjs`).

## Sprachen

Jede Seite gibt es auf Deutsch und Englisch (Kernregel 26). Die Sprachen stehen in einer Liste, `LANGUAGES` in
`src/site.mjs`, Deutsch zuerst; Layout, Sprachlink, `hreflang`, Vorschaubilder und Tests lesen nur sie.

- **Adressen:** die erste Sprache an der Wurzel, jede weitere unter ihrem Kürzel mit denselben Pfaden (`/ueber/`,
  `/en/ueber/`). Die Pfade bleiben in jeder Sprache deutsch: So tauscht der Sprachlink nur das Kürzel, die Prüfung
  vergleicht Mengen ohne Tabelle der Pfade, und eine weitere Sprache kopiert den Baum, wie er ist.
- **404:** eine Seite mit allen Sprachen, weil ein statischer Host jede fehlende Adresse mit der einen `404.html`
  beantwortet (eine 404 je Sprache bräuchte Regeln des Hosts, die nicht jeder kennt). Rahmen und `h1` stehen in der
  ersten Sprache, dann ein Teil je Sprache mit `lang`; „DE / EN“ führt dort auf den Teil der Sprache.
- **Prüfungen:** `scripts/languages.mjs` bricht den Build ab, wenn eine Seite in einer Sprache fehlt oder
  `<html lang>`, die `hreflang`-Verweise, der Sprachlink oder das Vorschaubild einer Seite nicht stimmen;
  `tests/strings.spec.ts` scheitert, wenn einer Sprache ein Wort fehlt, das eine andere hat.

Eine weitere Sprache, etwa Französisch:

1. `src/strings/fr.mjs` als Übersetzung von `en.mjs`, mit denselben Schlüsseln.
2. `src/pages/fr/` als Kopie von `src/pages/en/`, in jeder Datei `lang="fr"`.
3. In `src/site.mjs` `import fr from "./strings/fr.mjs";` und der Eintrag `{ code: "fr", strings: fr }`.

Die Kopie kennt heute nur `de` und `en`: Ihr Generator der Vorschaubilder lehnt jede andere Sprache ab (`site.lang` in
`public/sebaro/brand/og/pages.schema.json`), und ihre Skripte sagen ihre Meldungen nur auf Deutsch und Englisch (eine
weitere gibt `window.sbMessages`, TEC-10; dann auch eine Zeile in `tests/keyboard.spec.ts`).

## sebaro aktualisieren

`public/sebaro/` ist die Kopie des öffentlichen Release von sebaro, Profil `website`, mit den Packs `display`, `notes`,
`facts`, `controls`, `fit` und `share-images`; nie darin ändern. Ihr `README.md` sagt, wie sie verdrahtet ist.

```sh
node public/sebaro/checks/update-copy.mjs --check           # gibt es ein neueres Release?
node public/sebaro/checks/update-copy.mjs                   # das neueste Release, gleiches Profil, gleiche Packs
node public/sebaro/checks/update-copy.mjs --packs <a>,<b>   # andere Packs: die Liste ersetzt die bisherige
npm run sebaro:verify                                       # Kopie unverändert, Produktdateien aktuell
```

Der Updater druckt, was sich für ein Produkt geändert hat (`public/sebaro/CHANGES.md`). Danach `npm run build` und
`npm test`, dann die Kopie als eigenen Commit sichern. Ändert ein Release die beiden Skripte im Abschnitt „Cut the
stylesheet to what the pages use“ des README der Kopie, übernimm sie nach `scripts/cut-css.mjs` und
`scripts/cut-icons.mjs`.

Kachel, Kopf-Tags, Favicons, Manifest und das Zeichen der Vorschaubilder gehören dem Produkt: `npm run sebaro:product`
schreibt sie mit dem Kit der Kopie aus `sebaro.product.json` nach `sebaro-product/` (Python und Playwright). Der Ordner
wird committet; `npm run sebaro:verify` prüft ihn gegen die Erklärung.

## Was die Vorlage zeigt (Regel-IDs)

- Kopf und Fuß: NAV-06, NAV-07, NAV-01, WEB-02, WEB-03, WEB-10, FAR-15, AKT-09, ZUG-06
- Laden und Sicherheit: WEB-01, HAL-09, SCH-02, TEC-01, TEC-10; strenge Content-Security-Policy ohne `'unsafe-inline'`
- Inhalt: AKT-01, AKT-04, AKT-11, DAT-01, DAT-03, DAT-05, DAT-06, DAT-07, TXT-01, TXT-03 bis TXT-08, TXT-10, TXT-17,
  STA-02, STA-05, BEL-02, BEL-07, BEL-09, BEL-10, LNK-01, LNK-02, ZUG-07 (vorläufig)
- Vorschaubild je Seite aus dem Build: WEB-09 (`scripts/og.mjs` ruft den Generator der Kopie über
  `public/sebaro/product/render.mjs share`)
- Druck immer hell: WEB-11 (`sb-print.js`); große Schrift: ZUG-09 (`sb-fit.js`)

Geprüft mit `npm test`: jede Seite in jeder Sprache hell und dunkel, bei 320, 390 und 1440&nbsp;px, bei 100&nbsp;% Schrift und auf
1440&nbsp;px auch bei echten 200&nbsp;% (kein seitliches Scrollen, kein abgeschnittener Text, axe ohne Verstoß, kein Fehler in der Konsole,
keine Verletzung der Content-Security-Policy), dazu die Wege mit der Tastatur. Eine Adresse, die es nicht gibt (auch unter `/en/`), muss mit
404 und der eigenen Seite „Diese Seite gibt es nicht“ antworten.
Jeder Fall nennt, was auf dem Bildschirm stehen muss: den HTTP-Status der Seite, den Text der einen sichtbaren
Überschrift `h1`, die Ansicht (`data-sb-view` oder ein Selektor) und genau die offenen Überlagerungen (Dialoge, Popover,
Kurzmeldungen; keine, wenn der Fall `null` sagt). Er scheitert auch an Text, den ein Bedienelement selbst abschneidet: der
gewählte Eintrag einer Auswahl, ein Platzhalter, der Wert eines schreibgeschützten Felds, oder ein Icon oder Suffix über
dem Text. Ein eingetippter Wert, der länger ist als sein einzeiliges Feld, läuft darin seitlich weiter (D110, D111 (4),
„wie in jedem Textfeld“), und ein Platzhalter, der nicht passt, darf mit dem „…“ enden, das sebaros Feld zeichnet,
solange das Feld eine eigene Beschriftung hat (D111 (3)); beides zählt als Notiz im Test, nicht als Fehler, aber ein Rahmen um das Feld darf
den Text, den es zeigt, nie abschneiden. Der Wert eines Textbereichs (`textarea`) ist kein einzeiliges Feld: Schneidet ihn der
Textbereich selbst oder ein Rahmen ab, scheitert der Test; ein Textbereich, der rollt, hält ihn. `tests/control-cuts.spec.ts`
prüft beides an zwei kleinen Seiten in `tests/fixtures/`. Nicht gemessen: Datums- und Zeitfelder (ihre Teile zeichnet
der Browser), der Platzhalter eines Textbereichs und die offene Liste einer Auswahl (zeichnet das System). Einen Schnitt, den sebaros eigenes CSS verursacht
und den die Vorlage nicht ändern darf, nennt der Fall als `controlWaivers` mit Grund; er steht bei jedem Lauf als Notiz
im Bericht und ist eine Bitte an die Werkstatt.
Heute steht dort keiner. `tests/strings.spec.ts` prüft, dass keine Seite, kein Teil und kein Layout ein Wort selbst
ins Markup schreibt und jede Sprache jedes Wort hat; `tests/dimensions.spec.ts`, dass jede Länge in `public/css/site.css` ein Token ist oder sagt, warum nicht.

Maße ohne Token in `public/css/site.css` (je mit Kommentar „no sebaro token“): der Umbruch des Artikels bei `64rem` (eine
Media Query kann kein Token lesen; in rem folgt er der Schriftgröße, bei 200&nbsp;% also erst ab 2048&nbsp;px, während
sebaro.css `sb-toc` schon bei 1024&nbsp;px umschaltet: dazwischen steht das Inhaltsverzeichnis offen über dem Text) und
die Spalte des Inhaltsverzeichnisses mit `15rem` (die 240&nbsp;px der Seitenleiste von NAV-04).

## Platzhalter

- Kachel im Kopf, Favicons, Manifest und Vorschaubilder zeigen das Zeichen der Dachmarke sebaro. Ein echtes Produkt
  braucht sein eigenes Zeichen aus der Werkstatt (ZEI-03, ZEI-08): Es trägt es in `sebaro.product.json` ein, baut
  `sebaro-product/` mit `npm run sebaro:product` neu und setzt `SITE.product` in `src/site.mjs` auf seine Kennung.
  Markendateien stehen nicht unter der Lizenz des Projekts (`sebaro-product/NOTICE.md`, `public/sebaro/LICENSE.md`).
- „GitHub“ im Fuß fehlt, weil die Beispielseite kein öffentliches Repository hat (WEB-03).
- Kein Kontaktformular: eine statische Seite hat keinen Server, der es annimmt (dann `sb-form.js`, WEB-05).

## Lücken der Vorlage (Agenten-Test 2026-10)

Eine Probeaufgabe auf dieser Vorlage (eine Vereinsseite, [`../../docs/agenten-test-2026-10.md`](../../docs/agenten-test-2026-10.md))
hat gezeigt, was ein Agent übernimmt oder übersieht. Bau es so:

- **Kopf:** die vier Wörter „Apps“, „Projekte“, „Über“, „Kontakt“ und „DE / EN“ sind fest (NAV-06, NAV-07). Passen sie
  nicht zum Inhalt (ein Verein), nenn NAV-06 und frag den Inhaber, statt eigene Wörter zu setzen oder die Sprachwahl
  zu streichen. Jede Seite gibt es auf Deutsch und Englisch (Kernregel 26); nur eine Seite mit Artikeln bleibt in
  ihrer einen Sprache und hat keine Sprachwahl.
- **„nie auf dem Server“** in der Tabelle der Datenschutzseite (`src/strings/`) ist eine beruhigende Angabe ohne
  Prüfung (BEL-01); schreib nur, was der Code zeigt.
- **„übersprungen“** für den nie gelaufenen Screenreader-Test (`src/strings/`) heißt nach ZUG-08 „offen“.
- **Gruppierte Listen** (Termine nach Monat) bekommen den mitlaufenden Gruppenkopf `sb-list-header--sticky` mit
  `sb-sticky.js` (DAT-15).
- **Vorschaubilder** zeigen die Dachmarke (`product: "studio"`), solange das Produkt kein eigenes Zeichen hat (WEB-09,
  ZEI-03); ein echtes Produkt setzt seine Kachel und seinen Namen.
- **Start mit der Kachel:** STR-01 gilt auf jeder Plattform; die Vorlage baut ihn noch nicht ein (weder
  `data-sb-start` noch `sb-start.js`). Bau ihn ein: im Web nur beim ersten Aufruf je Browser-Tab und nur bis `load`.
- **`CHECKS.md`:** TEC-06 verlangt sie, mit jedem Befehl, Datum und Exit-Code.
- **Port 4321:** `npm test` nutzt einen Server, der dort schon läuft (`reuseExistingServer` außerhalb der CI). Beende
  zuerst jeden anderen Server auf dem Port und starte mit `CI=1`: dann bricht ein belegter Port den Lauf laut ab,
  statt eine fremde App zu prüfen.
- **Kein `deploy`-Workflow:** Den Host wählt das Produkt. Es ergänzt `.github/workflows/deploy.yml` (main: `dist/` auf
  den statischen Host, je Pull Request eine Vorschau-Adresse) und sendet die Content-Security-Policy als Header, wo
  der Host das kann; sonst bleibt das `<meta>` in `src/layouts/Base.astro`. `.github/workflows/ci.yml` und
  `.github/dependabot.yml` liegen bei; sie gelten, sobald der Ordner die Wurzel eines Repositorys ist.

## Abhängigkeiten

Jede weitere Abhängigkeit braucht das OK des Inhabers und hier eine Zeile mit dem Grund (`BLUEPRINT.md`).

| Paket | Wozu |
|---|---|
| `astro` | die Seite |
| `purgecss` | der Zuschnitt des Stylesheets (`scripts/cut-css.mjs`) |
| `@astrojs/check`, `typescript`, `@types/node` | `astro check`; die Node-Typen für Layout, Skripte und Tests |
| `eslint`, `eslint-plugin-astro`, `typescript-eslint` | Lint; `typescript-eslint`, damit ESLint TypeScript liest (Frontmatter, Tests) |
| `prettier`, `prettier-plugin-astro` | Format; das Plugin, damit Prettier `.astro` liest |
| `vitest` | Tests für `src/lib/` |
| `@playwright/test`, `@axe-core/playwright` | Tests am gebauten Stand |

`overrides` in `package.json`: `playwright-core` folgt der Version von `@playwright/test`, damit axe und die Tests
dieselbe Fassung nutzen.

## Für Agenten

Übernimm [`../AGENTS-snippet.md`](../AGENTS-snippet.md) in das `AGENTS.md` des Projekts. Behalte: nur Klassen aus
`public/sebaro/css/sebaro.css` und `app-` für Eigenes, nur `var(--sb-*)`, keine Inline-Stile oder -Skripte (die
Content-Security-Policy in `src/layouts/Base.astro` verbietet sie), alle Wörter in `src/strings/` (eine Datei je Sprache), kein Shiki
(es schreibt `style`-Attribute; Code in Markdown hebt Prism mit Klassen hervor, die die Kopie färbt, Code in einer
`.astro`-Seite trägt `sb-tok-*`), nichts von fremden Servern, und `npm run check`, `npm run lint`, `npm run build`
und `npm test` grün vor jedem Commit. Passt eine Regel nicht, nenn ihre ID und frag, statt sie zu umgehen.
