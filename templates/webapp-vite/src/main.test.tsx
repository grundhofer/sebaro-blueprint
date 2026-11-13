import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ErrorView } from "./components/ErrorView";
import { Shell } from "./components/Shell";
import { renderApp } from "./test-app";

test("an address that leads nowhere shows the not-found view", async () => {
  renderApp("/gibt-es-nicht");
  expect(await screen.findByRole("heading", { level: 1, name: "Diese Ansicht gibt es nicht" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Zu den Einträgen" }).getAttribute("href")).toBe("/");
});

test("a view that fails says so and what to do; the shell stays", async () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined); // React reports the thrown error there
  const Broken = () => {
    throw new Error("broken on purpose");
  };
  renderApp("/", [
    { element: <Shell />, children: [{ index: true, element: <Broken />, errorElement: <ErrorView /> }] },
  ]);
  expect(await screen.findByRole("heading", { level: 1, name: "Fehler" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Noch mal versuchen" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Einstellungen" })).toBeTruthy();
  vi.restoreAllMocks();
});
