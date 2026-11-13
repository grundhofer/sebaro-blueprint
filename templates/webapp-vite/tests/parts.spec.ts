// What the parts do in a real browser, where the unit tests cannot look: a dialog and a popover open and give the
// focus back, a press beside a dialog cancels it, actions that do not fit stand one under the other, Escape closes
// the toast, „Kopieren“ reaches the clipboard, and a view that fails to load says so.
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { collectCut } from "./sebaro-checks";

test.use({ reducedMotion: "reduce", colorScheme: "light" });

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
// the chunk of a view that main.tsx loads with lazy(): held back, the view fails as on a broken connection
const LAZY_VIEW = /\/assets\/Settings-.*\.js$/;

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

test("a press beside the dialog cancels it; a press inside does not", async ({ page }) => {
  await open(page, "/eintrag/2");
  const dialog = page.locator("#app-dlg-delete");
  await button(page, "Eintrag löschen").click();
  await dialog.locator(".sb-dialog__text").click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
  await expect(page.locator("main h1")).toHaveText("Rosen schneiden"); // nothing was deleted
  await expect(button(page, "Eintrag löschen")).toBeFocused();
});

test("dialog actions that do not fit one line stand one under the other, the saving one last", async ({ page }) => {
  const lefts = () =>
    page
      .locator("#app-dlg-unsaved .sb-dialog__actions button")
      .evaluateAll((all) => all.map((b) => b.getBoundingClientRect().left));
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page, "/neu");
  await page.fill("#app-f-title", "Keller aufräumen");
  await page.locator(".sb-site-nav a").click();
  await expect(page.locator("#app-dlg-unsaved .sb-dialog__actions")).toHaveAttribute("data-sb-fit", "stack");
  expect(new Set(await lefts()).size).toBe(1);
  // with room for one line they stand side by side again
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(page.locator("#app-dlg-unsaved .sb-dialog__actions")).not.toHaveAttribute("data-sb-fit", "stack");
  expect(new Set(await lefts()).size).toBe(3);
});

test("Escape closes the toast and leaves the focus where it is", async ({ page }) => {
  await open(page, "/eintrag/1");
  await button(page, "Als erledigt markieren").click();
  await expect(page.locator("#app-toast")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#app-toast")).toBeHidden();
  await expect(button(page, "Wieder öffnen")).toBeFocused();
});

test("a note's digit: narrow, the note opens over the text and closing gives the focus back", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/daten");
  const digit = page.getByRole("link", { name: "Beleg 1" });
  const note = page.locator(".sb-note-popover");
  await digit.click();
  await expect(note).toBeVisible();
  await expect(note.locator(".sb-note-popover__claim")).toHaveText("Die Beispiel-App läuft ohne Konto");
  await expect(note).toContainText("Manifest der App");
  await expect(digit).toHaveAttribute("aria-expanded", "true");
  await expect(button(page, "Schließen")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(note).toBeHidden();
  await expect(digit).toBeFocused();
  // Escape closes it too
  await page.keyboard.press("Enter");
  await expect(note).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(note).toBeHidden();
  await expect(digit).toBeFocused();
  // a press on the other digit shows the other note
  await digit.click();
  await page.getByRole("link", { name: "Beleg 2" }).click();
  await expect(note.locator(".sb-note-popover__claim")).toContainText("IP-Adresse");
  await expect(note).toBeVisible();
});

test("a note's digit: wide, the page jumps to the note and back, and the focus goes along", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/daten");
  await page.getByRole("link", { name: "Beleg 2" }).click();
  await expect(page.locator("#app-beleg-2")).toBeFocused();
  await expect(page.locator(".sb-note-popover")).toBeHidden();
  await page.getByRole("link", { name: "Zurück zur Aussage 2" }).click();
  await expect(page.getByRole("link", { name: "Beleg 2" })).toBeFocused();
  await expect(page.locator("main h1")).toHaveText("Datenarten"); // a jump inside the page is no new view
});

test("„Kopieren“ puts the code on the clipboard and says „Kopiert“", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/daten");
  const key = page.locator(".sb-code__copy").first();
  await key.click();
  await expect(key).toHaveText("Kopiert");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "# baut die App in den Ordner dist/\npnpm build",
  );
  await expect(key).toHaveText("Kopieren", { timeout: 4000 });
});

test("the sorted table, the calendar and the tree answer the keys", async ({ page }) => {
  await open(page, "/daten");
  // the table: a press on „Datum“ sorts from the newest day, the sum row stays
  const table = page.locator("table", { has: page.locator("#app-d-sum-cap") });
  await table.getByRole("button", { name: "Datum" }).click();
  await expect(table.locator("tbody tr td:first-child")).toHaveText(["08.10.", "06.10.", "03.10.", "01.10."]);
  await expect(table.locator("tfoot")).toContainText("1.701,20");
  // the calendar: Page down shows the next month and keeps the focus in the grid
  await page.locator(".sb-calendar__day[aria-selected]").focus();
  await page.keyboard.press("PageDown");
  await expect(page.locator(".sb-calendar__title")).toHaveText("November 2026");
  await expect(page.locator('.sb-calendar__day[tabindex="0"]')).toBeFocused();
  // the tree: Arrow right opens the folder and shows its row
  const archive = page.getByRole("treeitem", { name: "Archiv" });
  await archive.focus();
  await page.keyboard.press("ArrowRight");
  await expect(archive).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("treeitem", { name: "Umzug 2025" })).toBeVisible();
});

test("a view that cannot be loaded says so; the shell stays and „Noch mal versuchen“ loads it", async ({ page }) => {
  await page.route(LAZY_VIEW, (route) => route.abort());
  await page.goto("/einstellungen");
  await expect(page.locator("main h1")).toHaveText("Fehler");
  await expect(page.locator("main")).toContainText("Deine Einträge auf diesem Gerät sind unverändert.");
  await expect(page.locator(".sb-site-header")).toBeVisible();
  await page.unroute(LAZY_VIEW);
  await button(page, "Noch mal versuchen").click();
  await expect(page.locator("main h1")).toHaveText("Einstellungen");
});

// the error view is no case of screens.spec.ts (a failed load writes to the console, on purpose): its own checks
for (const [scheme, width, scale] of [
  ["light", 390, 1],
  ["dark", 390, 1],
  ["light", 1440, 1],
  ["dark", 1440, 1],
  ["light", 1440, 2],
] as const) {
  test(`the error view ${scheme} ${width}px ${scale * 100}%: axe, no sideways scroll, no cut text`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: scheme });
    const page = await context.newPage();
    if (scale !== 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: 16 * scale, fixed: 13 * scale } });
    }
    await page.route(LAZY_VIEW, (route) => route.abort());
    await page.goto("/einstellungen");
    await expect(page.locator("h1:visible")).toHaveText(["Fehler"]);
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const sideways = () => document.documentElement.scrollWidth - document.documentElement.clientWidth;
    expect(await page.evaluate(sideways)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(collectCut)).toEqual([]);
    const axe = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
    const shot = `fehler-${scheme}-${width}-${scale * 100}.png`;
    await page.screenshot({ path: path.join(test.info().project.outputDir, "screens", shot) });
    await context.close();
  });
}
