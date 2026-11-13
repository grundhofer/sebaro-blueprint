# sebaro: die Kernregeln

Lies das, bevor du einen Bildschirm in sebaro baust oder änderst. Diese 31 Regeln musst du im Kopf haben; der Rest
steckt in den Bauteilen ([parts.md](parts.md) sagt, was ein Bauteil noch von dir braucht), den Ansichtstypen
([views.md](views.md)) und den Prüfungen. `[AKT-01]` verweist auf den langen Katalog `rules/rules.json` (Begründung
und Beispiele), `D<n>` auf eine Entscheidung des Inhabers. Schlag dort nur nach, wenn du den Grund brauchst. Wo der
Katalog etwas anderes sagt, gilt diese Datei. Sie sagt dasselbe wie die englische Fassung [KERN.md](KERN.md).

## Das System

1. Nimm die Bauteile und Tokens der sebaro-Kopie in deinem Projekt. Keine rohen Farben, Größen oder Schriften, kein
   zweites Designsystem. Ändere die Kopie nie. [HAL-07, TEC-01]
2. Bau jeden Bildschirm aus einem Ansichtstyp. Füll seine Plätze; seine festen Punkte änderst du nur für die eine
   Ansicht, für die es die App gibt. [D145]
3. Fehlt ein Bauteil, bau es neben der Kopie aus Tokens und vorhandenen Bauteilen und trag es in die Lückenliste des
   Projekts ein. Eine Abweichung wird für das Produkt entschieden und im Produkt festgehalten. Nach sebaro kommt sie,
   wenn ein zweites Produkt sie braucht.

## Farbe

4. Eine Farbe, eine Aufgabe. Kobalt: der aktuelle Ort, Link, Fokus, Auswahlmarke. Lindgrün: der eine nächste Schritt
   und das Markenschild von sebaro. Statusfarben: nur als Glyphe mit Wort. Alles andere ist grau mit Haarlinien.
   [FAR-01, FAR-03, EIN-03, D143]
5. Die Produktfarbe steht in der Zeichenkachel der App, auf dem Startbildschirm und in höchstens einer Produktfläche
   je Ansicht, und nur auf Einstieg, Übersicht (ein Wert), Detail mit einem Wert, Ergebnis und leerem Zustand. Nie
   hinter Bedienelementen oder Links. [D143, D145; ersetzt ZEI-01]
6. Keine farbige Fläche hinter Text außer der Hauptaktion. Die Gründe sind die vier Grautöne der Tokens.
   [FAR-02, FAR-05]
7. Hell und Dunkel sind gleichwertig. Jede Ansicht funktioniert in beiden und in den Farbtönen „Kühl“ und „Warm“.
   [FAR-09, FAR-15]

## Schrift, Raum, Form

8. Zwei Schriftfamilien: sebaro Sans für alles, sebaro Mono für Code, Kennungen und Versionen. Nur die Schriftrollen
   der Tokens. Zahlen mit Tabellenziffern, nie in Mono. [SCH-01, SCH-03, SCH-04]
9. Abstände nur aus der Skala. Das Layout richtet sich am Anfang aus, nie mittig. Feste Zeilenhöhen, eine Dichte.
   [RAU-01, RAU-04, RAU-05]
10. Ebenen trennt eine 2 px breite Tintenlinie, nie Schatten, Tönung oder Höhe. Karten fassen nur Einstellungen oder
    Kennzahlen zusammen. Eine Liste bleibt eine Liste flacher Zeilen mit Haarlinien, in jeder App und bei jeder
    Breite. [EBE-01, EBE-02, DAT-01, FOR-02, D145]
11. Keine Verläufe, kein Leuchten, keine Texturen, kein Schmuck. Ein Radius je Klasse (4, 8, 12, 16). Die 45°-Kante
    heißt „endgültig“ und steht nur auf Aktionen, die sich nicht rückgängig machen lassen.
    [FOR-01, FOR-03, FOR-04, HAL-06]

## Aktionen

12. Höchstens eine lindgrüne Hauptaktion je Ansicht (ein Rahmen mit zwei Spalten ist eine Ansicht), unten in dem
    Bereich, auf den sie wirkt, beschriftet mit Ding und Verb („Eintrag anlegen“), als letzte ihrer Gruppe. Keine, wo
    es keinen klaren nächsten Schritt gibt; eine Detailansicht hat keine. [AKT-01, AKT-02, AKT-04, AKT-11, D145]
13. Drei Stufen: Lindgrün für den nächsten Schritt, höchstens eine umrandete Aktion je Bereich, alles andere ist eine
    Textaktion. [AKT-06, D143]
14. Die Hauptaktion zeigt ihren eigenen Fortschritt und ihr Ergebnis. Kein Ladekreis über der Ansicht. Eine
    Kurzmeldung nur für ein umkehrbares Ergebnis, mit „Rückgängig“. [AKT-05, EBE-05]
15. Wer etwas Gespeichertes löscht, wird immer in einem Dialog gefragt, der sagt, was verloren geht.
    [AKT-07, AKT-08, D119]
16. Unter einer Aktion, die Daten irgendwohin schickt, sagt eine Zeile, wohin. Nur lokal: „Bleibt auf diesem
    Gerät.“ [BEL-10]

## Navigation

17. Der aktuelle Ort ist eine 3 px breite Linie in Kobalt und ein zweites Merkmal (gefülltes Icon, Schriftstärke).
    Was einen Ort öffnet, zeigt Icon und Wort; nur Werkzeuge, die an Ort und Stelle wirken, dürfen allein ein Icon
    sein. [NAV-01, NAV-02, NAV-10]
18. Handy: Navigation unten mit drei bis fünf Hauptzielen, Unteransichten bekommen „Zurück“. Ab 840 dp: eine Leiste
    am Rand und zwei Spalten, die Liste am Anfang, das Detail am Ende. Die Kopfleiste trägt nie die Hauptaktion.
    [NAV-03, NAV-04, NAV-05, D145]
19. Ein Linkstil: das Wort in Textfarbe, 2 px breit in Kobalt unterstrichen. Ein Link, der die App verlässt, endet
    mit dem Icon für externe Links. [LNK-01, LNK-02]

## Inhalt

20. Status ist eine Glyphe mit einem Wort aus den festen Wörtern, nie nur Farbe. Deaktiviertes bleibt lesbar.
    [STA-01, STA-02, STA-03]
21. Felder haben eine sichtbare Beschriftung darüber. Ein Fehler ist eine rote Linie, eine Glyphe und ein Satz, der
    sagt, was falsch ist und was zu tun ist. [EIN-01, EIN-02, TXT-07]
22. Leer: „Noch keine <Dinge>“ und ein Satz, wie es sich füllt; die Aktion bleibt unten. Laden: Arbeit auf dem Gerät
    zeigt nichts; Arbeit über das Netz sagt nach 1 s „Wird geladen …“. [DAT-07, STA-06]
23. Ruhig: keine Zähler auf Icons, keine roten Punkte, keine Banner. Bewegung antwortet nur auf eine Aktion (8 px von
    unten, höchstens 200 ms) und folgt der Einstellung „Bewegung reduzieren“ des Systems.
    [HAL-05, BEW-01, BEW-02, BEW-04]
24. Diagramme und Kennzahlen sind grau; nur der aktuelle Zeitraum steht in Kobalt. [DAT-04]
25. Icons nur aus dem sebaro-Satz, jedes für eine Funktion. Pfeile und Winkel sind Icons, keine Schriftzeichen.
    Gefüllt nur für den aktuellen Ort, einen eingeschalteten Zustand und Status. Ein Zeichen wird nie verändert und
    steht immer neben dem Namen der App. [ICO-03, ICO-05, ICO-06, ZEI-06, ZEI-07]

## Wörter

26. Deutsche Oberflächen sagen „du“. Titel sind kurze Substantive. Zahlen: ein geschütztes Leerzeichen (U+00A0)
    zwischen Zahl und Einheit, „10.000“, „12,90 €“, „08:00–22:00“. Kein Text wird im Code zusammengesetzt; jede
    Zeichenkette kommt aus der Texttabelle, damit eine zweite Sprache folgen kann.
    [TXT-01, TXT-03, TXT-04, TXT-12, TEC-10]
27. Ehrlich: keine Behauptung ohne Beleg, konkrete Fakten statt Werbesätzen, Fehler und fehlende Werte in Worten,
    Beispieldaten als „Beispieldaten“ markiert. Nichts lädt von fremden Servern.
    [HAL-03, HAL-04, HAL-09, BEL-01, BEL-09, TXT-02]

## Feste Orte

28. Die Wahl des Erscheinungsbilds heißt „Hell oder Dunkel“, daneben steht „Farbton: Kühl · Warm“. Handy-App: in den
    Einstellungen. Website: ein Knopf im Kopf. Web-App: im Menü „Mehr“. Desktop: im Menü „Darstellung“.
    [AKT-09, D143]
29. Start: die ganze Fläche in der Produktfarbe mit dem weißen Symbol, dann die App. „Über“ zeigt Kachel, Name,
    Version und den Absender „von sebaro“. [D143, D144; ersetzt STR-01]

## Boden der Barrierefreiheit

30. Dieser Boden reicht. Leg nichts darauf, wo es die normale Bedienung schlechter macht.
    [ZUG-01 bis ZUG-04, Inhaber 2026-11-11]
    - Der Kontrast kommt aus den Tokens (4,5:1 für Text, 3:1 für großen Text und Formen).
    - Tippziele 48 dp oder px. Kompakte Zeilen mit 32 px nur in Desktop-Fenstern, die mit einem Zeiger bedient werden.
    - Jedes Bedienelement hat einen Namen. Status nie nur über Farbe (Regel 20).
    - Der Fokus ist sichtbar. Im Web und auf dem Desktop gehen die Hauptwege mit der Tastatur.
    - Text folgt der Schriftgröße des Systems. Prüf jeden Bildschirm einmal bei großer Schrift (Android Stufe 1,3, Web
      200 % Zoom bei Desktop-Breite). Er muss benutzbar bleiben; „…“ ist erlaubt.
    - Im Web: Überschriften, Bereiche, die Sprache der Seite und Alternativtexte.

## Fertig

31. Ein Bildschirm ist fertig, wenn die Prüfungen des Projekts grün gelaufen sind und du ihn in Hell und Dunkel
    angesehen hast, auf dem Handy und breit. Sag, was du nicht prüfen konntest. [TEC-06]
