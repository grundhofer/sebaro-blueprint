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

- Alle Regeln: Die Felder `decisions` und `source` und die Nummern des Entscheidungsprotokolls im Text entfallen; den
  Grund einer Regel nennt `why`.
- Entfallen, weil sie nur die Werkstatt betreffen: HAL-01, HAL-02, FAR-04, FAR-13, ZEI-02, ZEI-03, ZEI-04, ZEI-05,
  ZEI-08, ZEI-09, ZEI-10, ZEI-11, ZEI-12, ICO-01, ICO-02, STR-02, TEC-11.
- Neu: eine Seite je Bauteil (`design/parts/`) und je Produktart (`design/platforms/`). Die Startvorlagen,
  `design/parts.md` und der Abgleich mit der Werkstatt entfallen hier.

## Frühere Versionen

Die Versionen bis 3.0.0 stehen im Archiv.
