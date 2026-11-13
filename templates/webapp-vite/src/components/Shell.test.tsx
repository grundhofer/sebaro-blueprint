import { fireEvent, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { renderApp } from "../test-app";

test("DE / EN swaps the words without a reload and stores the choice", async () => {
  renderApp("/");
  fireEvent.click(screen.getByRole("radio", { name: "EN" }));
  expect(await screen.findByRole("heading", { level: 1, name: "Entries" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Light or dark" })).toBeTruthy();
  expect(document.documentElement.lang).toBe("en");
  expect(localStorage.getItem("sb-lang")).toBe("en");
});

test("after a navigation the heading of the new view has the focus", async () => {
  renderApp("/");
  expect(document.activeElement).toBe(document.body);
  fireEvent.click(screen.getByRole("link", { name: "Einstellungen" }));
  const heading = await screen.findByRole("heading", { level: 1, name: "Einstellungen" });
  expect(document.activeElement).toBe(heading);
  expect(document.title).toBe("Einstellungen · Musterapp");
  expect(screen.getByRole("link", { name: "Einstellungen" }).getAttribute("aria-current")).toBe("page");
});
