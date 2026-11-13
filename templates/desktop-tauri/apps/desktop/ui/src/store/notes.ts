// notes.ts: the notes, the tabs that are open and what is chosen. The store holds them; what may happen to a note
// is in lib/notes.ts. The notes are examples and live as long as the window: a product reads and writes its
// documents through commands of the Rust side.
import { create } from "zustand";
import i18n from "../i18n";
import { blank, closeTab, moveTab, seed, type Note } from "../lib/notes";

type Notes = {
  notes: Note[];
  /** the ids of the open tabs in their order, and the tab on screen */
  open: string[];
  current: string | null;
  /** what the tree chose in the bin: "bin" (its row) or the id of a note in it; null: the inspector shows the
   *  current note */
  binChoice: string | null;
  /** how many notes were made in this session, for their names */
  made: number;
  /** the id of the note made last: its row enters the tree */
  fresh: string | null;
  /** the sentence in the action zone that answers the last command; "" for none */
  message: string;
  /** Opens a note in a tab, or shows its tab. */
  show(id: string): void;
  /** Makes a note, opens it and returns its id. */
  add(): string;
  /** Closes a tab. A note with changes is saved or loses them first: the caller has asked. */
  close(id: string): void;
  move(by: -1 | 1): void;
  chooseInBin(choice: string | null): void;
  trash(id: string): void;
  /** Puts the note chosen in the bin back into its folder. */
  restore(): void;
  emptyBin(): void;
  clearMessage(): void;
};

export const useNotes = create<Notes>()((set, get) => ({
  notes: seed(i18n.t("samples.notes", { returnObjects: true })),
  open: ["wochenplan", "einkauf"],
  current: "wochenplan",
  binChoice: null,
  made: 0,
  fresh: null,
  message: "",
  show(id) {
    const { open } = get();
    set({ open: open.includes(id) ? open : [...open, id], current: id, binChoice: null });
  },
  add() {
    const made = get().made + 1;
    const note = blank(made, i18n.t("zone.newNoteName", { n: made }), new Date());
    set({ notes: [...get().notes, note], made, fresh: note.id });
    get().show(note.id);
    return note.id;
  },
  close(id) {
    const { notes, open, current } = get();
    set({
      ...closeTab(open, current, id),
      notes: notes.map((note) => (note.id === id ? { ...note, unsaved: false } : note)),
    });
  },
  move(by) {
    const { open, current } = get();
    if (current) set({ open: moveTab(open, current, by) });
  },
  chooseInBin(choice) {
    set({ binChoice: choice });
  },
  trash(id) {
    const { notes, open, current } = get();
    const note = notes.find((one) => one.id === id);
    if (!note || note.trashed) return;
    set({
      ...closeTab(open, current, id),
      notes: notes.map((one) => (one.id === id ? { ...one, trashed: true } : one)),
      message: i18n.t("zone.trashed", { name: note.name }),
    });
  },
  restore() {
    const { notes, binChoice } = get();
    const note = notes.find((one) => one.id === binChoice && one.trashed);
    if (!note) return;
    const rest = notes.map((one) => (one === note ? { ...one, trashed: false } : one));
    const folder = note.folder && i18n.t(`samples.folders.${note.folder}`);
    set({
      notes: rest,
      binChoice: rest.some((one) => one.trashed) ? "bin" : null,
      message: folder
        ? i18n.t("zone.restored", { name: note.name, folder })
        : i18n.t("zone.restoredRoot", { name: note.name }),
    });
  },
  emptyBin() {
    set({ notes: get().notes.filter((note) => !note.trashed), binChoice: null, message: i18n.t("zone.emptied") });
  },
  clearMessage() {
    if (get().message) set({ message: "" });
  },
}));
