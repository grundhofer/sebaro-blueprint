// notes.ts: what a note is and what may happen to it. Plain functions: the store holds the notes and asks here.
// The notes of the starter are examples; a product keeps its documents in the core crate and reads them through
// commands.

export const FOLDERS = ["projekte", "journal"] as const;
export type Folder = (typeof FOLDERS)[number];

export type Note = {
  id: string;
  name: string;
  /** null: the note lies beside the folders */
  folder: Folder | null;
  created: string; // ISO date
  changed: string; // ISO date and time
  text: string[]; // paragraphs
  unsaved: boolean;
  online: boolean;
  /** in the bin: out of its folder, back with „Zurücklegen“, gone for good with „Papierkorb leeren …“ */
  trashed: boolean;
};

/** The words of an example note, from the string table (`samples.notes`, by id). */
export type Sample = { name: string; text: string[] };

type Example = Pick<Note, "id" | "folder" | "created" | "changed"> & Partial<Pick<Note, "unsaved" | "online">>;
const EXAMPLES: Example[] = [
  { id: "wochenplan", folder: "projekte", created: "2026-09-02", changed: "2026-10-28T09:40", unsaved: true },
  { id: "umzug", folder: "projekte", created: "2026-08-14", changed: "2026-10-21T18:05" },
  { id: "garten", folder: "projekte", created: "2026-07-30", changed: "2026-10-12T07:15" },
  { id: "oktober", folder: "journal", created: "2026-10-27", changed: "2026-10-27T21:30" },
  { id: "einkauf", folder: null, created: "2026-10-01", changed: "2026-10-26T12:00", online: true },
];

/** The example notes of the start. */
export function seed(samples: Record<string, Sample>): Note[] {
  return EXAMPLES.map((example) => ({
    unsaved: false,
    online: false,
    trashed: false,
    ...example,
    ...(samples[example.id] ?? { name: example.id, text: [] }),
  }));
}

/** A new, empty note in the first folder, changed now. `count` numbers the new notes of this session. */
export function blank(count: number, name: string, now: Date): Note {
  const two = (n: number) => String(n).padStart(2, "0");
  const created = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
  const changed = `${created}T${two(now.getHours())}:${two(now.getMinutes())}`;
  return {
    id: `neu-${count}`,
    name,
    folder: FOLDERS[0],
    created,
    changed,
    text: [],
    unsaved: false,
    online: false,
    trashed: false,
  };
}

export function words(note: Note): number {
  return note.text.join(" ").split(/\s+/).filter(Boolean).length;
}

export function chars(note: Note): number {
  return note.text.join("\n").length;
}

/** The size in KB, never less than 1. */
export function kilobytes(note: Note): number {
  return Math.max(1, Math.ceil(chars(note) / 1024));
}

/** Whether a note's name holds the search words. */
export function matches(note: Note, query: string): boolean {
  return note.name.toLowerCase().includes(query.trim().toLowerCase());
}

/** The open tabs without `id`, and the tab that is current then: the one that took the closed tab's place, else
 *  the one before it. Closing another tab than the current one leaves the current one. */
export function closeTab(
  open: string[],
  current: string | null,
  id: string,
): { open: string[]; current: string | null } {
  const at = open.indexOf(id);
  const rest = open.filter((tab) => tab !== id);
  if (current !== id) return { open: rest, current };
  return { open: rest, current: rest[Math.min(at, rest.length - 1)] ?? null };
}

/** The open tabs with the tab `id` moved one place forward (-1) or back (1). */
export function moveTab(open: string[], id: string, by: -1 | 1): string[] {
  const at = open.indexOf(id);
  const to = at + by;
  if (at < 0 || to < 0 || to >= open.length) return open;
  const moved = [...open];
  [moved[at], moved[to]] = [moved[to], moved[at]];
  return moved;
}
