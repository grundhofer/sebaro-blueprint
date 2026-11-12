import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { Listbox } from "../parts/Listbox";
import { SortTable } from "../parts/SortTable";
import { Status } from "../parts/Status";
import { Tree } from "../parts/Tree";
import { Section, Specimen } from "./Specimen";

// days of seven, rate in percent, streak in days
const HABITS = [
  [7, 100, 31],
  [6, 86, 12],
  [5, 71, 4],
  [4, 57, 2],
] as const;
// an amount that is not known is a gap, never 0
const SPEND = [
  ["2026-10-01", 1250],
  ["2026-10-03", 412.3],
  ["2026-10-08", 38.9],
  ["2026-10-06", null],
] as const;

export function CollectionsSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const habits = t("data.habits", { returnObjects: true });
  const purposes = t("data.purposes", { returnObjects: true });
  const projects = t("data.multiNames", { returnObjects: true }).map((name, at) => ({
    id: String(at),
    name,
    icon: "file-text",
  }));
  const [chosen, setChosen] = useState(["0", "1", "3"]);
  const week = { from: fmt.dayMonth(lang, "2026-10-04"), to: fmt.date(lang, "2026-10-10") };
  const known = SPEND.reduce((sum, [, amount]) => sum + (amount ?? 0), 0);
  const doneRows = [
    ["2026-10-10T08:12", t("data.doneRow1")],
    ["2026-10-10T07:40", t("data.doneRow2")],
  ] as const;

  return (
    <Section name="collections">
      <Specimen title={t("data.listT")}>
        <ul className="sb-list">
          {[
            [t("data.listRow1"), t("data.listRow1Meta")],
            [t("data.listRow2"), t("data.listRow2Meta")],
          ].map(([title, meta]) => (
            <li key={title} className="sb-list-row">
              <div className="sb-list-row__main">
                <p className="sb-list-row__title">
                  <Link className="sb-list-row__link" to="/">
                    {title}
                  </Link>
                </p>
                <p className="sb-list-row__meta">{meta}</p>
              </div>
              <span className="sb-list-row__trail">
                <Icon name="chevron-right" />
              </span>
            </li>
          ))}
        </ul>
        <p className="sb-list-end">{t("data.listEnd")}</p>
      </Specimen>
      <Specimen title={t("data.doneRows")}>
        <p className="sb-day-summary">
          {t("data.stateSentence", { done: 3, all: 5, percent: fmt.percent(lang, 60) })}{" "}
          {t("list.stillOpen", { count: 2 })}
        </p>
        <p className="sb-list-header">
          {t("list.headerOpen")} <span className="sb-list-header__count">2</span>
        </p>
        <ul className="sb-list">
          <li className="sb-list-row">
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.listRow1")}</p>
              <p className="sb-list-row__meta">{t("data.listRow1Meta")}</p>
            </div>
            <Status tone="info" icon="progress">
              {t("data.running")}
            </Status>
          </li>
          <li className="sb-list-row">
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.longRowTitle")}</p>
              <p className="sb-list-row__meta">{t("data.longRowMeta")}</p>
            </div>
            <Status tone="neutral" icon="clock">
              {t("data.planned")}
            </Status>
          </li>
        </ul>
        <p className="sb-list-header">
          {t("list.headerDone")} <span className="sb-list-header__count">2</span>
        </p>
        <ul className="sb-list">
          {doneRows.map(([at, title]) => (
            <li key={at} className="sb-list-row sb-list-row--done">
              <span className="sb-list-row__lead">
                <Icon name="success--filled-16" size={16} />
              </span>
              <div className="sb-list-row__main">
                <p className="sb-list-row__title">
                  <span className="sb-visually-hidden">{t("list.doneHidden")}</span>
                  {title}
                </p>
              </div>
              <span className="sb-list-row__trail">
                <time dateTime={at}>{fmt.time(lang, at)}</time>
              </span>
            </li>
          ))}
        </ul>
      </Specimen>
      <Specimen title={t("data.tableT")}>
        <div className="sb-table-wrap" role="region" aria-labelledby="app-d-tab-cap" tabIndex={0}>
          <table className="sb-table">
            <caption id="app-d-tab-cap">
              {t("data.tableCaption", week)} <DemoMarker />
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("data.habit")}</th>
                <th scope="col" className="sb-num">
                  {t("data.daysCol")}
                </th>
                <th scope="col" className="sb-num">
                  {t("data.rate")}
                </th>
                <th scope="col" className="sb-num">
                  {t("data.streak")}
                </th>
              </tr>
            </thead>
            <tbody>
              {HABITS.map(([days, rate, streak], at) => (
                <tr key={habits[at]}>
                  <th scope="row">{habits[at]}</th>
                  <td className="sb-num">{t("data.ofN", { n: days, all: 7 })}</td>
                  <td className="sb-num">{fmt.percent(lang, rate)}</td>
                  <td className="sb-num">{fmt.unit(lang, streak, t("data.daysWord"))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Specimen>
      <Specimen title={t("data.sortTable")}>
        <SortTable
          captionId="app-d-sum-cap"
          caption={
            <>
              {t("data.sortCaption")} <DemoMarker />
            </>
          }
          columns={[
            { label: t("data.colDate") },
            { label: t("data.colPurpose") },
            { label: t("data.colAmount"), numeric: true },
          ]}
          rows={SPEND.map(([day, amount], at) => ({
            key: day,
            cells: [
              <time dateTime={day}>{fmt.dayMonth(lang, day)}</time>,
              purposes[at],
              amount === null ? t("common.noValue") : fmt.money(lang, amount),
            ],
            values: [Date.parse(day), purposes[at], amount],
          }))}
          foot={
            <tr>
              <th scope="row" colSpan={2}>
                {t("data.sumKnown")}
              </th>
              <td className="sb-num">{fmt.money(lang, known)}</td>
            </tr>
          }
          sorted={{ column: 2, direction: "descending" }}
        />
      </Specimen>
      <Specimen title={t("data.keyValue")}>
        <dl className="sb-meta-list">
          <div>
            <dt>{t("data.kvReminder")}</dt>
            <dd>{t("data.kvReminderV")}</dd>
          </div>
          <div>
            <dt>{t("data.kvCategory")}</dt>
            <dd>{t("data.catHealth")}</dd>
          </div>
          <div>
            <dt>{t("data.kvGoal")}</dt>
            <dd>{fmt.unit(lang, 8, t("data.glasses"))}</dd>
          </div>
          <div>
            <dt>{t("data.kvCreated")}</dt>
            <dd>
              <time dateTime="2026-03-12">{fmt.date(lang, "2026-03-12")}</time>
            </dd>
          </div>
        </dl>
      </Specimen>
      <Specimen title={t("data.tree")}>
        <p>{t("data.treeNote")}</p>
        <div className="app-touch-rows">
          <p className="sb-side-nav__head" id="app-d-tree-h">
            {t("data.treeHead")}
          </p>
          <Tree
            labelledBy="app-d-tree-h"
            nodes={[
              {
                id: "projects",
                name: t("data.treeProjects"),
                icon: "folder",
                children: [
                  {
                    id: "week",
                    name: t("data.treeWeek"),
                    icon: "file-text",
                    meta: (
                      <Status tone="warning" icon="warning--16" small>
                        {t("data.notSaved")}
                      </Status>
                    ),
                  },
                  { id: "garden", name: t("data.treeGarden"), icon: "file-text" },
                ],
              },
              {
                id: "archive",
                name: t("data.treeArchive"),
                icon: "folder",
                children: [{ id: "move", name: t("data.treeOld"), icon: "file-text" }],
              },
            ]}
            open={["projects"]}
            selected="week"
          />
        </div>
      </Specimen>
      <Specimen title={t("data.multi")}>
        <p>{t("data.multiNote")}</p>
        <div className="app-touch-rows">
          <p className="sb-list-header" id="app-d-sel-h">
            {t("data.multiHead")}
          </p>
          <Listbox labelledBy="app-d-sel-h" options={projects} selected={chosen} onChange={setChosen} start="1" />
          <p className="sb-list-row__meta" role="status">
            {t("data.selected", { count: chosen.length })}
          </p>
        </div>
      </Specimen>
      <Specimen title={t("data.cardsMany")}>
        <ul className="sb-stack" aria-label={t("data.cardsLabel")}>
          {t("data.cards", { returnObjects: true }).map((card, at) => (
            <li key={card.title} className="sb-card sb-card--item" aria-current={at === 1 ? "true" : undefined}>
              <p className="sb-card__title">{card.title}</p>
              <p className="sb-card__text">{card.text}</p>
            </li>
          ))}
        </ul>
      </Specimen>
      <Specimen title={t("data.cardGrid")}>
        <div className="app-card-grid">
          {t("data.gridCards", { returnObjects: true }).map((card) => (
            <div key={card.title} className="sb-card">
              <h4 className="sb-card__title">{card.title}</h4>
              <p className="sb-card__text">{card.text}</p>
              <div className="sb-card__actions">
                <button className="sb-secondary-action" type="button">
                  {card.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Specimen>
    </Section>
  );
}
