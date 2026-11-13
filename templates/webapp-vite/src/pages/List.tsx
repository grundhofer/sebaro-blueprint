// List.tsx: „Einträge“, the list with search, filter chips and the two empty states. The primary action „Neuer
// Eintrag“ stands in the action zone at the bottom of the view. From 840 px the list keeps standing at the start
// while the entry it opened, or the form, stands beside it.
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { CategoryWord } from "../components/CategoryWord";
import { DemoMarker } from "../components/DemoMarker";
import { ActionZone } from "../components/parts/ActionZone";
import { Chips } from "../components/parts/Chips";
import { Icon } from "../components/parts/Icon";
import { SearchField } from "../components/parts/SearchField";
import { View } from "../components/View";
import { useLang } from "../i18n";
import { matches, type Entry } from "../lib/entries";
import * as fmt from "../lib/format";
import { useEntries } from "../store/entries";
import { useListView } from "../store/list";

function Row({ entry, current }: { entry: Entry; current: boolean }) {
  const { t } = useTranslation();
  const lang = useLang();
  const open = entry.state === "open";
  return (
    <li className={open ? "sb-list-row" : "sb-list-row sb-list-row--done"} aria-current={current || undefined}>
      {!open && (
        <span className="sb-list-row__lead">
          <Icon name="success--filled-16" size={16} />
        </span>
      )}
      <div className="sb-list-row__main">
        <p className="sb-list-row__title">
          <Link className="sb-list-row__link" to={`/eintrag/${entry.id}`}>
            {entry.state !== "open" && <span className="sb-visually-hidden">{t(`list.${entry.state}Hidden`)}</span>}
            {entry.title}
          </Link>
        </p>
        {open && (
          <p className="sb-list-row__meta">
            {entry.category !== "none" && (
              <>
                <CategoryWord category={entry.category} />
                {" · "}
              </>
            )}
            {entry.due && (
              <>
                <time dateTime={entry.due}>{t("list.due", { date: fmt.date(lang, entry.due) })}</time>
                {" · "}
              </>
            )}
            {fmt.unit(lang, entry.effort, t("common.minutes"))}
          </p>
        )}
      </div>
      <span className="sb-list-row__trail">
        <Icon name="chevron-right" />
      </span>
    </li>
  );
}

function Group({ id, title, entries, current }: { id: string; title: string; entries: Entry[]; current?: string }) {
  if (!entries.length) return null;
  return (
    <>
      <h2 className="sb-list-header" id={id}>
        {title} <span className="sb-list-header__count">{entries.length}</span>
      </h2>
      <ul className="sb-list" aria-labelledby={id}>
        {entries.map((entry) => (
          <Row key={entry.id} entry={entry} current={entry.id === current} />
        ))}
      </ul>
    </>
  );
}

type Props = {
  /** an entry or the form is open: the list stands beside it */
  beside?: boolean;
  /** the id of the entry that is open */
  current?: string;
};

export function List({ beside, current }: Props) {
  const { t } = useTranslation();
  const entries = useEntries((state) => state.entries);
  const { query, filter, set } = useListView();
  const shown = entries.filter((entry) => matches(entry, filter, query.trim()));
  const stillOpen = entries.filter((entry) => entry.state === "open").length;

  return (
    <View name="liste" title={t("list.title")} beside={beside}>
      <div className="sb-view__content">
        <div className="sb-container sb-stack">
          <p>
            <Link to="/daten">{t("list.allTypes")}</Link> {entries.some((entry) => entry.demo) && <DemoMarker />}
          </p>
          <SearchField
            id="app-search"
            label={t("list.searchLabel")}
            placeholder={t("list.searchPlaceholder")}
            value={query}
            onChange={(value) => set({ query: value })}
          />
          <Chips
            label={t("list.filterLabel")}
            options={[
              { value: "all", label: t("list.filterAll") },
              { value: "open", label: t("list.filterOpen") },
              { value: "done", label: t("list.filterDone") },
            ]}
            value={filter}
            onChange={(value) => set({ filter: value })}
          />
          <div className="sb-stack" id="app-results">
            {!entries.length ? (
              <div className="sb-empty sb-empty--section">
                <p className="sb-empty__title">{t("list.emptyTitle")}</p>
                <p className="sb-empty__text">{t("list.emptyText")}</p>
              </div>
            ) : (
              <>
                <p className="sb-list-row__meta" role="status">
                  {shown.length ? t("list.count", { count: shown.length }) : t("list.countNone")}
                </p>
                {shown.length ? (
                  <>
                    <Group
                      id="app-h-open"
                      title={t("list.headerOpen")}
                      entries={shown.filter((e) => e.state === "open")}
                      current={current}
                    />
                    <Group
                      id="app-h-done"
                      title={t("list.headerDone")}
                      entries={shown.filter((e) => e.state !== "open")}
                      current={current}
                    />
                    <p className="sb-list-end">{t("list.end")}</p>
                  </>
                ) : (
                  <div className="sb-empty sb-empty--section">
                    <p className="sb-empty__title">{t("list.emptyFilterTitle")}</p>
                    <p className="sb-empty__text">{t("list.emptyFilterText")}</p>
                    <button
                      className="sb-text-action"
                      type="button"
                      onClick={() => {
                        set({ query: "", filter: "all" });
                        document.getElementById("app-search")?.focus();
                      }}
                    >
                      {t("list.emptyFilterReset")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ActionZone status={t("list.stillOpen", { count: stillOpen })} hint={t("common.localOnly")}>
        <Link className="sb-primary-action" to="/neu">
          <Icon name="plus" />
          <span className="sb-primary-action__label">{t("list.newEntry")}</span>
        </Link>
      </ActionZone>
    </View>
  );
}
