# Vorlage: Desktop-App mit Tauri 2

Eine kleine, lauffähige Desktop-App („Musterapp Desktop“, ein erfundener Name), gebaut nach ihrem Bauplan
[`BLUEPRINT.md`](BLUEPRINT.md) und, für die Oberfläche, nach dem der Web-App
([`../webapp-vite/BLUEPRINT.md`](../webapp-vite/BLUEPRINT.md)): Tauri 2 mit einem Rust-Workspace aus Kern-Crate und
Shell, die Oberfläche in React 19, TypeScript 6 (strict), Vite 8, pnpm 11, zustand und i18next, ohne Router. Sie
besteht aus dem Markup der Bauteile der sebaro-Kopie (Profil `desktop`); ihr Verhalten ist in React geschrieben. Alle
Notizen sind Beispieldaten.

| Teil des Fensters | Was er zeigt |
|---|---|
| Titelleiste | Kachel, Name, Ort, drei Werkzeuge mit Tooltip „Name Kürzel“, „Menü“ mit den fünf Gruppen und Untermenüs |
| Seitenleiste | Suche, Baum aus Ordnern, Notizen und Papierkorb, Zustand als Zeichen und Wort, Fuß „Einstellungen“ |
| Inhalt | Dokument-Reiter mit Punkt für „geändert“, der Text der Notiz, „Keine Notiz offen“ |
| Inspektor | Eigenschaften der Notiz, im Papierkorb „Zurücklegen“ und „Papierkorb leeren …“ |
| Aktionszone | Zählerzeile, Satz nach einem Befehl oder Fehler, Stand-Satz, die eine Hauptaktion „Neue Notiz“ |
| Einstellungen (⌘,) | schlank: „Hell oder Dunkel“, Farbton, Bewegung, „Beim Schließen sichern“; „Zurück zu …“ und Escape |
| Befehlspalette (⌘K / Strg+K) | Befehle in Gruppen, Haken für Einstellungen, Suche mit Treffern und Stichwörtern |
| Dialoge | „In den Papierkorb legen?“, „Papierkorb leeren?“, „Änderungen sichern?“, „Tastaturkürzel“ (die 15 festen) |
| ein Teil, der scheitert | „Fehler“: was los ist und was du tun kannst; der Rest des Fensters bleibt stehen |

Unter 722&nbsp;px Fensterbreite liegt die Seitenleiste, unter 1004&nbsp;px der Inspektor über dem Rand des Inhalts
(die Schwellen stehen im Stylesheet der Kopie). Die Trennlinien setzen die Breite: ziehen, Pfeiltasten, Pos1, Ende,
Eingabe, Doppelklick; ohne Linie im Menü „Darstellung“ mit „Schmal · Normal · Breit“.

## Starten

Node 22.22 oder neuer, pnpm 11, Rust über rustup (`rust-toolchain.toml` legt die Version fest), dazu einmal die
Werkzeuge der Rust-Seite. Unter Linux braucht Tauri Systempakete (Debian, Ubuntu):

```sh
cargo install tauri-cli --version "^2.12" --locked     # cargo tauri
cargo install cargo-audit cargo-deny --locked
sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev \
  libayatana-appindicator3-dev librsvg2-dev          # nur Linux
```

Die Oberfläche, in `apps/desktop/ui/`:

```sh
pnpm install
pnpm exec playwright install chromium   # einmal, für die End-to-End-Tests
pnpm lint && pnpm check  # ESLint, tsc --noEmit
pnpm format:check        # Prettier (pnpm format schreibt)
pnpm test                # Vitest: Logik, Stores, Bauteile; die Tests liegen neben den Dateien
pnpm build               # vite build nach dist/, danach die Größenbudgets (scripts/budget.ts): darüber scheitert der Build
pnpm test:e2e            # Playwright (Chromium) gegen dist/, serviert von vite preview
pnpm sebaro:verify       # die Kopie ist unverändert (verify-export.mjs --strict)
pnpm sebaro:product      # sebaro-product/ ist, was sebaro.product.json ergibt (braucht Python 3.10)
pnpm sebaro:lint         # lint-web.sh der Kopie über src/app.css und die gebaute Seite
```

Die Rust-Seite und die App, an der Wurzel der Vorlage:

```sh
cargo fmt --check && cargo clippy --all-targets -- -D warnings
cargo test               # Kern-Crate und Shell; schreibt dabei die Bindings der Oberfläche neu
cargo audit              # bekannte Lücken in Cargo.lock
cargo deny check licenses bans sources   # Lizenzen, Quellen, doppelte Crates (deny.toml)
cargo tauri dev          # das Fenster, Vite läuft dahinter
cargo tauri build --debug --no-bundle    # die App ohne Installationspaket
cargo tauri build        # das Installationspaket: .dmg unter macOS, .deb unter Linux
```

## Aufbau

```
Cargo.toml, Cargo.lock    der Workspace; die Version der App steht einmal hier ([workspace.package])
rust-toolchain.toml       die festgelegte Rust-Version
deny.toml                 erlaubte Lizenzen und Quellen der Crates
crates/musterapp-core/    die Logik des Produkts, ohne Tauri: heute die Einstellungen und ihre Datei
apps/desktop/src-tauri/   die Tauri-Shell
  src/main.rs             die Liste der Befehle, der Start
  src/commands.rs         die Befehle und alles, was zur Oberfläche hinübergeht: Typen, Fehlercodes
  src/window.rs           das Hauptfenster: Grund, Hell oder Dunkel, das Skript vor der Seite
  build.rs                liest die vier Fenstergründe aus tokens.json der Kopie
  tauri.conf.json         Content-Security-Policy, Installationspaket; capabilities/default.json: die Rechte
apps/desktop/ui/          die Oberfläche (Bauplan der Web-App)
  src/main.tsx            Einstieg: das eine Fenster mit seiner Fehlergrenze
  src/panes/              ein Teil des Fensters je Datei: Sidebar, Content, Inspector, Settings (mit lazy() geladen)
  src/components/         Teile der App: App, MainWindow, TitleBar, AppMenu, CommandPalette, Dialogs, ActionZone …
    parts/                die React-Hüllen der sebaro-Bauteile
  src/commands.ts         die Befehle der App: eine Liste für Menü, Palette und Kürzel
  src/store/              zustand: Notizen, Fenster, Darstellung
  src/lib/                Regeln als einfache Funktionen: Notizen, Kürzel, Breiten, Formate, der Weg zur Shell
  src/ipc/bindings.ts     erzeugt aus den Rust-Befehlen, nie von Hand ändern
  src/i18n.ts             die Sprachen; die Wörter stehen in i18n/ an der Wurzel
  src/sebaro/             die sebaro-Kopie, nie ändern
  tests/                  End-to-End-Tests (Playwright)
i18n/                     de.json, en.json: eine Datei je Sprache, geteilt von Oberfläche und Shell
sebaro.product.json       die Erklärung des Produkts; sebaro-product/ schreibt das Kit der Kopie daraus
.github/                  die Workflows ci und release, Dependabot
```

`src/components/parts/` kennt nur React, react-i18next mit `src/i18n.ts` (die Sprache und allein die Wörter unter
`common`) und `src/lib/`: keinen Store, keine Befehle der App. `Icon`, `Dialog`, `Tree`, `Switch`, `SearchField` und
`Status` stammen aus der Web-App-Vorlage (`Dialog` hat hier einen Platz für eine Tabelle, `Tree` lässt seinen
Besitzer wählen und öffnen); `Menu`, `Palette`, `DocTabs`, `Divider`, `Tool` und `Keys` sind die Bauteile des
Fensters.

## Oberfläche und Rust-Seite

- **Befehle und Bindings.** Die Oberfläche ruft Rust nur über `src/ipc/bindings.ts`, und nur in `src/lib/shell.ts`.
  Die Datei entsteht aus der Liste der Befehle in `src-tauri/src/main.rs`: der Test `bindings` schreibt sie bei jedem
  `cargo test` neu, und `ci` scheitert, wenn die eingecheckte Datei davon abweicht. Nach einem geänderten Befehl:
  `cargo test`, dann die Datei mit einchecken.
- **Fehler.** Ein Befehl, der scheitert, gibt einen Code zurück (`ErrorCode` in `commands.rs`), nie einen Satz. Der
  Satz steht in `i18n/<Sprache>.json` unter `errors.<Code>`. Ein neuer Code ohne Satz übersetzt nicht (die Typen von
  i18next), und ein Test der Shell prüft dasselbe für jede Sprache. In einem Browser ohne Shell (`vite preview`, die
  End-to-End-Tests) tut ein Aufruf nichts.
- **Fenster.** Das Hauptfenster entsteht in Rust, nicht in `tauri.conf.json`: mit dem gespeicherten „Hell oder
  Dunkel“ und dem Grund aus `tokens.json` der Kopie (`build.rs`), bevor die Seite malt. „Hell oder Dunkel“ und
  Farbton speichert die Rust-Seite in `settings.json` im Konfigurationsordner der App; vor den Skripten der Seite
  legt sie beide dorthin, wo `theme-init.js` der Kopie sie liest. Wählt die Oberfläche neu, speichert
  `set_appearance` und setzt Grund und Modus jedes Fensters.
- **Rechte und CSP.** `core:default` und `core:window:allow-start-dragging` (die Titelleiste trägt
  `data-tauri-drag-region`, nie ein Werkzeug). Die Content-Security-Policy in `tauri.conf.json` erlaubt nur eigene
  Dateien und als Verbindung nur die IPC-Adressen. `index.html` trägt dieselbe Policy für Browser und Tests, mit
  `'self'` in `connect-src` für das Neuladen in der Entwicklung; in der App gelten beide, also die strengere.
- **Keine Verbindung nach außen**, kein Update-Check.

## Die sebaro-Kopie

`apps/desktop/ui/src/sebaro/` ist die Kopie des Profils `desktop` aus dem öffentlichen Release, ohne Packs: sie trägt
die Fensterteile und `tokens.json`. Die README der Kopie sagt, wie sie eingebunden wird; nie darin ändern, auch nicht
mit ESLint oder Prettier.

```sh
node apps/desktop/ui/src/sebaro/checks/update-copy.mjs --check   # gibt es ein neueres Release? (Exit 1: ja)
node apps/desktop/ui/src/sebaro/checks/update-copy.mjs           # das neueste Release, gleiches Profil, gleiche Packs
python3 apps/desktop/ui/src/sebaro/product/product_kit.py build sebaro.product.json \
  --copy apps/desktop/ui/src/sebaro --out sebaro-product --render
cargo tauri icon sebaro-product/desktop/icon-1024.png -o apps/desktop/src-tauri/icons
```

Ein Update der Kopie ist ein eigener Commit; danach alle Befehle von „Starten“ und das Fenster in beiden Modi
ansehen. Die letzten beiden Befehle schreiben `sebaro-product/` und die App-Icons neu, wenn sich
`sebaro.product.json` ändert (`--render` zeichnet das PNG mit Playwright: `SEBARO_PLAYWRIGHT=apps/desktop/ui` nennt
den Ordner mit `node_modules`; von den Icons, die `cargo tauri icon` schreibt, hält die Vorlage die für den
Schreibtisch, nicht die Ordner `android/` und `ios/`). Die Erklärung ist ein Platzhalter: die Dachmarke. Ein echtes
Produkt trägt sein eigenes Zeichen ein.

Die Bauteile der Kopie sind CSS und Markup. Was ihre klassischen Skripte täten, steht hier in React. Geladen wird nur
eines:

| Skript | Geladen | Warum, oder wo das Verhalten jetzt steht |
|---|---|---|
| `theme-init.js` | ja | muss vor dem ersten Bild laufen: setzt gespeichertes Hell/Dunkel, Farbton und Bewegung an `<html>` |
| `sb-menu.js` | nein | `parts/Menu.tsx` |
| `sb-tooltip.js` | nein | `parts/Tool.tsx` |
| `sb-tone.js`, `theme-button.js` | nein | `panes/Settings.tsx`, `components/AppMenu.tsx`, `store/appearance.ts`, `lib/appearance.ts` |
| `sb-fit.js` | nein | es schreibt in Textknoten und Bauteile, die React rendert. Übernommen ist eine seiner Formen (siehe Lücken) |
| `sb-start.js` | nein | die Vorlage zeigt keinen Start (siehe Lücken) |
| `sb-sheet.js` | nein | die Vorlage hat kein Sheet |

Nicht in der Kopie, weil ihr Pack nicht gewählt ist: `sb-window.js` (jetzt `components/MainWindow.tsx`,
`components/App.tsx`, `src/commands.ts`, `lib/keys.ts`, `lib/areas.ts`, `parts/Palette.tsx`, `parts/DocTabs.tsx`,
`parts/Divider.tsx`, `parts/Keys.tsx`), `sb-controls.js` (`parts/Dialog.tsx`, `parts/Switch.tsx`), `sb-tree.js`
(`parts/Tree.tsx`), `sb-search.js` (`parts/SearchField.tsx`).

## Tests

`pnpm test` (Vitest, jsdom) prüft die Logik in `src/lib/`, die Stores, den Weg zur Shell mit einer Shell-Attrappe und
die Bauteile, die ohne Browser auskommen; `src/i18n.test.ts` prüft, dass Deutsch und Englisch dieselben Schlüssel
haben. jsdom kennt weder CSS noch `<dialog>` noch Popover: was davon abhängt, prüfen die End-to-End-Tests.

`cargo test` prüft im Kern-Crate die Einstellungen und ihre Datei, in der Shell die vier Fenstergründe, das Skript
vor der Seite und dass jeder Fehlercode in jeder Sprache seinen Satz hat; der Test `bindings` schreibt die Bindings.

`pnpm test:e2e` lädt jede Ansicht und Überlagerung (Fenster, Einstellungen, Palette mit und ohne Treffer, „Menü“ mit
Untermenü und Unter-Untermenü, die vier Dialoge, Papierkorb, kein offener Reiter, Suche ohne Treffer, Fehler beim
Sichern, Englisch) hell und dunkel, bei 390, 480 und 1440&nbsp;px, bei 100&nbsp;% und auf 1440&nbsp;px auch bei
echten 200&nbsp;% Schrift (CDP `Page.setFontSizes` vor dem Laden); dazu auf 480&nbsp;px die Seitenteile über dem
Inhalt und auf 1440&nbsp;px den Tooltip. Er scheitert an seitlichem Scrollen, abgeschnittenem Text, jedem axe-Fund
(WCAG 2.2 AA), Konsolenfehlern und CSP-Verstößen (`tests/sebaro-checks.ts`). 480&nbsp;px ist das kleinste Fenster,
das die App zulässt; 390&nbsp;px deckt dieselbe Oberfläche als Webseite ab.
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
Heute steht dort keiner.

`tests/keyboard.spec.ts` prüft das Fenster nur mit der Tastatur (die festen Kürzel, F6 durch die Bereiche, F10, das
Menü mit Pfeilen und Buchstaben, die Palette, die Reiter, die Trennlinie), den Fokus nach jedem Dialog, das schmale
Fenster, den Tooltip, die Aufrufe an die Shell über eine Shell-Attrappe, ein Englisch sprechendes System, einen Teil,
der sich nicht laden lässt, und dass jede Klasse von sebaro stammt oder mit `app-` beginnt.
`tests/dimensions.spec.ts` liest `src/app.css`: keine Länge ohne Token oder Begründung. Dass kein Wort im Markup
steht, prüft ESLint (`eslint.config.js`). Die Bildschirmfotos liegen danach in `test-results/screens/`.

Der Test nutzt außerhalb der CI einen Server, der auf Port 4174 schon läuft. Läuft dort die Vorschau eines anderen
Projekts, prüft er dieses. Starte mit `CI=1 pnpm test:e2e`: dann bricht ein belegter Port den Lauf laut ab.

## Größe

`pnpm build` misst nach dem Bau (`scripts/budget.ts`) und scheitert über einem Budget; das Installationspaket misst
der Workflow `release`.

| Was | Budget | Gemessen |
|---|---|---|
| CSS des ersten Ladens | 75&nbsp;KB gzip | 28,0&nbsp;KB |
| JavaScript beim Start | 250&nbsp;KB gzip, kein Start-Chunk über 120&nbsp;KB | 107,6&nbsp;KB, größter Chunk 106,1&nbsp;KB |
| Schriften | 250&nbsp;KB | 61,9&nbsp;KB (drei WOFF2) |
| Installationspaket | 12&nbsp;MB | 2,95&nbsp;MB (`.dmg`, macOS arm64, unsigniert) |

## ci, release, Dependabot

`.github/workflows/ci.yml` läuft bei jedem Push und Pull Request und einmal in der Woche, unter macOS und Linux: die
Audits (`pnpm audit --prod --audit-level=high`, `cargo audit`, `cargo deny`), alle Befehle von „Starten“ außer
`cargo tauri dev`, und der Vergleich der Bindings. Einmal in der Woche fragt er auch nach einem neueren Release der
Kopie. `.github/workflows/release.yml` läuft bei einem Versions-Tag (`v0.1.0`, gleich der Version in `Cargo.toml`):
er ruft `ci`, baut das Installationspaket unter macOS und Linux, hält es an 12&nbsp;MB und legt beide mit
`SHA256SUMS` in einen Release-Entwurf, den ein Mensch veröffentlicht. Die Pakete sind unsigniert, bis das Produkt ein
Zertifikat hat; die Release-Notiz sagt das. `.github/dependabot.yml` meldet einmal in der Woche neue Versionen für
`npm`, `cargo` und `github-actions`.

## Was die Vorlage zeigt (Regeln)

Wo die Vorlage eine dieser Regeln noch nicht ganz erfüllt, steht es unter „Lücken der Vorlage“.

| Teil | Regeln |
|---|---|
| Fenster: Titelleiste, Seitenleiste, Inhalt, Inspektor, Aktionszone über die ganze Breite, Dichte „window“ | DSK-01, EBE-01, EBE-08, RAU-06 |
| Titelleiste mit Kachel, Name, Ort, Werkzeugen mit Tooltip und der Taste „Menü“ mit fünf Gruppen; als Ziehfläche | DSK-06, DSK-08, NAV-10, EBE-06, EBE-07 |
| Seitenleiste mit Suchfeld, Baum, Status als Zeichen und Wort, Fuß „Einstellungen“ | NAV-04, NAV-11, EIN-05, STA-08, TXT-09 |
| Seitenleiste und Inspektor ausblendbar, ziehbare Trennlinien, „Schmal · Normal · Breit“ | DSK-04, DSK-07 |
| Dokument-Reiter mit Punkt für „geändert“, Entf und ⌘W | DSK-10 |
| Zählerzeile, Stand-Satz, eine Hauptaktion „Neue Notiz“ zuletzt; Fehler beim Sichern als Satz | STA-07, AKT-01, AKT-02, AKT-11, HAL-04 |
| Befehlspalette mit ⌘K / Strg+K | NAV-09 |
| die 15 festen Kürzel und F6, auch als Dialog „Tastaturkürzel“ | DSK-09, ICO-08 |
| schlanke Einstellungen (⌘,): Hell oder Dunkel, Farbton, Bewegung | DSK-02, DSK-05, FAR-15, BEW-04 |
| „In den Papierkorb legen …“ fragt; der Papierkorb im Baum hält die Notizen, „Zurücklegen“ holt eine zurück, „Papierkorb leeren …“ fragt und löscht endgültig; Dialog vor dem Schließen „Abbrechen“ · „Verwerfen“ · „Sichern“; der Fokus danach auf einem Ziel im Fenster | AKT-07, AKT-08, AKT-11, EBE-03, FOR-04, DSK-08, ZUG-06 |
| Fenstergrund aus der gespeicherten Wahl (`settings.json`), Sprachen in `Info.plist` | DSK-14, DSK-08 |
| alle Wörter in `i18n/`, Deutsch und Englisch; CSP ohne `unsafe-inline`, Schriften selbst gehostet | TEC-10, TXT-05, HAL-09, SCH-02 |
| 200 % Schrift ohne seitliches Scrollen und ohne abgeschnittenen Text, axe ohne Befund | ZUG-01, ZUG-09 |

## Was ein Agent behalten muss

Übernimm den Abschnitt aus [`../AGENTS-snippet.md`](../AGENTS-snippet.md) in die `AGENTS.md` deines Projekts. Für diese
Vorlage gilt zusätzlich:

- Jedes Wort steht in `i18n/de.json` und `en.json`, auch die Beispielnotizen (`samples`); ESLint verbietet Wörter im
  JSX. U+00A0 zwischen Zahl und Einheit schreibst du dort als `\u00a0`, damit es sichtbar bleibt. Zahlen und Daten
  laufen über `src/lib/format.ts`. Die Sprache ist die des Systems: Deutsch, sonst Englisch; die Vorlage hat keinen
  Sprachschalter.
- Ein Befehl steht einmal in `src/commands.ts`, mit seinem Kürzel in der macOS-Form (`Mod+K`); Menü, Palette und
  Tastatur lesen ihn von dort. Was Windows und Linux statt ⌘ drücken und zeigen, ergibt `src/lib/keys.ts`.
- Was die Oberfläche von Rust braucht, wird ein Befehl in `commands.rs` und steht in der Liste in `main.rs`; die
  Typen, die hinübergehen, stehen in `commands.rs`, nicht im Kern-Crate. Der Kern kennt weder Tauri noch die
  Oberfläche und ist ohne Fenster zu testen.
- Maße nur aus Tokens (TEC-01). Wo sebaro keins hat, sagt ein Kommentar „no sebaro token“ warum; Umbrüche in rem oder
  em. Die Breiten der Seitenteile liest `src/lib/panes.ts` aus den Tokens der Kopie.
- Eigene Klassen beginnen mit `app-` und nutzen nur `var(--sb-*)`; nie eine eigene `sb-*`-Klasse, nie eine Farbe von Hand.
- Kein `style`-Attribut im Markup, kein Inline-Skript, keine `data:`-Adresse: die CSP bleibt so streng. Eine Breite
  oder einen Ort setzt React über das CSSOM (`style` in JSX, `element.style`).
- Ein Dialog, ein Popover oder die Palette ist genau so lange offen, wie sein Zustand in React es sagt. Was der
  Browser von selbst schließt (Escape, ein Druck daneben), meldet das Bauteil sofort.
- `scrollIntoView` verschiebt in Chromium auch die Stelle, von der Tab weitergeht: `reveal()` in `src/lib/focus.ts`
  rollt nur die Reihe.
- Die Kachel in der Titelleiste und das App-Icon sind Platzhalter (die Dachmarke). Ein echtes Produkt trägt sein
  eigenes Zeichen in `sebaro.product.json` ein (ZEI-03, ZEI-08).
- Alle Befehle von „Starten“ müssen grün sein, bevor eine Ansicht fertig ist; die Prüfliste `../screen-checklist.md`
  gilt dazu. Vor einem Release: die gebaute App starten und die Hauptwege von Hand gehen.

## Abhängigkeiten über die Baupläne hinaus

Die Baupläne nennen Tauri 2, React, TypeScript, Vite, zustand, i18next mit react-i18next, Vitest, Playwright mit axe,
ESLint mit typescript-eslint, Prettier, `cargo audit` und `cargo deny`. Dazu kommen:

| Paket | Wozu |
|---|---|
| `tauri-specta`, `specta`, `specta-typescript` (Rust, MIT) | erzeugen `src/ipc/bindings.ts` aus den Befehlen. Vorabversionen (2.0.0-rc.25, 0.0.12), darum exakt festgelegt; `specta` bringt `paste` mit, das als nicht mehr gepflegt gemeldet ist (RUSTSEC-2024-0436, eine Warnung von `cargo audit`) |
| `serde`, `serde_json` (Rust, MIT oder Apache-2.0) | die Einstellungsdatei und was über die IPC geht; beide bringt Tauri ohnehin mit |
| `@tauri-apps/api` (MIT oder Apache-2.0) | die IPC-Seite von Tauri 2 im Browser: die Bindings rufen ihr `invoke` |
| `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@eslint/js`, `@types/*` | wie in der Web-App-Vorlage, nur für die Entwicklung |
| `eslint-plugin-react-hooks` | die empfohlenen Regeln für Reacts Hooks: Abhängigkeiten eines Effekts, nichts Unreines beim Rendern |

Nicht dabei, mit Absicht: `@tauri-apps/cli` (die Vorlage nutzt `cargo tauri`), `@vitejs/plugin-react` (sein Fast
Refresh braucht ein Inline-Skript, das die CSP sperrt) und ein Router.

## Nicht geprüft

**Die gebaute App ist einmal unter macOS gestartet worden: Das Fenster öffnet sich und zeigt die Oberfläche.** Mehr ist
in einem echten Tauri-Fenster nicht geprüft (WebKit unter macOS und Linux, WebView2 unter Windows): weder das Ziehen
an der Titelleiste, die Lage der Ampel-Knöpfe, der Fenstergrund vor dem ersten Bild, das native Menü noch das Speichern
in `settings.json`. Die Tests laufen nur in
Chromium; die Aufrufe an Rust prüfen sie gegen eine Attrappe. Die Workflows `ci` und `release` sind in dieser Vorlage
nie gelaufen; im Guide läuft, was `ci` unter Linux ruft, als Job `desktop-tauri`. Das `.deb` unter Linux und jeder Bau
unter Windows sind nie entstanden. Das Verbot von Wörtern im JSX sieht Text zwischen Tags und die Attribute
`aria-label`, `aria-description`, `alt`, `placeholder` und `title`, keine Zeichenketten, die Code an eine Funktion
übergibt.

## Lücken der Vorlage

Was die Vorlage zeigt, obwohl es keiner Regel folgt, oder nicht zeigt, obwohl eine Regel es verlangt. Die
Probeaufgaben ([`../../docs/agenten-test-2026-10.md`](../../docs/agenten-test-2026-10.md)) haben gezeigt, dass Agenten
solche Stellen übernehmen. Übernimm sie nicht, sondern bau es so:

- **Die Notizen leben in der Oberfläche.** Sie sind Beispieldaten in `i18n/` und `src/lib/notes.ts` und halten, bis
  das Fenster schließt. Ein Produkt legt seine Dokumente und ihre Regeln ins Kern-Crate und liest und schreibt sie
  über Befehle; `src/lib/` behält dann nur, was die Oberfläche allein angeht.
- **Nur zwei Einstellungen in der Einstellungsdatei.** Der Bauplan nennt „Hell oder Dunkel“ und Farbton. „Bewegung
  immer reduzieren“, „Beim Schließen sichern“ und die Breiten der Seitenteile stehen im `localStorage` der Webview.
  Schlägt `localStorage` fehl, sagt die Vorlage es nicht; die Wahl gilt dann, bis das Fenster schließt (HAL-04).
- **Datenweg-Zeile:** unter „Neue Notiz“ fehlt „Bleibt auf diesem Gerät.“ (BEL-10 gilt für jede Aktion mit Datenweg,
  auch im Fenster; die Fenster auf `docs/desktop.html` zeigen sie auch nicht, eine Frage an die Werkstatt).
- **Große Schrift ohne `sb-fit.js`.** Übernommen ist eine seiner Formen: Aktionen eines Dialogs, die nicht in eine
  Zeile passen, stehen untereinander (`parts/Dialog.tsx`). Es fehlt vor allem der Trennstrich in einem überlangen
  Wort: bei 200&nbsp;% bricht „Wochenplan“ in der Seitenleiste ohne ihn (ZUG-09).
- **Die Bauteile in `parts/` können weniger als die Skripte der Kopie.** Das Menü: ein Untermenü prüft nicht, ob es
  ein Menü weiter oben verdeckt, es kennt nur die Leserichtung von links nach rechts, und ein einzelnes Alt öffnet es
  nicht (F10 schon). Die Seitenteile: ihre Breite hält das Stylesheet der Kopie neben dem Inhalt, kein Skript;
  Zeilen und Reiter lassen sich nicht ziehen. Der Tooltip folgt dem Rollen nicht. Der Baum kennt weder ⌘↓ noch
  Ebenen tiefer als acht. Ein Klick neben einen Dialog bricht immer ab.
- **Ampel-Knöpfe unter macOS.** Das Stylesheet der Kopie rechnet mit den Knöpfen an fester Stelle
  („trafficLightPosition y 25“, Kommentar in `css/sebaro.css`); die Vorlage setzt die Stelle nicht, die Knöpfe stehen,
  wo das System sie hinlegt.
- **Natives Menü.** Die Vorlage legt keins an: unter macOS zeigt die Menüleiste das Standardmenü von Tauri, dessen
  Gruppen englisch heißen. „Darstellung“ mit „Hell oder Dunkel“ steht im „Menü“ des Fensters (Kernregel 28).
  „Neues Fenster“ ist gesperrt, mehrere Fenster baut die Vorlage nicht (DSK-12).
- **Start mit der Produktfarbe:** Kernregel 29 gilt auf jeder Plattform; die Vorlage baut den Start nicht ein (weder
  `data-sb-start` noch `sb-start.js`, `src/app.css` importiert `sebaro-product/sign/product.css` nicht).
- **Release nur für macOS und Linux,** unsigniert. Ein Produkt für Windows ergänzt die Matrix in `release.yml` und
  `bundle.targets`; ein Produkt mit Zertifikat das Signieren.
- **Frage an den Inhaber:** wie TEC-02 („klassische Skripte, keine Module“) zu einem Vite-Build passt, der die
  Oberfläche als Modul ausliefert. Frag mit der ID, statt es selbst zu entscheiden.
- **`CHECKS.md` fehlt.** TEC-06 verlangt sie in jedem Produkt: jede Prüfung mit Befehl, Datum und Exit-Code, jede nicht
  gelaufene mit Grund, auch der nie gegangene Weg durch die gestartete App.
