import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import { addDays } from "../../lib/calendar";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { Heatmap, type HeatDay } from "../parts/Heatmap";
import { Icon } from "../parts/Icon";

// glasses per day, four weeks from 14.09. up to „today“, 10.10.2026: null is a day without a value, undefined a
// day still to come; invented
const START = "2026-09-14";
const TODAY = "2026-10-10";
const HEAT = [
  [4, 6, 7, 3, 2, 5, 7],
  [8, 6, 1, 7, null, 3, 6],
  [5, 8, 2, 9, 7, 4, 8],
  [2, 5, 7, 6, 3, 5, undefined],
];
// the class of a day's value: 0–2, 3–4, 5–6, 7 and more
const level = (value: number | null) =>
  value === null ? "none" : value <= 2 ? "seq-1" : value <= 4 ? "seq-2" : value <= 6 ? "seq-3" : "seq-4";

/** A heatmap with its legend: colour in the cell, numbers in the legend, every value also as text and as a table. */
export function HeatmapChart() {
  const { t } = useTranslation();
  const lang = useLang();
  const heads = Array.from({ length: 7 }, (_, at) => fmt.weekday(lang, addDays(START, at), true));
  const weeks = HEAT.map((week, row) => ({
    head: t("data.weekStart", { date: fmt.dayMonth(lang, addDays(START, row * 7)) }),
    days: week.map((value, col): HeatDay | null => {
      if (value === undefined) return null;
      const day = addDays(START, row * 7 + col);
      const words = {
        weekday: fmt.weekday(lang, day),
        date: fmt.dayMonth(lang, day),
        value: value === null ? t("common.noValue") : t("data.heatGlasses", { count: value }),
      };
      return {
        level: level(value),
        sentence: t(day === TODAY ? "data.heatCellToday" : "data.heatCell", words),
        today: day === TODAY,
      };
    }),
  }));

  return (
    <figure className="sb-chart" aria-labelledby="app-d-heat-cap">
      <ul className="sb-scale-legend" aria-label={t("data.heatLegend")}>
        {t("data.heatClasses", { returnObjects: true }).map((name, at) => (
          <li key={name}>
            <span className={`sb-scale-cell sb-scale-cell--seq-${at + 1}`} aria-hidden="true" />
            {name}
          </li>
        ))}
        <li>
          <span className="sb-scale-cell sb-scale-cell--none" aria-hidden="true" />
          {t("common.noValue")}
        </li>
        <li>
          <span className="sb-scale-cell sb-heatmap__today-key" aria-hidden="true" />
          {t("data.todayFrame")}
        </li>
      </ul>
      <Heatmap labelledBy="app-d-heat-cap" heads={heads} weeks={weeks} hint={t("data.heatReadout")} />
      <details className="sb-chart__data">
        <summary>
          <Icon name="chevron-down--16" size={16} />
          {t("data.valuesTable")}
        </summary>
        <div className="sb-table-wrap" role="region" aria-label={t("data.heatNumbers")} tabIndex={0}>
          <table className="sb-table">
            <thead>
              <tr>
                <th scope="col">{t("data.week")}</th>
                {heads.map((head) => (
                  <th key={head} scope="col" className="sb-num">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEAT.map((week, row) => (
                <tr key={weeks[row].head}>
                  <th scope="row">{weeks[row].head}</th>
                  {week.map((value, col) => (
                    <td key={heads[col]} className="sb-num">
                      {value === null ? t("common.noValue") : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <figcaption id="app-d-heat-cap">
        {t("data.heatCaption")} <DemoMarker />
      </figcaption>
    </figure>
  );
}
