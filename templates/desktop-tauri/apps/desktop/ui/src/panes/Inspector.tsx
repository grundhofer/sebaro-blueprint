// Inspector.tsx: the pane at the end of the window: the properties of the note on screen, or of what the tree chose
// in the bin, with the bin's two actions.
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { action } from "../commands";
import { Icon } from "../components/parts/Icon";
import { useLang } from "../i18n";
import { date, dateTime, num } from "../lib/format";
import { kilobytes, words } from "../lib/notes";
import { useNotes } from "../store/notes";

type Props = { id: string; hidden: boolean; width: number | null };

function Pair({ label, number, children }: { label: string; number?: boolean; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={number ? "sb-num" : undefined}>{children}</dd>
    </div>
  );
}

export function Inspector({ id, hidden, width }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
  const { notes, current, binChoice } = useNotes();
  const note = notes.find((one) => one.id === current);
  const binned = notes.filter((one) => one.trashed);
  const chosen = binned.find((one) => one.id === binChoice);
  const folder = (one: typeof note) => one?.folder && t(`samples.folders.${one.folder}`);
  const changed = (iso: string) => <time dateTime={iso}>{dateTime(lang, iso)}</time>;

  return (
    <aside
      className="sb-window__inspector"
      id={id}
      aria-labelledby="inspektor-h"
      hidden={hidden}
      style={width === null ? undefined : { inlineSize: width }}
    >
      <h2 className="sb-window__inspector-title" id="inspektor-h">
        {t("inspector.label")}
      </h2>
      <dl className="sb-meta-list" id="eigenschaften">
        {binChoice === "bin" ? (
          <Pair label={t("inspector.bin")}>
            {t("inspector.binNotes", { count: binned.length, n: num(lang, binned.length) })}
          </Pair>
        ) : chosen ? (
          <>
            <Pair label={t("inspector.from")}>{folder(chosen) ?? t("inspector.fromRoot")}</Pair>
            <Pair label={t("inspector.changed")}>{changed(chosen.changed)}</Pair>
            <Pair label={t("inspector.words")} number>
              {num(lang, words(chosen))}
            </Pair>
          </>
        ) : note ? (
          <>
            <Pair label={t("inspector.folder")}>{folder(note) ?? t("inspector.noFolder")}</Pair>
            <Pair label={t("inspector.created")}>
              <time dateTime={note.created}>{date(lang, note.created)}</time>
            </Pair>
            <Pair label={t("inspector.changed")}>{changed(note.changed)}</Pair>
            <Pair label={t("inspector.words")} number>
              {num(lang, words(note))}
            </Pair>
            <Pair label={t("inspector.size")} number>
              {t("inspector.sizeValue", { n: num(lang, kilobytes(note)) })}
            </Pair>
          </>
        ) : (
          <Pair label={t("inspector.label")}>{t("inspector.empty")}</Pair>
        )}
      </dl>
      {/* the bin chosen in the tree: „Zurücklegen“ for a note in it, „Papierkorb leeren …“ for the bin itself */}
      {(chosen || (binChoice === "bin" && binned.length > 0)) && (
        <div className="app-inspector-actions">
          {chosen ? (
            <button className="sb-secondary-action" type="button" id="zuruecklegen" onClick={action("restore")}>
              {t("inspector.restore")}
            </button>
          ) : (
            <button className="sb-danger-action" type="button" id="leeren" onClick={action("emptyBin")}>
              <Icon name="trash" />
              {t("inspector.emptyTrash")}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
