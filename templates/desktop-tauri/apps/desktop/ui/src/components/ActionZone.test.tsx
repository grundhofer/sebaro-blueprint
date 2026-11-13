import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { useAppearance } from "../store/appearance";
import { useNotes } from "../store/notes";
import { ActionZone } from "./ActionZone";

const part = (name: string) => document.querySelector(`.sb-primary-action-bar__${name}`)!;
const notes = () => useNotes.getState();

test("the zone counts the note on screen and says how many notes are not saved", () => {
  render(<ActionZone />);
  expect(part("counts").textContent).toBe("45 Wörter · 311 Zeichen");
  expect(part("status").textContent).toBe("1 Notiz nicht gesichert.");
  expect(part("message").textContent).toBe("");
});

test("the primary action makes a note; with no note open the counter line keeps its counts, hidden", () => {
  render(<ActionZone />);
  fireEvent.click(screen.getByRole("button", { name: "Neue Notiz" }));
  expect(part("counts").textContent).toBe("0 Wörter · 0 Zeichen");
  act(() => [...notes().open].forEach((id) => notes().close(id)));
  expect(part("counts").hasAttribute("data-sb-held")).toBe(true);
  expect(part("counts").textContent).toBe("0 Wörter · 0 Zeichen");
  expect(part("status").textContent).toBe("Alles gesichert.");
});

test("the sentence of a command stays until the next key; a lone modifier does not count", () => {
  render(<ActionZone />);
  act(() => notes().trash("einkauf"));
  expect(part("message").textContent).toBe("„Einkauf“ liegt im Papierkorb.");
  fireEvent.keyDown(document.body, { key: "Shift" });
  expect(part("message").textContent).not.toBe("");
  fireEvent.keyDown(document.body, { key: "ArrowDown" });
  expect(part("message").textContent).toBe("");
});

test("an error code from the Rust side becomes its sentence from the string table", () => {
  render(<ActionZone />);
  act(() => useAppearance.setState({ failure: "settingsNotSaved" }));
  expect(part("message").textContent).toMatch(
    /^Die Wahl ließ sich nicht sichern\. Sie gilt, bis du die App schließt\./,
  );
  expect(part("message").querySelector("svg use")?.getAttribute("href")).toBe("#error--16");
  act(() => useAppearance.setState({ failure: "unknown" }));
  expect(part("message").textContent).toBe("Das hat nicht geklappt. Versuch es noch mal.");
});
