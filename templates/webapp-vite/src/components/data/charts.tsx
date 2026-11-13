// charts.tsx: the shapes the chart specimens share. Sizes and places are SVG attributes or the hooks data-sb-y and
// data-sb-span of the copy's stylesheet: no style attribute.
import { useTranslation } from "react-i18next";
import { Icon } from "../parts/Icon";

/** Bars as a list: each height in percent of the plot; `current` is the bar of the current period. */
export function BarList({ heights, current, counts }: { heights: number[]; current?: number; counts?: number[] }) {
  return (
    <ol className={counts ? "sb-chart__bars sb-chart__bars--dense" : "sb-chart__bars"} aria-hidden="true">
      {heights.map((height, at) => (
        <li key={at}>
          <svg viewBox="0 0 1 1" preserveAspectRatio="none" height={`${height}%`} focusable="false">
            <rect
              className={at === current ? "sb-chart__bar sb-chart__bar--current" : "sb-chart__bar"}
              x={counts ? undefined : 0.18}
              width={counts ? 1 : 0.64}
              height="1"
            />
          </svg>
          {counts && (
            <span className="sb-chart__count" data-sb-y={Math.round(height)}>
              {counts[at]}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Rows with a name, its value and a bar; with `track` each bar stands on the grey whole. */
export function ShareRows({ names, values, track }: { names: string[]; values: number[]; track?: boolean }) {
  return (
    <ul className="sb-chart__rows">
      {values.map((value, at) => (
        <li key={names[at]} className="sb-chart__row">
          <span className="sb-chart__name">
            {names[at]} <b>{value}</b>
          </span>
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {track && <rect className="sb-chart__track" width="100" height="12" />}
            <rect className="sb-chart__fill" width={track ? value : value * 2} height="12" />
          </svg>
        </li>
      ))}
    </ul>
  );
}

const RING = [
  "M59.77 8.15 A48 48 0 0 1 87.17 19.5",
  "M92.5 24.83 A48 48 0 0 1 103.85 52.23",
  "M103.85 59.77 A48 48 0 0 1 92.5 87.17",
  "M87.17 92.5 A48 48 0 0 1 59.77 103.85",
  "M52.23 103.85 A48 48 0 0 1 24.83 92.5",
  "M19.5 87.17 A48 48 0 0 1 8.15 59.77",
  "M8.15 52.23 A48 48 0 0 1 19.5 24.83",
  "M24.83 19.5 A48 48 0 0 1 52.23 8.15",
];

/** A goal of eight parts, `done` of them reached. */
export function GoalRing({ done, label }: { done: number; label: string }) {
  const { t } = useTranslation();
  return (
    <figure className="sb-goal-ring">
      <div className="sb-goal-ring__ring">
        <svg viewBox="0 0 112 112" aria-hidden="true" focusable="false">
          {RING.map((part, at) => (
            <path key={part} className="sb-goal-ring__part" data-sb-state={at < done ? "done" : undefined} d={part} />
          ))}
        </svg>
        <p className="sb-goal-ring__text">
          {done}
          <br />
          {t("data.ofGoal", { goal: RING.length })}
        </p>
      </div>
      <figcaption>{label}</figcaption>
      {done === RING.length && (
        <p className="sb-status sb-status--success">
          <Icon name="success--filled" size={20} />
          {t("data.reached")}
        </p>
      )}
    </figure>
  );
}
