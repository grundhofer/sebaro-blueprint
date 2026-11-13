// entries.ts: what an entry is and what may happen to it. Plain functions: the store holds the entries, the form
// holds the draft, and both ask here.

export const CATEGORIES = ["none", "home", "work", "garden", "health"] as const;
export type Category = (typeof CATEGORIES)[number];
export type State = "open" | "done" | "closed";
export type Filter = "all" | "open" | "done";

export type Entry = {
  id: string;
  title: string;
  category: Category;
  due: string; // ISO date, "" when none
  effort: number; // minutes
  note: string;
  steps: string[];
  state: State;
  created: string; // ISO date
  demo: boolean;
  /** which example this is; it counts as that example only while demo is true */
  sample?: number;
};

/** What the form gives: an entry without what the app adds. */
export type EntryValues = Pick<Entry, "title" | "category" | "due" | "effort" | "note" | "steps">;

/** The words of an example entry, from the i18next resources (`samples`, in the order of EXAMPLES). */
export type Sample = { title: string; note: string };

const EXAMPLES: ReadonlyArray<readonly [Category, string, number, State]> = [
  ["health", "2026-10-30", 5, "open"],
  ["garden", "2026-11-02", 45, "open"],
  ["work", "", 90, "done"],
  ["home", "2026-11-08", 60, "open"],
];

function example(samples: Sample[], at: number, id: string): Entry {
  const [category, due, effort, state] = EXAMPLES[at];
  return { id, ...samples[at], category, due, effort, steps: [], state, created: "2026-10-10", demo: true, sample: at };
}

/** The example entries of the first start. */
export function seed(samples: Sample[]): Entry[] {
  return EXAMPLES.map((_, at) => example(samples, at, String(at + 1)));
}

export function nextId(entries: Entry[]): string {
  return String(entries.reduce((max, entry) => Math.max(max, Number(entry.id) || 0), 0) + 1);
}

/** The examples that are missing (deleted, or changed and so the user's own), with new ids. Nothing is removed or
 *  replaced, so adding them needs no question. */
export function missingExamples(entries: Entry[], samples: Sample[]): Entry[] {
  const present = new Set(entries.filter((entry) => entry.demo).map((entry) => entry.sample));
  const added: Entry[] = [];
  EXAMPLES.forEach((_, at) => {
    if (!present.has(at)) added.push(example(samples, at, nextId([...entries, ...added])));
  });
  return added;
}

export function matches(entry: Entry, filter: Filter, query: string): boolean {
  if (filter === "open" && entry.state !== "open") return false;
  if (filter === "done" && entry.state === "open") return false;
  return !query || entry.title.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export const NOTE_MAX = 200;
export const EFFORT_MAX = 600;

/** What the form holds while it is edited: every field as text. */
export type Draft = { title: string; category: Category; due: string; effort: string; note: string; steps: string[] };
export type DraftError = "missing" | "notNumber" | "range" | "tooLong" | "noDate";
export type DraftErrors = Partial<Record<"title" | "due" | "effort" | "note", DraftError>>;

export function toDraft(entry?: Entry): Draft {
  if (!entry) return { title: "", category: "none", due: "", effort: "", note: "", steps: [] };
  const { title, category, due, effort, note, steps } = entry;
  return { title, category, due, effort: String(effort), note, steps: [...steps] };
}

/** The faults of a draft by field. `dueUnfinished`: the date field holds a date typed only in part. */
export function check(draft: Draft, dueUnfinished = false): DraftErrors {
  const errors: DraftErrors = {};
  const effort = draft.effort.trim();
  if (!draft.title.trim()) errors.title = "missing";
  if (dueUnfinished) errors.due = "noDate";
  if (!effort) errors.effort = "missing";
  else if (!/^\d+$/.test(effort)) errors.effort = "notNumber";
  else if (Number(effort) < 1 || Number(effort) > EFFORT_MAX) errors.effort = "range";
  if (draft.note.length > NOTE_MAX) errors.note = "tooLong";
  return errors;
}

/** A checked draft as the values of an entry. */
export function toValues(draft: Draft): EntryValues {
  const { category, due, note } = draft;
  return {
    title: draft.title.trim(),
    category,
    due,
    effort: Number(draft.effort.trim()),
    note,
    steps: [...draft.steps],
  };
}

/** Every entry as one line of a CSV file, fields in quotes and parted by „;“. */
export function toCsv(entries: Entry[]): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const head = ["id", "title", "category", "due", "effort", "note", "state"];
  const rows = entries.map((e) =>
    [e.id, e.title, e.category, e.due, String(e.effort), e.note, e.state].map(quote).join(";"),
  );
  return [head.join(";"), ...rows].join("\n");
}
