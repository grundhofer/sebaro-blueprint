// ActionZone.tsx: the zone over the full width at the bottom of the window: the counter line, the sentence that
// answers a command or says what failed, the state sentence, and the one primary action, last.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { COMMANDS, keysOf } from "../commands";
import { useLang } from "../i18n";
import { num } from "../lib/format";
import { ariaKeys, platform } from "../lib/keys";
import { chars, words } from "../lib/notes";
import { useAppearance } from "../store/appearance";
import { useNotes } from "../store/notes";
import { Icon } from "./parts/Icon";

const LONE_KEYS = ["Shift", "Control", "Alt", "Meta", "AltGraph", "CapsLock", "Tab"];

export function ActionZone() {
  const { t } = useTranslation();
  const lang = useLang();
  const { notes, current, message, clearMessage } = useNotes();
  const failure = useAppearance((state) => state.failure);
  const note = notes.find((one) => one.id === current);
  // with no note open the counter line keeps the last counts, hidden: so the line keeps the place they take
  const [counted, setCounted] = useState(note);
  if (note && note !== counted) setCounted(note);
  const unsaved = notes.filter((one) => one.unsaved).length;

  // the sentence of a command stays until the next key or press
  useEffect(() => {
    const clear = (event: Event) => {
      if (!(event instanceof KeyboardEvent) || !LONE_KEYS.includes(event.key)) clearMessage();
    };
    document.addEventListener("keydown", clear, true);
    document.addEventListener("pointerdown", clear, true);
    return () => {
      document.removeEventListener("keydown", clear, true);
      document.removeEventListener("pointerdown", clear, true);
    };
  }, [clearMessage]);

  return (
    <div className="sb-bottom-block">
      <div className="sb-primary-action-bar">
        <p className="sb-primary-action-bar__counts" data-sb-held={note ? undefined : ""}>
          {counted && (
            <>
              <span>{t("zone.words", { count: words(counted), n: num(lang, words(counted)) })}</span>
              <span className="sb-visually-hidden"> · </span>
              <span>{t("zone.chars", { n: num(lang, chars(counted)) })}</span>
            </>
          )}
        </p>
        <div className="sb-primary-action-bar__message" role="status" data-sb-message="command">
          {failure ? (
            <>
              <Icon name="error--16" size={16} />
              <span>{t(`errors.${failure}`)}</span>
            </>
          ) : (
            message
          )}
        </div>
        <p className="sb-primary-action-bar__status" role="status" id="stand">
          {t("zone.saved", { count: unsaved, n: num(lang, unsaved) })}
        </p>
        <button
          className="sb-primary-action"
          type="button"
          id="neue-notiz"
          aria-keyshortcuts={ariaKeys(keysOf("newNote") ?? "", platform())}
          onClick={COMMANDS.newNote.run}
        >
          <Icon name="plus" />
          <span className="sb-primary-action__label">{t("zone.newNote")}</span>
          <i className="sb-primary-action__bar" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
