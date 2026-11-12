// entries.ts: the entries, kept in localStorage on this device only („Bleibt auf diesem Gerät.“). The first start
// shows the example entries. The store holds them; what may happen to an entry is in lib/entries.ts.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "../i18n";
import { missingExamples, nextId, seed, type Entry, type EntryValues } from "../lib/entries";

const samples = () => i18n.t("samples", { returnObjects: true });

type Entries = {
  entries: Entry[];
  /** Adds an entry and returns its id. */
  add(values: EntryValues): string;
  /** Changes an entry; a changed example is the user's own from then on. */
  change(id: string, values: Partial<Entry>): void;
  remove(ids: string[]): void;
  /** Adds the examples that are missing and returns them. */
  restoreExamples(): Entry[];
};

export const useEntries = create<Entries>()(
  persist(
    (set, get) => ({
      entries: seed(samples()),
      add(values) {
        const id = nextId(get().entries);
        const created = new Date().toISOString().slice(0, 10);
        set({ entries: [...get().entries, { ...values, id, state: "open", created, demo: false }] });
        return id;
      },
      change(id, values) {
        set({
          entries: get().entries.map((entry) => (entry.id === id ? { ...entry, demo: false, ...values } : entry)),
        });
      },
      remove(ids) {
        set({ entries: get().entries.filter((entry) => !ids.includes(entry.id)) });
      },
      restoreExamples() {
        const added = missingExamples(get().entries, samples());
        if (added.length) set({ entries: [...get().entries, ...added] });
        return added;
      },
    }),
    { name: "musterapp-entries", partialize: ({ entries }) => ({ entries }) },
  ),
);
