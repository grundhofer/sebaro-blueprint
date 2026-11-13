import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import { addDays } from "../../lib/calendar";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { ValuesTable } from "./Specimen";

// days reached per week in percent, eight weeks from 10.08.; invented
const SERIES = [
  [70, 74, 78, 76, 82, 85, 83, 90],
  [40, 55, 50, 62, 58, 65, 70, 72],
  [30, 28, 35, 40, 38, 45, 42, 50],
];
const points = (values: number[]) =>
  values.map((value, at) => `${(6.25 + at * 12.5).toFixed(2)},${100 - value}`).join(" ");

/** Several lines over the weeks. Three series have a legend and a line style each. Two are named at the line
 *  ends; their legend is written hidden, and the copy's stylesheet shows it where the names do not fit. */
export function SeriesChart({ count, captionId, caption }: { count: 2 | 3; captionId: string; caption: string }) {
  const { t } = useTranslation();
  const lang = useLang();
  const names = t("data.seriesNames", { returnObjects: true }).slice(0, count);
  const percent = (value: number) => fmt.percent(lang, value);
  return (
    <figure className="sb-chart" aria-labelledby={captionId}>
      <ul
        className="sb-chart__legend"
        aria-label={t("data.legend")}
        hidden={count === 2}
        data-sb-fit-legend={count === 2 ? "" : undefined}
      >
        {names.map((name, at) => (
          <li key={name}>
            <svg className="sb-chart__key" viewBox="0 0 24 8" aria-hidden="true" focusable="false">
              <line className={`sb-chart__line sb-chart__line--${at + 1}`} x1="1" y1="4" x2="23" y2="4" />
            </svg>
            {name}
          </li>
        ))}
      </ul>
      <div className="sb-chart__plot">
        <ul className="sb-chart__ticks" aria-hidden="true">
          <li data-sb-y="50">50</li>
          <li data-sb-y="0">0</li>
        </ul>
        <div className="sb-chart__area">
          <svg
            className="sb-chart__shapes"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <line className="sb-chart__grid" x1="0" y1="50" x2="100" y2="50" />
            <line className="sb-chart__axis" x1="0" y1="100" x2="100" y2="100" />
            {names.map((name, at) => (
              <polyline key={name} className={`sb-chart__line sb-chart__line--${at + 1}`} points={points(SERIES[at])} />
            ))}
          </svg>
        </div>
        <ul className="sb-chart__ends" aria-hidden="true">
          {names.map((name, at) => (
            <li key={name} className="sb-chart__end--series" data-sb-y={SERIES[at][7]}>
              <span className="sb-chart__end-name">{name} </span>
              {percent(SERIES[at][7])}
            </li>
          ))}
        </ul>
        <ol className="sb-chart__slots sb-chart__slots--start" aria-hidden="true">
          {t("data.seriesMonths", { returnObjects: true }).map((month) => (
            <li key={month} data-sb-span="4">
              {month}
            </li>
          ))}
        </ol>
      </div>
      <ValuesTable
        labelledBy={captionId}
        head={[t("data.weekFrom"), ...names]}
        rows={SERIES[0].map((_, week) => [
          fmt.dayMonth(lang, addDays("2026-08-10", week * 7)),
          ...names.map((_, at) => percent(SERIES[at][week])),
        ])}
      />
      <figcaption id={captionId}>
        {caption} <DemoMarker />
      </figcaption>
    </figure>
  );
}
