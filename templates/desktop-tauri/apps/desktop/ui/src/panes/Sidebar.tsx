// Sidebar.tsx: the pane at the start of the window: the search, the tree of folders and notes with the bin, and
// „Einstellungen“ in a foot that never scrolls.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { COMMANDS, keysOf } from "../commands";
import { Icon } from "../components/parts/Icon";
import { SearchField } from "../components/parts/SearchField";
import { Status } from "../components/parts/Status";
import { Tree, type TreeNode } from "../components/parts/Tree";
import { ariaKeys, platform } from "../lib/keys";
import { FOLDERS, matches, type Note } from "../lib/notes";
import { useNotes } from "../store/notes";
import { useWindow } from "../store/window";

const BIN = "bin";
const folderRow = (id: string) => `folder:${id}`;
const binRow = (id: string) => `${BIN}:${id}`;

type Props = { id: string; hidden: boolean; width: number | null };

export function Sidebar({ id, hidden, width }: Props) {
  const { t } = useTranslation();
  const { notes, current, binChoice, fresh, show, chooseInBin } = useNotes();
  const { folders, setFolder } = useWindow();
  const [query, setQuery] = useState("");
  const searching = query.trim() !== "";

  const row = (note: Note): TreeNode => ({
    id: note.id,
    name: note.name,
    icon: "file-text",
    enter: note.id === fresh,
    meta: note.unsaved ? (
      <Status tone="warning" icon="warning--16" small>
        {t("status.unsaved")}
      </Status>
    ) : note.online ? (
      <Status tone="neutral" icon="info--16" small>
        {t("status.online")}
      </Status>
    ) : undefined,
  });
  const found = notes.filter((note) => !note.trashed && matches(note, query));
  const binned = notes.filter((note) => note.trashed);
  const nodes: TreeNode[] = [
    ...FOLDERS.map((folder) => ({
      id: folderRow(folder),
      name: t(`samples.folders.${folder}`),
      icon: "folder",
      children: found.filter((note) => note.folder === folder).map(row),
    })).filter((folder) => !searching || folder.children.length),
    ...found.filter((note) => note.folder === null).map(row),
    // the bin takes nothing by dragging: a note goes there through its dialog. With notes in it, it opens like a
    // folder; choosing one of them shows „Zurücklegen“ in the inspector
    {
      id: BIN,
      name: t("side.trash"),
      icon: "trash",
      title: t("side.trashTitle"),
      children: binned.length
        ? binned.map((note) => ({ id: binRow(note.id), name: note.name, icon: "file-text" }))
        : undefined,
    },
  ];
  // while the search has words, every folder with a match is open
  const open = searching ? [...folders, ...FOLDERS.map(folderRow)] : folders;
  const selected = binChoice === BIN ? BIN : binChoice ? binRow(binChoice) : (current ?? undefined);

  const onSelect = (row: string) => {
    if (row === BIN) {
      chooseInBin(BIN);
      setFolder(BIN, !folders.includes(BIN));
    } else if (row.startsWith(`${BIN}:`)) chooseInBin(row.slice(BIN.length + 1));
    else if (row.startsWith("folder:")) setFolder(row, !folders.includes(row));
    else show(row);
  };

  return (
    <nav
      className="sb-side-nav sb-window__sidebar"
      id={id}
      aria-label={t("side.label")}
      hidden={hidden}
      style={width === null ? undefined : { inlineSize: width }}
    >
      <div className="sb-side-nav__scroll">
        <div className="app-side-search">
          <SearchField
            id="suche"
            label={t("side.search")}
            placeholder={t("side.searchPlaceholder")}
            value={query}
            onChange={setQuery}
          />
        </div>
        <div className="sb-side-nav__head">
          <p className="sb-side-nav__name" id="baum-h">
            {t("side.folders")}
          </p>
        </div>
        <Tree
          labelledBy="baum-h"
          nodes={nodes}
          open={open}
          selected={selected}
          onOpen={setFolder}
          onSelect={onSelect}
        />
        <p className="app-side-none" role="status">
          {searching && !found.length ? t("side.noMatch", { query: query.trim() }) : ""}
        </p>
      </div>
      <div className="sb-side-nav__foot">
        <ul>
          <li>
            <button
              className="sb-side-nav__item"
              type="button"
              id="zu-einstellungen"
              aria-keyshortcuts={ariaKeys(keysOf("settings") ?? "", platform())}
              onClick={COMMANDS.settings.run}
            >
              <Icon name="settings" />
              {t("side.settings")}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
