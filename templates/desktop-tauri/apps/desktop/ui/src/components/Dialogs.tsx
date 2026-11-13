// Dialogs.tsx: the questions the window asks before something is lost, and the list of the fixed shortcuts.
// „Abbrechen“ comes first and has the focus; the action that goes on comes last.
import { useTranslation } from "react-i18next";
import { useLang } from "../i18n";
import { num, time } from "../lib/format";
import { focusSoon } from "../lib/focus";
import { useNotes } from "../store/notes";
import { useWindow } from "../store/window";
import { tabId } from "./parts/DocTabs";
import { Dialog } from "./parts/Dialog";
import { Keys } from "./parts/Keys";

/** The 15 fixed shortcuts of every sebaro desktop app, in the order of the list: the chords, what the row says. */
const SHORTCUTS = [
  [["Mod+K"], "palette"],
  [["Mod+Comma"], "settings"],
  [["Mod+N"], "new"],
  [["Mod+O"], "open"],
  [["Mod+F"], "find"],
  [["Ctrl+Mod+S"], "sidebar"],
  [["Alt+Mod+I"], "inspector"],
  [["F6", "Shift+F6"], "areas"],
  [["Ctrl+Tab", "Ctrl+Shift+Tab"], "tabs"],
  [["Mod+W"], "close"],
  [["Shift+Mod+N"], "window"],
  [["Mod+Z", "Shift+Mod+Z"], "undo"],
  [["Mod+Backspace"], "trash"],
  [["Mod+Plus", "Mod+Minus"], "text"],
  [["Mod+Left", "Mod+Right"], "history"],
] as const;

export function Dialogs() {
  const { t } = useTranslation();
  const lang = useLang();
  const { notes, trash, emptyBin, close } = useNotes();
  const { overlay, closeOverlay } = useWindow();
  const asked = overlay && "id" in overlay ? notes.find((note) => note.id === overlay.id) : undefined;
  const name = asked?.name ?? "";
  const binned = notes.filter((note) => note.trashed);
  // where the focus goes when what had it is gone: the tab now on screen, else the sentence that no note is open
  const focusContent = () => focusSoon(`#${tabId(useNotes.getState().current ?? "")}`, ".sb-doc-tabs__none");

  const cancel = (
    <button className="sb-secondary-action" value="cancel">
      {t("common.cancel")}
    </button>
  );

  return (
    <>
      <Dialog
        id="dlg-papierkorb"
        open={overlay?.kind === "trash"}
        title={t("dialog.trashTitle", { name })}
        text={t("dialog.trashText", { name })}
        onClose={(value) => {
          closeOverlay();
          if (value !== "confirm" || !asked) return;
          trash(asked.id);
          focusContent();
        }}
      >
        {cancel}
        <button className="sb-danger-action sb-danger-action--outlined" value="confirm">
          {t("dialog.trashConfirm")}
        </button>
      </Dialog>

      <Dialog
        id="dlg-leeren"
        open={overlay?.kind === "empty"}
        title={t("dialog.emptyTitle")}
        text={t("dialog.emptyText", { count: binned.length, n: num(lang, binned.length), name: binned[0]?.name })}
        onClose={(value) => {
          closeOverlay();
          if (value !== "confirm") return;
          emptyBin();
          focusSoon('[data-row="bin"]');
        }}
      >
        {cancel}
        <button className="sb-danger-action sb-danger-action--outlined" value="confirm">
          {t("dialog.emptyConfirm")}
        </button>
      </Dialog>

      <Dialog
        id="dlg-ungesichert"
        open={overlay?.kind === "unsaved"}
        title={t("dialog.unsavedTitle", { name })}
        text={t("dialog.unsavedText", { time: asked ? time(lang, asked.changed) : "" })}
        onClose={(value) => {
          closeOverlay();
          // saved, or the changes are gone: the note itself stays, its tab closes
          if ((value !== "discard" && value !== "save") || !asked) return;
          close(asked.id);
          focusContent();
        }}
      >
        {cancel}
        <button className="sb-danger-action sb-danger-action--outlined" value="discard">
          {t("dialog.discard")}
        </button>
        <button className="sb-secondary-action" value="save">
          {t("dialog.save")}
        </button>
      </Dialog>

      <Dialog
        id="dlg-kuerzel"
        open={overlay?.kind === "shortcuts"}
        title={t("shortcuts.title")}
        text={t("shortcuts.intro")}
        onClose={closeOverlay}
        body={
          <div className="sb-table-wrap" role="region" aria-labelledby="kuerzel-cap" tabIndex={0}>
            <table className="sb-table">
              <caption id="kuerzel-cap">{t("shortcuts.caption")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("shortcuts.key")}</th>
                  <th scope="col">{t("shortcuts.what")}</th>
                </tr>
              </thead>
              <tbody>
                {SHORTCUTS.map(([chords, what]) => (
                  <tr key={what}>
                    <td>
                      {chords.map((chord, at) => (
                        <span key={chord}>
                          {at > 0 && " / "}
                          <Keys spec={chord} />
                        </span>
                      ))}
                    </td>
                    <td>{t(`shortcuts.${what}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      >
        <button className="sb-secondary-action" value="close">
          {t("common.close")}
        </button>
      </Dialog>
    </>
  );
}
