import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import { addDays } from "../../lib/calendar";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { BarList, GoalRing, ShareRows } from "./charts";
import { HeatmapChart } from "./HeatmapChart";
import { SeriesChart } from "./SeriesChart";
import { Section, Specimen, ValuesTable } from "./Specimen";

// all values are invented; „today“ is 10.10.2026, a Saturday
const TODAY = "2026-10-10";
const GLASSES = [8, 6, 8, 7, 4, 8, 5]; // the seven days up to today
const WEEKLY = [6.1, 6.5, 7.0, 6.8, 7.2, 7.5, 6.9, 7.4, 7.8, 7.6, 8.0, 7.1]; // twelve weeks from 20.07.
const LINE_SPANS = [2, 5, 4, 1]; // weeks per month under the line
const SHARES = [42, 27, 19, 12];
const WALKS = [2, 5, 9, 8, 4, 2]; // walks per ten minutes of duration
const DEVIATION = [0.5, -1, 1.5, -0.5, -2, 1, 0.5]; // hours against the mean, from 28.09.

export function ChartsSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const rows = t("data.rowNames", { returnObjects: true });
  const hours = t("common.hours");
  const percent = (value: number) => fmt.percent(lang, value);
  return (
    <Section name="charts">
      <Specimen title={t("data.bars")}>
        <figure className="sb-chart" aria-labelledby="app-d-bars-cap">
          <div className="sb-chart__plot">
            <div className="sb-chart__area">
              <svg
                className="sb-chart__shapes"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <line className="sb-chart__grid" x1="0" y1="50" x2="100" y2="50" />
              </svg>
              <BarList heights={GLASSES.map((glasses) => (glasses / 8) * 100)} current={6} />
              <svg
                className="sb-chart__shapes"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <line className="sb-chart__target" x1="0" y1="0" x2="100" y2="0" />
              </svg>
            </div>
            <ul className="sb-chart__ends" aria-hidden="true">
              <li data-sb-y="100">{t("data.goal", { goal: 8 })}</li>
              <li data-sb-y="50">4</li>
            </ul>
            <ol className="sb-chart__slots">
              {GLASSES.map((glasses, at) => {
                const day = addDays(TODAY, at - 6);
                return (
                  <li key={day} aria-current={day === TODAY ? "date" : undefined}>
                    <span className="sb-chart__label">{fmt.weekday(lang, day, true)}</span>
                    <span className="sb-chart__value">{glasses}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          <figcaption id="app-d-bars-cap">
            {t("data.barsCaption", { date: fmt.date(lang, TODAY) })} <DemoMarker />
          </figcaption>
        </figure>
      </Specimen>
      <Specimen title={t("data.line")}>
        <figure className="sb-chart" aria-labelledby="app-d-line-cap">
          <div className="sb-chart__plot">
            <div className="sb-chart__area">
              <svg
                className="sb-chart__shapes"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <line className="sb-chart__grid" x1="0" y1="71.43" x2="100" y2="71.43" />
                <line className="sb-chart__target" x1="0" y1="14.29" x2="100" y2="14.29" />
                <line className="sb-chart__axis" x1="0" y1="100" x2="100" y2="100" />
                <polyline
                  className="sb-chart__line"
                  points="4.17,68.57 12.5,57.14 20.83,42.86 29.17,48.57 37.5,37.14 45.83,28.57 54.17,45.71 62.5,31.43 70.83,20 79.17,25.71 87.5,14.29 95.83,40"
                />
                <line className="sb-chart__point sb-chart__point--current" x1="95.83" y1="40" x2="95.83" y2="40" />
              </svg>
            </div>
            <ul className="sb-chart__ends" aria-hidden="true">
              <li data-sb-y="86">{t("data.goal", { goal: 8 })}</li>
              <li className="sb-chart__end--current" data-sb-y="60">
                {fmt.num(lang, 7.1, 1)}
              </li>
              <li data-sb-y="29">6</li>
              <li data-sb-y="0">5</li>
            </ul>
            <ol className="sb-chart__slots sb-chart__slots--start" aria-hidden="true">
              {t("data.lineMonths", { returnObjects: true }).map((month, at) => (
                <li key={month} data-sb-span={LINE_SPANS[at]}>
                  {month}
                </li>
              ))}
            </ol>
          </div>
          <ValuesTable
            labelledBy="app-d-line-cap"
            head={[t("data.weekFrom"), t("data.glassesPerDay")]}
            rows={WEEKLY.map((glasses, week) => [
              fmt.dayMonth(lang, addDays("2026-07-20", week * 7)),
              fmt.num(lang, glasses, 1),
            ])}
          />
          <figcaption id="app-d-line-cap">
            {t("data.lineCaption")} <DemoMarker />
          </figcaption>
        </figure>
      </Specimen>
      <Specimen title={t("data.spark")}>
        <ul className="sb-stats">
          <li className="sb-stat">
            <p className="sb-stat__label">{t("data.sparkLabel")}</p>
            <p className="sb-stat__value">
              {fmt.num(lang, 7.1, 1)} {t("data.glasses")}
              <svg className="sb-sparkline" viewBox="0 0 96 28" aria-hidden="true" focusable="false">
                <polyline
                  className="sb-sparkline__line"
                  points="3,24 11.18,19.79 19.36,14.53 27.55,16.63 35.73,12.42 43.91,9.26 52.09,15.58 60.27,10.32 68.45,6.11 76.64,8.21 84.82,4 93,13.47"
                />
                <circle className="sb-sparkline__now" cx="93" cy="13.47" r="3" />
              </svg>
            </p>
          </li>
          <li className="sb-stat">
            <p className="sb-stat__label">{t("data.seriesL")}</p>
            <p className="sb-stat__value">{fmt.unit(lang, 12, t("data.daysWord"))}</p>
          </li>
        </ul>
      </Specimen>
      <Specimen title={t("data.rows")}>
        <figure className="sb-chart">
          <ShareRows names={rows} values={SHARES} />
          <figcaption>
            {t("data.rowsCaption")} <DemoMarker />
          </figcaption>
        </figure>
      </Specimen>
      <Specimen title={t("data.three")}>
        <SeriesChart count={3} captionId="app-d-three-cap" caption={t("data.threeCaption")} />
      </Specimen>
      <Specimen title={t("data.two")}>
        <SeriesChart count={2} captionId="app-d-two-cap" caption={t("data.twoCaption")} />
      </Specimen>
      <Specimen title={t("data.shares")}>
        <figure className="sb-chart">
          <ShareRows names={rows} values={SHARES} track />
          <figcaption>
            {t("data.sharesCaption")} <DemoMarker />
          </figcaption>
        </figure>
      </Specimen>
      <Specimen title={t("data.histogram")}>
        <figure className="sb-chart" aria-labelledby="app-d-hist-cap">
          <div className="sb-chart__plot">
            <div className="sb-chart__area">
              <BarList heights={WALKS.map((walks) => walks * 10)} counts={WALKS} />
            </div>
            <ol className="sb-chart__edges" aria-hidden="true">
              {[0, 10, 20, 30, 40, 50, 60].map((edge) => (
                <li key={edge}>{edge}</li>
              ))}
            </ol>
            <p className="sb-chart__unit" aria-hidden="true">
              {t("data.histUnit")}
            </p>
          </div>
          <ValuesTable
            labelledBy="app-d-hist-cap"
            head={[t("data.histDuration"), t("data.histWalks")]}
            rows={WALKS.map((walks, at) => [t("data.histBin", { from: at * 10, to: at * 10 + 10 }), String(walks)])}
          />
          <figcaption id="app-d-hist-cap">
            {t("data.histCaption")} <DemoMarker />
          </figcaption>
        </figure>
      </Specimen>
      <Specimen title={t("data.heatmap")}>
        <HeatmapChart />
      </Specimen>
      <Specimen title={t("data.deviation")}>
        <figure className="sb-chart" aria-labelledby="app-d-dev-cap">
          <div className="sb-chart__diverging">
            <p className="sb-chart__diverging-head">
              <span>{t("data.less")}</span>
              <span>{t("data.mid")}</span>
              <span>{t("data.more")}</span>
            </p>
            <ul className="sb-chart__rows sb-chart__rows--diverging">
              {DEVIATION.map((delta, at) => {
                const more = delta >= 0;
                return (
                  <li key={at} className="sb-chart__row">
                    <span className="sb-chart__name">{fmt.weekday(lang, addDays("2026-09-28", at), true)}</span>
                    <svg viewBox="-100 0 200 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                      <rect
                        className={`sb-chart__fill sb-chart__fill--${more ? "more" : "less"}`}
                        x={more ? 0 : delta * 50}
                        y="6"
                        width={Math.abs(delta) * 50}
                        height="12"
                      />
                      <line className="sb-chart__zero" x1="0" y1="0" x2="0" y2="24" />
                    </svg>
                    <span className="sb-chart__delta">
                      <Icon name={more ? "arrow-up--16" : "arrow-down--16"} size={16} />
                      {more ? "+" : "−"}
                      {fmt.unit(lang, Math.abs(delta), hours, 1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <figcaption id="app-d-dev-cap">
            {t("data.devCaption")} <DemoMarker />
          </figcaption>
        </figure>
      </Specimen>
      <Specimen title={t("data.goalRing")}>
        <div className="sb-cluster">
          <GoalRing done={5} label={t("data.glassesToday")} />
          <GoalRing done={8} label={t("data.glassesYesterday")} />
        </div>
      </Specimen>
      <Specimen title={t("data.keyFigure")}>
        <p className="sb-big-number">
          <span className="sb-big-number__value">5 / 8</span>
          <span className="sb-big-number__label">{t("data.glassesToday")}</span>
        </p>
        <ul className="sb-stats">
          <li className="sb-stat">
            <p className="sb-stat__label">{t("data.seriesL")}</p>
            <p className="sb-stat__value">{fmt.unit(lang, 12, t("data.daysWord"))}</p>
          </li>
          <li className="sb-stat">
            <p className="sb-stat__label">{t("data.rateL")}</p>
            <p className="sb-stat__value">{percent(86)}</p>
          </li>
          <li className="sb-stat">
            <p className="sb-stat__label">{t("data.bestL")}</p>
            <p className="sb-stat__value">{fmt.unit(lang, 31, t("data.daysWord"))}</p>
          </li>
        </ul>
      </Specimen>
      <Specimen title={t("data.ringT")}>
        <div className="sb-cluster">
          <div
            className="sb-progress-ring"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={60}
            aria-labelledby="app-d-ring-label"
          >
            <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <g transform="rotate(-90 24 24)">
                <circle className="sb-progress-ring__track" cx="24" cy="24" r="20" />
                <circle
                  className="sb-progress-ring__value"
                  cx="24"
                  cy="24"
                  r="20"
                  pathLength="100"
                  strokeDasharray="60 100"
                />
              </g>
            </svg>
            <span className="sb-progress-ring__text" aria-hidden="true">
              {percent(60)}
            </span>
          </div>
          <p id="app-d-ring-label">{t("data.uploading")}</p>
        </div>
      </Specimen>
    </Section>
  );
}
