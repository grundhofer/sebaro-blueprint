import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import { addDays, addMonths, column, firstWeekday, iso, weeks } from "../../lib/calendar";
import * as fmt from "../../lib/format";
import { Icon } from "./Icon";

type Props = {
  /** the day chosen at first, "YYYY-MM-DD"; its month is shown */
  selected: string;
  /** today; left out, it is the device's date */
  today?: string;
  /** the entries by day */
  entries: Record<string, ReadonlyArray<{ time: string; text: string }>>;
  /** what the list says for a day without entries */
  none: string;
};

/** A month with the list of the chosen day. The grid has one tab stop: the arrows move by a day or a week, Home
 *  and End to the ends of the week, Page up and down by a month (with Shift by a year); Enter, Space or a press
 *  chooses the day. */
export function Calendar({ selected: start, today = iso(new Date()), entries, none }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
  const [selected, setSelected] = useState(start);
  const [stop, setStop] = useState(start);
  const grid = useRef<HTMLTableElement>(null);
  const moved = useRef(false);
  const title = useId();
  const first = firstWeekday(lang);
  const month = stop.slice(0, 7);

  // a step with the keys focuses its day once the grid shows it (it may be in another month)
  useEffect(() => {
    if (moved.current) grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    moved.current = false;
  }, [stop]);

  const go = (day: string) => {
    moved.current = true;
    setStop(day);
  };
  // another month: its tab stop is the chosen day, else the 1st
  const step = (months: number) => {
    const to = addMonths(`${month}-01`, months);
    setStop(selected.startsWith(to.slice(0, 7)) ? selected : to);
  };
  const onKeyDown = (event: KeyboardEvent, day: string) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const at = column(day, first);
    if (event.key === "ArrowRight") go(addDays(day, 1));
    else if (event.key === "ArrowLeft") go(addDays(day, -1));
    else if (event.key === "ArrowDown") go(addDays(day, 7));
    else if (event.key === "ArrowUp") go(addDays(day, -7));
    else if (event.key === "Home") go(addDays(day, -at));
    else if (event.key === "End") go(addDays(day, 6 - at));
    else if (event.key === "PageUp") go(addMonths(day, event.shiftKey ? -12 : -1));
    else if (event.key === "PageDown") go(addMonths(day, event.shiftKey ? 12 : 1));
    else if (event.key === "Enter" || event.key === " ") setSelected(day);
    else return;
    event.preventDefault();
  };
  const name = (day: string) =>
    [fmt.dateLong(lang, day), day === today && t("common.today"), entries[day] && t("common.withEntry")]
      .filter(Boolean)
      .join(", ");
  // the week of 2024-01-01 began on a Monday
  const heads = Array.from({ length: 7 }, (_, at) => addDays("2024-01-01", first - 1 + at));
  const list = entries[selected];

  return (
    <div className="sb-calendar">
      <div className="sb-calendar__body">
        <div className="sb-calendar__month">
          <div className="sb-calendar__head">
            <p className="sb-calendar__title" id={title} aria-live="polite">
              {fmt.monthYear(lang, `${month}-01`)}
            </p>
            <div className="sb-calendar__nav">
              <button
                className="sb-icon-button"
                type="button"
                aria-label={t("common.previousMonth")}
                onClick={() => step(-1)}
              >
                <Icon name="chevron-left" />
              </button>
              <button
                className="sb-icon-button"
                type="button"
                aria-label={t("common.nextMonth")}
                onClick={() => step(1)}
              >
                <Icon name="chevron-right" />
              </button>
            </div>
          </div>
          <table ref={grid} className="sb-calendar__grid" role="grid" aria-labelledby={title}>
            <thead>
              <tr>
                {heads.map((day) => (
                  <th key={day} scope="col" abbr={fmt.weekday(lang, day)}>
                    {fmt.weekday(lang, day, true)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks(month, first).map((week, at) => (
                <tr key={`${month}-${at}`}>
                  {week.map((day, place) =>
                    day ? (
                      <td
                        key={day}
                        className="sb-calendar__day"
                        tabIndex={day === stop ? 0 : -1}
                        aria-current={day === today ? "date" : undefined}
                        aria-selected={day === selected ? true : undefined}
                        data-sb-entry={entries[day] ? "" : undefined}
                        onKeyDown={(event) => onKeyDown(event, day)}
                        onClick={() => {
                          setStop(day);
                          setSelected(day);
                        }}
                      >
                        <span className="sb-calendar__date" aria-hidden="true">
                          {Number(day.slice(8))}
                        </span>
                        <span className="sb-visually-hidden">{name(day)}</span>
                      </td>
                    ) : (
                      <td key={`${month}-${at}-${place}`} />
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sb-calendar__agenda">
          <h4 className="sb-calendar__agenda-title">{fmt.dateLong(lang, selected)}</h4>
          {list ? (
            <ul className="sb-calendar__entries">
              {list.map((entry) => (
                <li key={entry.time} className="sb-calendar__entry">
                  <time dateTime={`${selected}T${entry.time}`}>{entry.time}</time>
                  <span>{entry.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sb-calendar__none">{none}</p>
          )}
        </div>
      </div>
    </div>
  );
}
