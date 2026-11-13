import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Tree } from "./Tree";

const nodes = [
  {
    id: "projects",
    name: "Projekte",
    icon: "folder",
    children: [
      { id: "week", name: "Wochenplan", icon: "file-text" },
      { id: "garden", name: "Gartenplan", icon: "file-text" },
    ],
  },
  { id: "archive", name: "Archiv", icon: "folder", children: [{ id: "move", name: "Umzug 2025", icon: "file-text" }] },
];
const item = (name: string) => screen.getByRole("treeitem", { name, hidden: true });
const press = (key: string) => fireEvent.keyDown(document.activeElement ?? document.body, { key });

test("one row is the tab stop; the arrows move, open and close, Enter chooses", () => {
  render(
    <>
      <p id="head">Ordner</p>
      <Tree labelledBy="head" nodes={nodes} open={["projects"]} selected="week" />
    </>,
  );
  expect(screen.getAllByRole("treeitem").map((row) => row.tabIndex)).toEqual([-1, 0, -1, -1]);
  expect(item("Archiv").getAttribute("aria-expanded")).toBe("false");

  item("Wochenplan").focus();
  press("ArrowDown");
  expect(document.activeElement).toBe(item("Gartenplan"));
  press("ArrowLeft"); // from a child to its parent
  expect(document.activeElement).toBe(item("Projekte"));
  press("ArrowLeft"); // closes it
  expect(item("Projekte").getAttribute("aria-expanded")).toBe("false");
  press("End");
  expect(document.activeElement).toBe(item("Archiv"));
  press("ArrowRight"); // opens it
  press("ArrowRight"); // to its first child
  expect(document.activeElement).toBe(item("Umzug 2025"));
  press("Enter");
  expect(item("Umzug 2025").getAttribute("aria-selected")).toBe("true");
  expect(item("Wochenplan").getAttribute("aria-selected")).toBe("false");
  press("p"); // a letter jumps to the next row that starts with it
  expect(document.activeElement).toBe(item("Projekte"));
});
