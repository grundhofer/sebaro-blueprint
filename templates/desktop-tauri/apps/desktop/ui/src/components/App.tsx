// App.tsx: the one window. It shows the main view or „Einstellungen“, and over either the palette and the dialogs.
// Here the window listens for the fixed shortcuts and remembers where the focus is.
import { lazy, Suspense, useEffect, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { COMMANDS } from "../commands";
import { noteFocus } from "../lib/areas";
import { platform, pressed } from "../lib/keys";
import { useNotes } from "../store/notes";
import { useWindow } from "../store/window";
import { CommandPalette } from "./CommandPalette";
import { Dialogs } from "./Dialogs";
import { MainWindow } from "./MainWindow";

// what the start does not need is loaded when it opens
const Settings = lazy(() => import("../panes/Settings"));

type Command = { keys?: string; run?: () => void; enabled?: () => boolean; hold?: boolean };
const TEXT_FIELD = "input:not([type='checkbox'], [type='radio']), textarea, [contenteditable]";
// in a text field these chords belong to the text: ⌘⌫ and Entf delete, ⌘← and ⌘→ move to the ends of the line
const FIELD_KEYS = ["trash", "back", "forward"];

/** A fixed shortcut runs its command. A text field keeps the keys that edit its text; while a dialog asks, only
 *  the palette's own shortcut is heard, which closes it. */
function onShortcut(event: KeyboardEvent) {
  const on = platform();
  const found = Object.entries<Command>(COMMANDS).find(
    ([, command]) => command.keys && pressed(event, command.keys, on),
  );
  if (!found) return;
  const [id, command] = found;
  if (document.querySelector("dialog[open]") && id !== "palette") return;
  if (FIELD_KEYS.includes(id) && event.target instanceof Element && event.target.closest(TEXT_FIELD)) return;
  if (command.run && (command.enabled?.() ?? true)) command.run();
  else if (!command.hold) return;
  event.preventDefault();
}

export function App() {
  const { t } = useTranslation();
  const view = useWindow((state) => state.view);
  const place = useNotes((state) => state.notes.find((note) => note.id === state.current)?.name);

  useEffect(() => {
    const root = document.documentElement;
    const onFocus = (event: FocusEvent) => noteFocus(event.target);
    // a window that is not in front lets its path recede (the copy's stylesheet)
    const onBlur = () => (root.dataset.sbWindowActive = "false");
    const onFront = () => delete root.dataset.sbWindowActive;
    window.addEventListener("keydown", onShortcut);
    document.addEventListener("focusin", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFront);
    return () => {
      window.removeEventListener("keydown", onShortcut);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFront);
    };
  }, []);

  // the skip link moves the focus to the content and leaves the address as it is
  const skip = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById("inhalt")?.focus();
  };

  return (
    <>
      <a className="sb-skip-link" href="#inhalt" onClick={skip}>
        {t("app.skip")}
      </a>
      {view === "main" ? (
        <MainWindow />
      ) : (
        <Suspense>
          <Settings back={place ?? t("app.name")} />
        </Suspense>
      )}
      <CommandPalette />
      <Dialogs />
    </>
  );
}
