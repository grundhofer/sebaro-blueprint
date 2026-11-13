// list.ts: the search and the filter of „Einträge“. They hold while the app is open, so the way back from an entry
// leads to the list as it was.
import { create } from "zustand";
import type { Filter } from "../lib/entries";

type ListView = { query: string; filter: Filter; set(values: { query?: string; filter?: Filter }): void };

export const useListView = create<ListView>()((set) => ({ query: "", filter: "all", set }));
