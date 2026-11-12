import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { Calendar } from "../parts/Calendar";
import { Icon } from "../parts/Icon";
import { Samples, Section, Specimen } from "./Specimen";
import { VALUES } from "./values";

export function TimeSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const minutes = t("common.minutes");
  const time = (iso: string) => fmt.time(lang, iso);
  return (
    <Section name="time">
      <Specimen title={t("data.dateT")}>
        <Samples
          rows={[
            [t("data.dayHead"), <time dateTime="2026-10-10">{fmt.dateLong(lang, "2026-10-10")}</time>],
            [t("data.noteTableEvidence"), <time dateTime="2026-10-10">{fmt.date(lang, "2026-10-10")}</time>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.timeT")}>
        <Samples
          rows={[
            [t("data.morning"), <time dateTime="08:12">08:12</time>],
            [t("data.evening"), <time dateTime="22:00">22:00</time>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.duration")}>
        <Samples
          rows={[
            [
              t("data.durationText"),
              <time dateTime="PT1H20M">
                {fmt.unit(lang, 1, t("common.hours"))} {fmt.unit(lang, 20, minutes)}
              </time>,
            ],
            [t("data.durationShort"), <time dateTime="PT45M">{fmt.unit(lang, 45, minutes)}</time>],
            [
              t("data.timer"),
              <time className="sb-num" dateTime="PT25M">
                25:00
              </time>,
            ],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.relative")}>
        <Samples
          rows={[
            [
              t("data.justNow"),
              <time dateTime="2026-10-10T14:32">{t("data.relJustNow", { time: time("2026-10-10T14:32") })}</time>,
            ],
            [
              t("data.yesterday"),
              <time dateTime="2026-10-09T18:40">{t("data.relYesterday", { time: time("2026-10-09T18:40") })}</time>,
            ],
            [
              t("data.older"),
              <time dateTime="2026-10-07">{t("data.relOlder", { date: fmt.date(lang, "2026-10-07") })}</time>,
            ],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.span")}>
        <Samples
          rows={[
            [
              t("data.tableTitle"),
              t("data.thisWeek", { from: fmt.dayMonth(lang, "2026-10-04"), to: fmt.date(lang, "2026-10-10") }),
            ],
            [t("data.reminderWindow"), VALUES.timeRange],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.weekdayT")}>
        <Samples
          rows={[
            [t("data.inText"), fmt.weekday(lang, "2026-10-10")],
            [t("data.axisHead"), fmt.weekday(lang, "2026-10-10", true)],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.calendar")}>
        <Calendar
          selected="2026-10-09"
          today="2026-10-10"
          entries={{
            "2026-10-09": [{ time: "07:30", text: t("data.calVitamin") }],
            "2026-10-02": [{ time: "19:00", text: t("data.calWalk") }],
          }}
          none={t("data.nothingEntered")}
        />
      </Specimen>
      <Specimen title={t("data.timeline")}>
        <ol className="sb-timeline" aria-label={t("data.timelineLabel")}>
          <li className="sb-timeline__item">
            <time className="sb-timeline__date" dateTime="2026-10-10T14:32">
              {t("data.tlToday", { time: time("2026-10-10T14:32") })}
            </time>
            <span className="sb-timeline__mark">
              <Icon name="edit" size={16} />
            </span>
            <div className="sb-timeline__main">
              <p className="sb-timeline__title">{t("data.tlEdited")}</p>
              <p className="sb-timeline__meta">{t("data.tlEditedMeta")}</p>
            </div>
          </li>
          <li className="sb-timeline__item">
            <time className="sb-timeline__date" dateTime="2026-10-09T22:05">
              {t("data.tlYesterday", { time: time("2026-10-09T22:05") })}
            </time>
            <span className="sb-timeline__mark sb-timeline__mark--warning">
              <Icon name="warning--16" size={16} />
            </span>
            <div className="sb-timeline__main">
              <p className="sb-timeline__title">{t("data.tlConflict")}</p>
              <p className="sb-timeline__meta">{t("data.tlConflictMeta")}</p>
            </div>
          </li>
          <li className="sb-timeline__item">
            <time className="sb-timeline__date" dateTime="2026-10-02">
              {fmt.date(lang, "2026-10-02")}
            </time>
            <span className="sb-timeline__mark">
              <Icon name="plus--16" size={16} />
            </span>
            <div className="sb-timeline__main">
              <p className="sb-timeline__title">{t("data.tlCreated")}</p>
            </div>
          </li>
        </ol>
        <div>
          <button className="sb-text-action" type="button">
            {t("data.tlOlder")}
          </button>
        </div>
      </Specimen>
      <Specimen title={t("data.countdown")}>
        <p className="sb-big-number">
          <span className="sb-big-number__value">
            <time dateTime="PT12M40S">12:40</time>
          </span>
          <span className="sb-big-number__label">{t("data.countdownLabel", { time: "10:30" })}</span>
        </p>
      </Specimen>
    </Section>
  );
}
