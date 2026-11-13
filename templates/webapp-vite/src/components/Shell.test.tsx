import { fireEvent, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { renderApp } from "../test-app";

test("the language in „Mehr“ swaps the words without a reload and stores the choice", async () => {
  renderApp("/");
  fireEvent.click(screen.getByRole("menuitemradio", { name: "English", hidden: true }));
  expect(await screen.findByRole("heading", { level: 1, name: "Entries" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "More" })).toBeTruthy();
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

test("an entry opens beside the list: the list stays, as a region, and its row is the current one", async () => {
  renderApp("/");
  const list = screen.getByRole("main");
  fireEvent.click(screen.getByRole("link", { name: "Rosen schneiden" }));
  expect(await screen.findByRole("heading", { level: 1, name: "Rosen schneiden" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Einträge" })).toBe(list);
  expect(screen.getByRole("heading", { level: 2, name: "Einträge" })).toBeTruthy();
  expect(list.querySelector("[aria-current='true']")?.textContent).toContain("Rosen schneiden");
  expect(document.title).toBe("Rosen schneiden · Musterapp");
  expect(screen.getByRole("link", { name: "Einträge" }).getAttribute("aria-current")).toBe("page");
});
