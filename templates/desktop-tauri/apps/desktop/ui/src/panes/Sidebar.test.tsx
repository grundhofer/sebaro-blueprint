import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { useNotes } from "../store/notes";
import { useWindow } from "../store/window";
import { Sidebar } from "./Sidebar";

const rows = () => screen.getAllByRole("treeitem").map((row) => row.getAttribute("data-row"));
const row = (id: string) => document.querySelector<HTMLElement>(`[data-row="${id}"]`)!;

test("the tree shows the folders with their notes, the notes beside them and the bin", () => {
  render(<Sidebar id="seite" hidden={false} width={null} />);
  expect(rows()).toEqual(["folder:projekte", "wochenplan", "umzug", "garten", "folder:journal", "einkauf", "bin"]);
  expect(row("wochenplan").getAttribute("aria-selected")).toBe("true");
  expect(row("wochenplan").textContent).toContain("nicht gesichert");
  expect(row("einkauf").textContent).toContain("nur online");
  expect(row("bin").hasAttribute("aria-expanded")).toBe(false); // empty: nothing to open
});

test("choosing a note opens it; choosing a folder opens and closes the folder", () => {
  render(<Sidebar id="seite" hidden={false} width={null} />);
  fireEvent.click(row("umzug"));
  expect(useNotes.getState().current).toBe("umzug");
  fireEvent.click(row("folder:journal"));
  expect(rows()).toContain("oktober");
  fireEvent.click(row("folder:journal"));
  expect(rows()).not.toContain("oktober");
});

test("the search shows the notes whose name matches, inside their opened folders, or says that none does", () => {
  render(<Sidebar id="seite" hidden={false} width={null} />);
  const search = screen.getByRole("searchbox", { name: "Notizen durchsuchen" });
  fireEvent.change(search, { target: { value: "okt" } });
  expect(rows()).toEqual(["folder:journal", "oktober", "bin"]);
  fireEvent.change(search, { target: { value: "Steuer" } });
  expect(rows()).toEqual(["bin"]);
  expect(screen.getByText("Keine Notiz passt zu „Steuer“.")).toBeTruthy();
});

test("a note in the bin stands under the bin; choosing it there leaves the open note as it is", () => {
  useNotes.getState().trash("umzug");
  useWindow.getState().setFolder("bin", true);
  render(<Sidebar id="seite" hidden={false} width={null} />);
  expect(rows()).toEqual(["folder:projekte", "wochenplan", "garten", "folder:journal", "einkauf", "bin", "bin:umzug"]);
  fireEvent.click(row("bin:umzug"));
  expect(useNotes.getState()).toMatchObject({ binChoice: "umzug", current: "wochenplan" });
  expect(row("bin:umzug").getAttribute("aria-selected")).toBe("true");
  expect(row("wochenplan").getAttribute("aria-selected")).toBe("false");
});
