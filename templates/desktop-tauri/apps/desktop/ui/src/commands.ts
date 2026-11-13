// commands.ts: what the menu, the palette and the fixed shortcuts run. One list: a command has one meaning and one
// shortcut wherever it stands. The shortcuts are written in their macOS form (lib/keys.ts).
import { panelId, tabId } from "./components/parts/DocTabs";
import { moveArea } from "./lib/areas";
import { focusSoon } from "./lib/focus";
import { useNotes } from "./store/notes";
import { paneOpen, useWindow } from "./store/window";

type Command = {
  keys?: string;
  /** What the command does. Without it the command has no target in this app: its item is shown, disabled. */
  run?: () => void;
  /** whether it can run now; always when not given */
  enabled?: () => boolean;
  /** the shortcut is taken also while the command cannot run, so it never reaches the webview's own history */
  hold?: boolean;
};

const notes = () => useNotes.getState();
const win = () => useWindow.getState();
const current = () => notes().notes.find((note) => note.id === notes().current);

/** Closes a tab. A note with changes asks first, unless „Beim Schließen sichern“ is on. */
export function closeTab(id: string): void {
  const note = notes().notes.find((one) => one.id === id);
  if (note?.unsaved && !win().autosave) win().open({ kind: "unsaved", id });
  else notes().close(id);
}

/** The next tab or the one before; the focus stays on the tabs or in the text, where it was. */
function cycleTab(by: 1 | -1): void {
  const { open, current: id, show } = notes();
  const next = open[(open.indexOf(id ?? "") + by + open.length) % open.length];
  if (!id || !next) return;
  const active = document.activeElement;
  const from = active?.closest("[role='tab']") ? tabId : active?.closest("[role='tabpanel']") ? panelId : null;
  show(next);
  if (from) focusSoon(`#${from(next)}`);
}

export const COMMANDS = {
  palette: {
    keys: "Mod+K",
    run: () => (win().overlay?.kind === "palette" ? win().closeOverlay() : win().open({ kind: "palette" })),
  },
  settings: { keys: "Mod+Comma", run: () => win().setView("settings") },
  newNote: { keys: "Mod+N", run: () => focusSoon(`#${tabId(notes().add())}`) },
  open: { keys: "Mod+O" },
  find: {
    keys: "Mod+F",
    run() {
      if (!paneOpen(win().panes.sidebar)) win().togglePane("sidebar", true);
      requestAnimationFrame(() => {
        const field = document.querySelector<HTMLInputElement>("#suche");
        field?.focus();
        field?.select();
      });
    },
  },
  sidebar: { keys: "Ctrl+Mod+S", run: () => win().togglePane("sidebar") },
  inspector: { keys: "Alt+Mod+I", run: () => win().togglePane("inspector") },
  nextArea: { keys: "F6", run: () => moveArea(false) },
  previousArea: { keys: "Shift+F6", run: () => moveArea(true) },
  nextTab: { keys: "Ctrl+Tab", run: () => cycleTab(1) },
  previousTab: { keys: "Ctrl+Shift+Tab", run: () => cycleTab(-1) },
  closeTab: { keys: "Mod+W", run: () => closeTab(notes().current ?? ""), enabled: () => notes().current !== null },
  newWindow: { keys: "Shift+Mod+N" },
  undo: { keys: "Mod+Z" },
  redo: { keys: "Shift+Mod+Z" },
  trash: {
    keys: "Mod+Backspace",
    run: () => win().open({ kind: "trash", id: notes().current ?? "" }),
    enabled: () => current() !== undefined,
  },
  restore: {
    run() {
      const id = notes().binChoice;
      notes().restore();
      focusSoon(`[data-row="${id}"]`);
    },
    enabled: () => notes().notes.some((note) => note.id === notes().binChoice && note.trashed),
  },
  emptyBin: { run: () => win().open({ kind: "empty" }), enabled: () => notes().notes.some((note) => note.trashed) },
  textBigger: { keys: "Mod+Plus", run: () => win().stepText(1) },
  textSmaller: { keys: "Mod+Minus", run: () => win().stepText(-1) },
  tabForward: { run: () => notes().move(-1) },
  tabBack: { run: () => notes().move(1) },
  back: { keys: "Mod+Left", hold: true },
  forward: { keys: "Mod+Right", hold: true },
  shortcuts: { run: () => win().open({ kind: "shortcuts" }) },
  facts: {},
} satisfies Record<string, Command>;

export type CommandId = keyof typeof COMMANDS;

/** What a menu item or a palette option presses: the command, or nothing while it cannot run. */
export function action(id: CommandId): (() => void) | undefined {
  const command: Command = COMMANDS[id];
  return command.run && (command.enabled?.() ?? true) ? command.run : undefined;
}

export const keysOf = (id: CommandId): string | undefined => (COMMANDS[id] as Command).keys;
