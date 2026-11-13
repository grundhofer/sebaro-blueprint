import { expect, test } from "vitest";
import { useNotes } from "./notes";

const state = () => useNotes.getState();
const names = (trashed: boolean) =>
  state()
    .notes.filter((note) => note.trashed === trashed)
    .map((note) => note.id);

test("a note opens in a tab once; a new note is numbered, opened and marked as fresh", () => {
  state().show("umzug");
  state().show("umzug");
  expect(state().open).toEqual(["wochenplan", "einkauf", "umzug"]);
  expect(state().current).toBe("umzug");
  const id = state().add();
  expect(id).toBe("neu-1");
  expect(state().notes.at(-1)).toMatchObject({ name: "Neue Notiz 1", folder: "projekte" });
  expect(state()).toMatchObject({ current: "neu-1", fresh: "neu-1" });
});

test("the bin keeps a note: it leaves its tab, comes back to its folder, and the zone says each step", () => {
  state().show("umzug");
  state().trash("umzug");
  expect(names(true)).toEqual(["umzug"]);
  expect(state().open).toEqual(["wochenplan", "einkauf"]);
  expect(state().current).toBe("einkauf");
  expect(state().message).toBe("„Umzug Checkliste“ liegt im Papierkorb.");

  state().chooseInBin("umzug");
  state().restore();
  expect(names(true)).toEqual([]);
  expect(state().binChoice).toBeNull();
  expect(state().message).toBe("„Umzug Checkliste“ liegt wieder in „Projekte“.");
  expect(state().open).toEqual(["wochenplan", "einkauf"]); // it does not open on its own
});

test("a note from beside the folders comes back there; emptying the bin deletes for good", () => {
  state().trash("einkauf");
  state().trash("oktober");
  state().chooseInBin("einkauf");
  state().restore();
  expect(state().message).toBe("„Einkauf“ liegt wieder bei den Notizen.");
  expect(state().binChoice).toBe("bin"); // another note is still in it
  state().emptyBin();
  expect(state().notes.map((note) => note.id)).not.toContain("oktober");
  expect(state().message).toBe("Der Papierkorb ist leer.");
  state().clearMessage();
  expect(state().message).toBe("");
});

test("closing a tab leaves the note and takes its „nicht gesichert“ away: the caller has asked", () => {
  state().close("wochenplan");
  expect(state().open).toEqual(["einkauf"]);
  expect(state().notes.find((note) => note.id === "wochenplan")).toMatchObject({ unsaved: false, trashed: false });
});
