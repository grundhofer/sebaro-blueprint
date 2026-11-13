# Musterapp: Android-Vorlage mit sebaro (Kotlin, Jetpack Compose)

Ein kleines, vollständiges Android-Projekt als Startpunkt für eine App der sebaro-Familie, gebaut nach dem
[Android-Bauplan](BLUEPRINT.md). Wo Vorlage und Bauplan sich noch unterscheiden, steht in dessen letztem Abschnitt.
„Musterapp“, `de.sebaro_ventures.musterapp` und das Zeichen (das der Dachmarke, als Platzhalter) ersetzt du in deinem
Produkt. Alle Einträge und Werte sind erfunden und tragen „Beispieldaten“; was du selbst anlegst, trägt die Marke nie.

| | |
|---|---|
| Sprache, UI | Kotlin, Jetpack Compose, eine Activity, Navigation ohne Bibliothek |
| minSdk / targetSdk / compileSdk | 29 / 36 / 37, Java 21 |
| Module | `:app` und `:designsystem` (die sebaro-Kopie in `sebaro/`, Profil `android`, Pakete `charts` und `table`) |
| Daten | Room für die Einträge, DataStore für die Einstellungen, die Uhr aus dem `AppContainer` |
| Sprachen | Englisch in `res/values/` (Rückfall), Deutsch in `res/values-de/`; die Liste steht in `res/xml/locales_config.xml` |
| Versionen | alle in `gradle/libs.versions.toml` |

## Das Build-Setup gehört nicht zur Vorlage

Die Plugins `sebaro.android.app` und `sebaro.android.designsystem` (`build-logic/`), die detekt-Regeln, die
`.editorconfig` und die Workflows `ci`, `release` und `promote` sind das gemeinsame Build-Setup der Familie. Es liegt
in einem privaten Repository und kommt per Export in dein Produkt, so wie die sebaro-Kopie; die Vorlage nennt die
beiden Plugins nur und bringt keinen Ersatz mit. Ohne den Export endet Gradle mit „Included build '…/build-logic' does
not exist“, mit ihm baut die Vorlage ohne weitere Änderung.

## Was die Vorlage zeigt

Drei Ziele in der unteren Navigation, dazu zwei Unterseiten. Jeder Bildschirm steht in `ui/<screen>/` mit denselben
Dateien: `…Screen.kt` (zustandslos), `…UiState.kt`, `…ViewModel.kt`, `…Route.kt`, `…Samples.kt`, dazu
`res/values*/strings_<screen>.xml` und `render/…RenderTest.kt`.

| Bildschirm | Ansichtstyp | Was er zeigt |
|---|---|---|
| Einträge (`list`) | `list` | Suche, zwei Gruppen mit Zahl im Kopf, erledigte Zeilen treten zurück, Schlusssatz, leerer Zustand und „Kein Eintrag mit …“, Hauptaktion „Eintrag anlegen“ unten; im Zeilenmenü „Ausblenden“ mit Kurzmeldung und „Rückgängig“ |
| Eintrag (`detail`) | `detail` | Zustand als Glyphe und Wort, Notiz, Eigenschaften flach; keine Hauptaktion, „Eintrag bearbeiten“ als die eine umrandete Aktion der Aktionszone; am Ende des Inhalts „Eintrag abschließen“ als Textaktion und „Eintrag löschen“ als die eine umrandete Aktion dort, in der Gefahrfarbe mit der 45°-Kante; beide fragen zuerst |
| Neuer Eintrag, Eintrag bearbeiten (`form`) | `form` | Beschriftung über dem Feld, „Notiz (optional)“ mit Zähler, „Priorität“ als Segmente; die Hauptaktion bleibt drückbar und sagt „Titel fehlt.“ am Feld; „Bleibt auf diesem Gerät.“ darunter; Schließen mit Änderungen fragt „Abbrechen“ · „Verwerfen“ · „Sichern“ |
| Daten (`data`) | ohne Hauptaktion | die Datenarten mit den Bauteilen der Kopie: Zahlen, Geld und Einheiten, Zeit, Zustand und Fortschritt, Kategorien und Markierung, Technisches, sortierbare Tabelle mit Summe, Diagramme, Bewertung |
| Einstellungen (`settings`) | `settings` | „Hell oder Dunkel“, „Farbton“, „Bewegung immer reduzieren“; alles gilt sofort |

Die Sprache wählt man in den Android-Einstellungen der App; in der App gibt es dafür nichts. Beim ersten Start schreibt
die App fünf Beispieleinträge in der Sprache dieses Moments in die Datenbank. Ändert jemand Titel oder Notiz eines
Beispieleintrags, gehört er ab dann dem Menschen und die Marke geht. Scheitert ein Schreiben (Speicher voll), steht
„Konnte nicht gesichert werden.“ in der Hauptaktion oder in einem Hinweis, nie in einer Kurzmeldung. Das Manifest
fragt kein Recht an, Sicherung und Geräteumzug sind aus.

## Aufbau

```
settings.gradle.kts, build.gradle.kts, gradle/      Projekt, Versionskatalog
designsystem/build.gradle.kts                       das Modul der sebaro-Kopie
sebaro/                                             die Kopie, nie von Hand ändern
sebaro.product.json, sebaro-product/                die Erklärung des Produkts und was der Baukasten daraus macht
app/src/main/kotlin/…/musterapp/
  MainActivity.kt  MusterappApplication.kt  AppContainer.kt
  data/      Room, DataStore, Repositories, trySave
  domain/    Entry und seine Regeln
  ui/        MusterappApp.kt (Thema, Navigation), Destination.kt, je Bildschirm ein Paket
app/schemas/                                        das Room-Schema jeder Version
docs/screens/                                       die Bilder der Render-Tests
.github/dependabot.yml                              wöchentliche Updates
```

## Starten

Du brauchst JDK 21, das Android SDK mit Plattform 37 (`ANDROID_HOME` oder `local.properties` mit `sdk.dir`), Node 20
oder neuer für die Prüfungen der Kopie und Python 3.10 oder neuer für den Baukasten.

1. Kopier den Ordner `templates/android-compose/` in dein neues Repository.
2. Exportier das Build-Setup der Familie in dieses Repository (Abschnitt oben).
3. Trag `id`, `name`, `tile` und dein Zeichen in `sebaro.product.json` ein und erzeug die Produktdateien neu:
   `python3 sebaro/product/product_kit.py build sebaro.product.json --copy sebaro --out sebaro-product`.
4. Ersetz `de.sebaro_ventures.musterapp` (`namespace`, `applicationId`, Paket der Kotlin-Dateien), `rootProject.name`,
   `Musterapp…` in den Klassennamen und `app_name`.

```sh
./gradlew :app:assembleDebug          # ohne Kotlin-Warnungen
./gradlew :app:installDebug           # auf ein Gerät oder einen Emulator
```

## Prüfen

```sh
./gradlew :app:testDebugUnitTest      # Tests auf der JVM, zeichnet docs/screens/ neu
./gradlew :app:check                  # Android Lint, detekt, ktlint, Tests
node sebaro/checks/verify-export.mjs sebaro --strict     # die Kopie ist unverändert
sh sebaro/checks/lint-android.sh app/src                 # sebaros Regeln; keine Ausgabe heißt: nichts verletzt
python3 sebaro/product/product_kit.py check sebaro.product.json --copy sebaro --out sebaro-product --no-raster
```

Die Tests brauchen kein Gerät (Robolectric, Android 16):

- `render/`: jeder Beispielzustand jedes Bildschirms hell, dunkel und bei Schriftgröße 1,3 auf 360 × 800 dp, die drei
  Dialoge und die Kurzmeldung eingeschlossen; „Daten“ in voller Länge. Die Bilder liegen in
  `docs/screens/<screen>-<zustand>-<light|dark|large>.png` und werden committet. Ein grüner Test sagt nur, dass
  gezeichnet wurde: Schau die Bilder an, bevor du einen Bildschirm fertig nennst
  ([`screen-checklist.md`](../screen-checklist.md)).
- `data/`: die Repositories gegen Room im Speicher und DataStore in einem temporären Ordner; die Beispieleinträge
  entstehen einmal und ein gelöschter bleibt gelöscht; `trySave` fängt nur Speicherfehler.
- `ui/<screen>/`: jedes ViewModel mit dem `AppContainer` der Tests (`TestSetup.kt`: feste Uhr, ersetzte Fabriken),
  auch der Fall, dass das Schreiben scheitert.
- `MusterappAppTest`: die ganze App von der Activity bis Room: erster Start, ein neuer Eintrag, ein Entwurf übersteht
  eine neue Activity und ist nach dem Verlassen des Formulars weg.

Die Kopie aktualisierst du mit `node sebaro/checks/update-copy.mjs` (mit `--packs a,b` änderst du die Pakete), nie
von Hand; danach liest du, was `CHANGES.md` der Kopie für dein Produkt sagt.

## Lücken der Vorlage

Was ein Produkt ergänzt und hier nicht als Muster steht:

- **Build-Setup und Veröffentlichung.** Workflows, Signierung mit den vier `SEBARO_UPLOAD_*`-Werten und der Weg nach
  Google Play kommen mit dem Export; Schlüssel, Dienstkonto und Runner richtet der Inhaber je Produkt ein.
- **Zeichen, Start und „Über“.** Die Produktdateien tragen das Zeichen der Dachmarke als Platzhalter; benutzt ist
  davon nur das Launcher-Icon. Der Start in der Produktfarbe (`Theme.Sebaro.Start`, `SbStart`) und „Über“ mit Kachel,
  Name, Version und Absender (Kernregel 29) fehlen, ebenso das Zeichen in der Kopfleiste. Das Play-Icon entsteht mit
  `build --render` des Baukastens.
- **„Daten“ ist ein Katalog,** kein Bildschirm eines Produkts: Er liest nichts und hat darum kein ViewModel.
- **Breite Fenster.** Ab 840 dp verlangt Kernregel 18 eine Leiste am Rand und zwei Spalten; die Vorlage zeigt nur
  das Telefon.
- **Mitteilungen, Widget, Kamera, Arbeit im Hintergrund** (WorkManager) kommen nicht vor.

## Bekannte Grenzen

- **Kurzmeldung nach einer neuen Activity.** Die zuletzt ausgeblendete Zeile bleibt im ViewModel, bis sie
  zurückgeholt oder eine andere ausgeblendet wird; nach einer Drehung erscheint die Kurzmeldung darum noch einmal.
- **Beispieleinträge wechseln die Sprache nicht.** Sie stehen als Text in der Datenbank.
- **Kein Trennstrich in den Bildern.** Ein Wort, das breiter ist als seine Zeile, wird getrennt; den Strich setzt die
  Silbentrennung des Systems, die Robolectric nicht hat. Auf einem Gerät ist er nicht gesehen.
- **Hinweise von Android Lint, die bleiben:** acht Dateien des Baukastens sind unbenutzt (Start, Zeichenkachel,
  Mitteilungs-Icon; siehe Lücken), zwei weitere Hinweise betreffen dessen Dateien selbst, der Rest nennt neuere
  Versionen im Katalog.
- **Nicht geprüft:** echtes Gerät oder Emulator, TalkBack, der Release-Build im Betrieb (er wird gebaut, mit R8, aber
  nicht gestartet), Android 10 bis 15 (die Tests laufen auf Android 16), der Sprachwechsel über die
  Android-Einstellungen.
