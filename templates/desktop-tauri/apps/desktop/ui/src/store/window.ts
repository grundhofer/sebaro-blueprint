// window.ts: what the window shows beside its notes: the view, the side panes and their widths, the overlay that is
// open, the text size of the content, and the setting „Beim Schließen sichern“. The pane widths and that setting
// stay on this device (localStorage).
import { create } from "zustand";
import type { Pane } from "../lib/panes";

export type Overlay =
  | { kind: "palette" | "shortcuts" | "empty" }
  /** asks before the note `id` goes to the bin, or before its tab closes with unsaved changes */
  | { kind: "trash" | "unsaved"; id: string };

/** The steps of ⌘+ and ⌘−: they change the text of the content only. */
export const TEXT_STEPS = [0.875, 1, 1.125, 1.25, 1.5];

type PaneState = {
  /** what the person chose; it holds while the window is wide enough for the pane beside the content */
  wanted: boolean;
  /** the window is too narrow: the pane lies over the content's edge, and only while `shown` */
  overlay: boolean;
  shown: boolean;
  /** the chosen width in px; null: the start width of the copy */
  width: number | null;
};

type WindowState = {
  view: "main" | "settings";
  panes: Record<Pane, PaneState>;
  overlay: Overlay | null;
  textStep: number;
  autosave: boolean;
  /** the folders that are open in the tree */
  folders: string[];
  setView(view: WindowState["view"]): void;
  /** Shows or hides a pane; without `to` it turns over. */
  togglePane(pane: Pane, to?: boolean): void;
  /** The window became too narrow for the pane beside the content, or wide enough again. */
  setPaneOverlay(pane: Pane, overlay: boolean): void;
  setPaneWidth(pane: Pane, width: number): void;
  open(overlay: Overlay): void;
  closeOverlay(): void;
  stepText(by: -1 | 1): void;
  setAutosave(on: boolean): void;
  setFolder(id: string, open: boolean): void;
};

const stored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked: the value holds until the window closes
  }
};
const widthKey = (pane: Pane) => `sb-pane:main:${pane}`;
const pane = (name: Pane): PaneState => {
  const width = parseInt(stored(widthKey(name)) ?? "", 10);
  return { wanted: true, overlay: false, shown: true, width: Number.isFinite(width) ? width : null };
};

/** Whether a pane is on screen. */
export const paneOpen = (state: PaneState) => (state.overlay ? state.shown : state.wanted);

export const useWindow = create<WindowState>()((set, get) => ({
  view: "main",
  panes: { sidebar: pane("sidebar"), inspector: pane("inspector") },
  overlay: null,
  textStep: 1,
  autosave: stored("app-autosave") === "on",
  folders: ["folder:projekte"],
  setView: (view) => set({ view }),
  togglePane(name, to) {
    const state = get().panes[name];
    const open = to ?? !paneOpen(state);
    // an overlay pane is opened and closed for the moment; the choice for a wide window stays
    const next = state.overlay ? { ...state, shown: open } : { ...state, wanted: open };
    set({ panes: { ...get().panes, [name]: next } });
  },
  setPaneOverlay(name, overlay) {
    const state = get().panes[name];
    // an overlay never starts open: the side panes give way first
    if (state.overlay !== overlay) set({ panes: { ...get().panes, [name]: { ...state, overlay, shown: false } } });
  },
  setPaneWidth(name, width) {
    store(widthKey(name), String(width));
    set({ panes: { ...get().panes, [name]: { ...get().panes[name], width } } });
  },
  open: (overlay) => set({ overlay }),
  closeOverlay: () => set({ overlay: null }),
  stepText(by) {
    set({ textStep: Math.max(0, Math.min(TEXT_STEPS.length - 1, get().textStep + by)) });
  },
  setAutosave(on) {
    store("app-autosave", on ? "on" : "off");
    set({ autosave: on });
  },
  setFolder(id, open) {
    const rest = get().folders.filter((folder) => folder !== id);
    set({ folders: open ? [...rest, id] : rest });
  },
}));
