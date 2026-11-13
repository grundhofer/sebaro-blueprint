import { fireEvent, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { useEntries } from "../store/entries";
import { renderApp } from "../test-app";

const rows = () => screen.queryAllByRole("listitem").filter((item) => item.classList.contains("sb-list-row"));

test("search, filter and the state without a hit", () => {
  renderApp("/");
  const search = screen.getByRole<HTMLInputElement>("searchbox", { name: "Einträge durchsuchen" });
  expect(rows()).toHaveLength(4);
  expect(screen.getByText("4 Einträge.")).toBeTruthy();
  expect(screen.getByText("Noch 3 offen.")).toBeTruthy();

  fireEvent.change(search, { target: { value: "zzz" } });
  expect(rows()).toHaveLength(0);
  expect(screen.getByText("Kein Eintrag passt.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Filter zurücksetzen" }));
  expect(search.value).toBe("");
  expect(document.activeElement).toBe(search);

  fireEvent.click(screen.getByRole("button", { name: "Erledigt" }));
  expect(rows().map((row) => row.textContent)).toEqual(["erledigt: Steuerunterlagen sortieren"]);
  expect(screen.getByText("1 Eintrag.")).toBeTruthy();
});

test("without entries the list says how it fills; the action stays at the bottom", () => {
  useEntries.setState({ entries: [] });
  renderApp("/");
  expect(screen.getByText("Noch keine Einträge")).toBeTruthy();
  expect(screen.getByText("Alles erledigt.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Neuer Eintrag" }).getAttribute("href")).toBe("/neu");
});
