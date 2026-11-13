import { fireEvent, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { useEntries } from "../store/entries";
import { renderApp } from "../test-app";

test("„Sichern“ stays enabled: its press says at each field what is wrong and focuses the first", async () => {
  renderApp("/neu");
  const title = await screen.findByRole("textbox", { name: "Titel" });
  fireEvent.change(screen.getByRole("textbox", { name: /^Aufwand/ }), { target: { value: "viel" } });
  fireEvent.click(screen.getByRole("button", { name: "Sichern" }));
  expect(document.activeElement).toBe(title);
  expect(title.getAttribute("aria-invalid")).toBe("true");
  expect(document.getElementById("app-f-title-error")?.textContent).toBe("Titel fehlt.");
  expect(document.getElementById("app-f-effort-error")?.textContent).toBe(
    "Aufwand muss eine ganze Zahl sein, etwa 30.",
  );
  expect(useEntries.getState().entries).toHaveLength(4);
});

test("a form without faults stores the entry and opens it", async () => {
  renderApp("/neu");
  fireEvent.change(await screen.findByRole("textbox", { name: "Titel" }), { target: { value: "Keller aufräumen" } });
  fireEvent.change(screen.getByRole("textbox", { name: /^Aufwand/ }), { target: { value: "90" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Neuer Teilschritt" }), { target: { value: "Regal leeren" } });
  fireEvent.click(screen.getByRole("button", { name: "Teilschritt hinzufügen" }));
  fireEvent.click(screen.getByRole("button", { name: "Sichern" }));
  expect(await screen.findByRole("heading", { level: 1, name: "Keller aufräumen" })).toBeTruthy();
  expect(useEntries.getState().entries.at(-1)).toMatchObject({
    id: "5",
    effort: 90,
    steps: ["Regal leeren"],
    state: "open",
  });
});

test("editing starts with the entry's values", async () => {
  renderApp("/bearbeiten/2");
  expect((await screen.findByRole<HTMLInputElement>("textbox", { name: "Titel" })).value).toBe("Rosen schneiden");
  expect(screen.getByRole<HTMLSelectElement>("combobox", { name: /^Kategorie/ }).value).toBe("garden");
  expect(screen.getByText("Höchstens 200 Zeichen, noch 154 frei.")).toBeTruthy();
});
