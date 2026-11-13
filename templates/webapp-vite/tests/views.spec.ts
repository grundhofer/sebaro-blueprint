// The copy's check of a view (src/sebaro/checks/sb-colour-count.js). screens.spec.ts runs it on every screen in the
// tone „Kühl“; here every view is counted in the tone „Warm“ too, and three negative controls show that the check
// fails where a rule is broken: a second outlined action in an area, a theme button in the head of the web app, a
// second primary action in the app frame.
import { test, expect, type Page } from "@playwright/test";
import { viewFaults } from "./sebaro-checks";

const COUNT = "src/sebaro/checks/sb-colour-count.js";
const PATHS = ["/", "/eintrag/2", "/neu", "/daten", "/einstellungen", "/impressum", "/gibt-es-nicht"];

test.use({ reducedMotion: "reduce" });

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

for (const scheme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`every view passes in the tone „Warm“, ${scheme} ${width}px`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
      const page = await context.newPage();
      await page.addInitScript(() => localStorage.setItem("sb-tone", "warm"));
      for (const path of PATHS) {
        await open(page, path);
        await expect(page.locator("html")).toHaveAttribute("data-sb-tone", "warm");
        expect(await viewFaults(page, COUNT), path).toEqual([]);
      }
      await context.close();
    });
  }
}

test("a second outlined action in an area fails the check", async ({ page }) => {
  await open(page, "/einstellungen");
  expect(await viewFaults(page, COUNT)).toEqual([]);
  await page.evaluate(() => {
    const action = document.querySelector(".sb-secondary-action");
    action?.after(action.cloneNode(true));
  });
  const faults = await viewFaults(page, COUNT);
  expect(faults).toHaveLength(1);
  expect(faults[0]).toMatch(/^einstellungen: 2 outlined actions in the area /);
});

test("a theme button in the head of the web app fails the check", async ({ page }) => {
  await open(page, "/einstellungen");
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.className = "sb-theme-button";
    document.querySelector("[data-sb-web-app-head]")?.append(button);
  });
  expect(await viewFaults(page, COUNT)).toEqual(["einstellungen: a theme button in the head of the web app"]);
});

test("a second primary action in the app frame fails the check", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/neu");
  expect(await viewFaults(page, COUNT)).toEqual([]);
  await page.evaluate(() => {
    const action = document.querySelector("#app-form .sb-primary-action");
    action?.after(action.cloneNode(true));
  });
  expect(await viewFaults(page, COUNT)).toEqual([
    "rahmen: 2 primary actions in the app frame",
    "formular: 2 primary action fills, 1 expected",
  ]);
});
