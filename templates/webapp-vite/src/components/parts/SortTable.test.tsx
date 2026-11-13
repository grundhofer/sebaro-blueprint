import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { SortTable } from "./SortTable";

const rows = [
  { key: "a", cells: ["Miete", "1.250,00 €"], values: ["Miete", 1250] },
  { key: "b", cells: ["Bücher", "38,90 €"], values: ["Bücher", 38.9] },
  { key: "c", cells: ["Strom", "keine Angabe"], values: ["Strom", null] },
];
const firstColumn = () =>
  within(screen.getAllByRole("rowgroup")[1])
    .getAllByRole<HTMLTableRowElement>("row")
    .map((row) => row.cells[0].textContent);

test("a press on a head sorts by it, a second press turns the order round, a gap stays last", () => {
  render(
    <SortTable
      captionId="cap"
      caption="Ausgaben"
      columns={[{ label: "Zweck" }, { label: "Betrag", numeric: true }]}
      rows={rows}
      sorted={{ column: 1, direction: "descending" }}
    />,
  );
  expect(firstColumn()).toEqual(["Miete", "Bücher", "Strom"]);
  expect(screen.getByRole("columnheader", { name: "Betrag" }).getAttribute("aria-sort")).toBe("descending");

  fireEvent.click(screen.getByRole("button", { name: "Betrag" }));
  expect(firstColumn()).toEqual(["Bücher", "Miete", "Strom"]);
  expect(screen.getByRole("status").textContent).toBe("Sortiert nach Betrag, aufsteigend");

  fireEvent.click(screen.getByRole("button", { name: "Zweck" }));
  expect(firstColumn()).toEqual(["Bücher", "Miete", "Strom"]);
  expect(screen.getByRole("columnheader", { name: "Zweck" }).getAttribute("aria-sort")).toBe("ascending");
  expect(screen.getByRole("columnheader", { name: "Betrag" }).getAttribute("aria-sort")).toBeNull();
});
