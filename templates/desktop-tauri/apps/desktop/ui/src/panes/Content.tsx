// Content.tsx: the pane in the middle: the tabs of the open notes and the text of the one on screen.
import { useEffect, useRef, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { closeTab } from "../commands";
import { DemoMarker } from "../components/DemoMarker";
import { DocTabs, panelId, tabId } from "../components/parts/DocTabs";
import { useLang } from "../i18n";
import { dateTime } from "../lib/format";
import { ariaKeys, platform } from "../lib/keys";
import { useNotes } from "../store/notes";
import { TEXT_STEPS, useWindow } from "../store/window";

export function Content({ id }: { id: string }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { notes, open, current, binChoice, show, chooseInBin } = useNotes();
  const textStep = useWindow((state) => state.textStep);
  const none = useRef<HTMLParagraphElement>(null);
  const tabs = open.flatMap((tab) => notes.filter((note) => note.id === tab));

  // the last tab closed while it had the focus: the sentence that says so takes it, never the page
  useEffect(() => {
    if (!open.length && document.activeElement === document.body) none.current?.focus();
  }, [open.length]);

  return (
    <main
      className="sb-window__content"
      id={id}
      // back in the note: the inspector shows it again, not what the tree chose in the bin
      onFocus={() => binChoice !== null && chooseInBin(null)}
      // ⌘+ and ⌘− change the text of the content only (app.css reads the scale)
      style={{ "--app-doc-scale": TEXT_STEPS[textStep] } as CSSProperties}
    >
      <DocTabs
        label={t("tabs.label")}
        tabs={tabs.map((note) => ({ id: note.id, name: note.name, icon: "file-text", changed: note.unsaved }))}
        selected={current}
        changedWord={t("tabs.changed")}
        closeWord={t("tabs.close")}
        closeKeys={`${ariaKeys("Mod+W", platform())} Delete`}
        onSelect={show}
        onClose={closeTab}
      />
      <p ref={none} className="sb-doc-tabs__none" tabIndex={-1} hidden={open.length > 0}>
        {t("tabs.none")}
      </p>
      {tabs.map((note) => (
        <div
          key={note.id}
          className="sb-doc-tabs__panel"
          role="tabpanel"
          id={panelId(note.id)}
          aria-labelledby={tabId(note.id)}
          tabIndex={0}
          hidden={note.id !== current}
        >
          <h1 className="sb-window__heading">{note.name}</h1>
          <p className="sb-window__meta">
            {t("note.meta", {
              folder: note.folder ? t(`samples.folders.${note.folder}`) : t("inspector.noFolder"),
              when: dateTime(lang, note.changed),
            })}
            {" · "}
            <DemoMarker />
          </p>
          <div className="sb-prose app-doc">
            {(note.text.length ? note.text : [t("note.empty")]).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
