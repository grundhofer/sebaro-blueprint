# Änderungsprotokoll

Eine Version gilt für den Blueprint und den Regelkatalog zusammen (`rules/rules.json` → `version`). Jede Regel trägt
das Datum ihrer letzten Änderung (`changed`). `tools/check_site.py` vergleicht den Katalog mit dem Abzug der letzten
Version in `rules/releases/`: Jede neue, geänderte oder entfernte Regel muss unter „Unveröffentlicht“ stehen, sonst
schlägt die Prüfung fehl. `python3 tools/release.py <version>` macht daraus eine Version.

Versionsregeln: **Hauptversion**, wenn eine Regel entfällt oder ihre Aussage umkehrt; **Nebenversion** für neue
Regeln, geänderte Werte und neue Seiten; **Korrektur** für Wortlaut, Beispiele und Fehler ohne neue Aussage.

## Unveröffentlicht

## 4.0.0 · 2026-11-21

Der Blueprint sagt, was gilt und warum. Technik, Startvorlagen und das Entscheidungsprotokoll liegen in der Werkstatt.

- Alle Regeln: Die Felder `decisions` und `source` und die Nummern des Entscheidungsprotokolls im Text entfallen;
  `why` nennt den Grund einer Regel in ein bis drei Sätzen, ohne ihre Geschichte.
- HAL-07, HAL-08, TEC-04, TEC-07: der heutige Weg. Ein Produkt holt seine Kopie aus einem Release der Werkstatt und
  hält sie mit `update-copy.mjs` der Kopie aktuell.
- Entfallen, weil sie nur die Werkstatt betreffen: HAL-01, HAL-02, FAR-04, FAR-13, ZEI-02, ZEI-03, ZEI-04, ZEI-05,
  ZEI-08, ZEI-09, ZEI-10, ZEI-11, ZEI-12, ICO-01, ICO-02, STR-02, TEC-11.
- Neu: eine Seite je Bauteil (`design/parts/`) und je Produktart (`design/platforms/`). Die Startvorlagen,
  `design/parts.md` und der Abgleich mit der Werkstatt entfallen hier.
- STA-06: Lokale Arbeit zeigt nie einen Kreisel; dauert sie länger als etwa 1 s, steht ein kurzer Satz dort, wo das
  Ergebnis stehen wird.
- AKT-07, AKT-10: Eine Detailansicht zeigt „… löschen“ sichtbar am Ende ihres Inhalts; ein „Mehr“-Menü gibt es erst
  bei mehreren seltenen Aktionen, dann mit dem Löschen zuletzt.
- FOR-03: Gestrichelt nur, wo der Strich etwas bedeutet: „offen“, Ziellinie, zweite Datenreihe, „offline“ am Avatar.
- MOB-12: Der Blitz ist eine Taste mit dem Menü „Auto“, „An“, „Aus“; dunkel sind nur die Kamera und die Seitenansicht
  im Vollbild.
- DAT-13: Die Hauptaktion nennt die Spalte nur, solange die Tafel gewischt wird; breit heißt sie „Neue Karte“.
- ZEI-13: In „Über“ folgt auf den Kopf die Absenderzeile „Ein Werkzeug von“ mit dem Markenschild, dann die Fakten.
- STR-03, ZEI-01: Jeder Schritt der Einführung hat sein eigenes Bild; der Einstieg hat keine Produktfläche.
- ICO-07: Ein Produkt zeichnet die Bilder seiner Einführung selbst, im Stil der Spots; sonst bleibt es bei den vier
  Spots des Sets.
- EBE-07, DSK-08: Ein Menü schließt sich, wenn die Seite scrollt.
- EBE-05: Eine Taste „Kopieren“ zeigt 2 s „Kopiert“ in sich selbst; die Kurzmeldung gibt es nur, wo keine Taste
  sichtbar bleibt.
- BEL-10, BEL-05: Mit veralteten Fakten entfällt der erzeugte Hinweis unter der Aktion; die Zusammenfassung zählt in
  der Folge bestanden, offen, übersprungen, nicht bestanden.
- STR-01, HAL-07: Den Start in der Produktfarbe haben nur Apps (Handy, Web-App, Desktop); eine Website ist sofort
  lesbar.
- TEC-06: `CHECKS.md` eines Produkts ist kurz: nur, was keine Prüfung sieht, und jede Ausnahme mit ihrem Grund, kein
  Protokoll der Läufe.
- TEC-09, WEB-03: Ein Produkt liefert die Lizenztexte dessen mit, was es enthält: Eine App führt aus „Über“ zur
  Lizenzliste, eine Website verlinkt „Lizenzen“ im Fuß. Der Anbietertext der Startvorlage ist ein markierter
  Platzhalter, der jedes Release aufhält.
- NAV-06: Eine Produkt-Website trägt ihre eigenen wenigen Wörter im Kopf; die vier Wörter gehören der Website der
  Familie. Eine Web-App ohne Fenster hat den App-Rahmen mit drei bis fünf Orten; Hell oder Dunkel, Farbton und
  Sprache wählt sie im Menü „Mehr“.
- TEC-02: „Ohne Skript richtig, klassische Skripte“ gilt für die Skripte der Kopie und für Websites; ein Produkt aus
  einem Framework rendert durch dieses.
- DSK-10: Eine leere Sammlung sagt auch dort, wo Dokument-Reiter stehen, „Noch keine …“ und wie sie sich füllt.
- Kernregel 25: In der oberen Leiste steht die Kachel neben dem Titel der Ansicht.
- Zuordnung (`rules/home.json`): FOR-05 und STA-08 haben auch in Compose ein Bauteil.

## Frühere Versionen

Die Versionen bis 3.0.0 stehen im Archiv.
