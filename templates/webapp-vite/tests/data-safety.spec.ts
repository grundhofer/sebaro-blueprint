// Nothing the user typed or stored is lost without a question: every way out of a form with unsaved changes asks
// first (a link, Back, Forward, closing or reloading; DE / EN keeps the draft), and „Beispieldaten
// wiederherstellen“ adds the missing examples without touching the user's entries.
import { test, expect, type Page } from "@playwright/test";

test.use({ reducedMotion: "reduce", colorScheme: "light" });

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

const heading = (page: Page) => page.locator("main h1");
const unsaved = (page: Page) => page.locator("#app-dlg-unsaved");
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const stored = (page: Page) =>
  page.evaluate(() =>
    (JSON.parse(localStorage.getItem("musterapp-entries") ?? "{}").state?.entries ?? []).map(
      (e: { title: string }) => e.title,
    ),
  );

/** A new entry with a title, a category and one sub-step, not saved. */
async function dirtyForm(page: Page) {
  await expect(heading(page)).toHaveText("Neuer Eintrag");
  await page.fill("#app-f-title", "Keller aufräumen");
  await page.selectOption("#app-f-cat", "home");
  await page.fill("#app-f-step", "Regal leeren");
  await button(page, "Teilschritt hinzufügen").click();
  await expect(page.locator("#app-steps")).toContainText("Regal leeren");
}

/** The question is open, the form and what was typed still stand, the address is the form's. */
async function heldBack(page: Page) {
  await expect(unsaved(page)).toHaveJSProperty("open", true);
  await expect(heading(page)).toHaveText("Neuer Eintrag");
  await expect(page.locator("#app-f-title")).toHaveValue("Keller aufräumen");
  expect(new URL(page.url()).pathname).toBe("/neu");
}

test("a link asks first; „Abbrechen“ stays with the draft", async ({ page }) => {
  await open(page, "/neu");
  await dirtyForm(page);
  await page.locator(".sb-site-nav a").click();
  await heldBack(page);
  await unsaved(page).locator('button[value="cancel"]').click();
  await expect(unsaved(page)).toHaveJSProperty("open", false);
  await expect(page.locator("#app-f-title")).toHaveValue("Keller aufräumen");
  await expect(page.locator("#app-steps")).toContainText("Regal leeren");
});

test("Back asks first; „Verwerfen“ then goes where Back went", async ({ page }) => {
  await open(page, "/");
  await page.locator('a.sb-primary-action[href="/neu"]').click();
  await dirtyForm(page);
  await page.goBack();
  await heldBack(page);
  await unsaved(page).locator('button[value="discard"]').click();
  await expect(heading(page)).toHaveText("Einträge");
  await expect(page.locator("main")).not.toContainText("Keller aufräumen");
});

test("Forward asks first; „Sichern“ stores the entry and then goes forward", async ({ page }) => {
  await open(page, "/neu");
  await page.locator(".sb-site-nav a").click();
  await expect(heading(page)).toHaveText("Einstellungen");
  await page.goBack();
  await dirtyForm(page);
  await page.fill("#app-f-effort", "30");
  await page.goForward();
  await heldBack(page);
  await unsaved(page).locator('button[value="save"]').click();
  await expect(heading(page)).toHaveText("Einstellungen");
  await open(page, "/");
  await expect(page.locator("main")).toContainText("Keller aufräumen");
});

test("„Sichern“ in the question shows what is wrong and stays, when the draft has a fault", async ({ page }) => {
  await open(page, "/neu");
  await dirtyForm(page);
  await page.locator(".sb-site-nav a").click();
  await unsaved(page).locator('button[value="save"]').click();
  await expect(unsaved(page)).toHaveJSProperty("open", false);
  await expect(heading(page)).toHaveText("Neuer Eintrag");
  await expect(page.locator("#app-f-effort-error")).toHaveText("Aufwand fehlt.");
  await expect(page.locator("#app-f-effort")).toBeFocused();
});

test("DE / EN keeps every typed value and the unsaved state", async ({ page }) => {
  await open(page, "/neu");
  await dirtyForm(page);
  await page.fill("#app-f-step", "Kisten holen");
  await page.locator('.sb-language-switch label:has(input[value="en"])').click();
  await expect(heading(page)).toHaveText("New entry");
  await expect(page.locator("#app-f-title")).toHaveValue("Keller aufräumen");
  await expect(page.locator("#app-f-cat")).toHaveValue("home");
  await expect(page.locator("#app-steps")).toContainText("Regal leeren");
  await expect(page.locator("#app-f-step")).toHaveValue("Kisten holen");
  // still unsaved: leaving asks, now in English
  await page.locator("#app-form").getByRole("button", { name: "Cancel" }).click();
  await expect(unsaved(page)).toHaveJSProperty("open", true);
  await expect(unsaved(page).locator("h2")).toHaveText("Save changes?");
});

test("closing or reloading with unsaved changes gets the browser's question, without changes none", async ({
  page,
}) => {
  await open(page, "/neu");
  const asked: string[] = [];
  page.on("dialog", (d) => {
    asked.push(d.type());
    void d.dismiss();
  });
  // clean: reload goes without a question
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(asked).toEqual([]);
  await dirtyForm(page);
  // dirty: closing asks (the dismissed question keeps the page)
  await page.close({ runBeforeUnload: true });
  await expect.poll(() => asked).toEqual(["beforeunload"]);
});

test("removing a sub-step asks nothing; „Rückgängig“ puts it back in its place", async ({ page }) => {
  await open(page, "/neu");
  await dirtyForm(page);
  await page.fill("#app-f-step", "Kisten holen");
  await page.keyboard.press("Enter");
  await button(page, "Regal leeren entfernen").click();
  await expect(page.locator("#app-steps .sb-list-row")).toHaveText(["Kisten holen"]);
  await expect(page.locator("#app-toast p")).toHaveText("„Regal leeren“ entfernt");
  await page.locator("#app-toast .sb-toast__action").click();
  await expect(page.locator("#app-steps .sb-list-row")).toHaveText(["Regal leeren", "Kisten holen"]);
});

test("„Beispieldaten wiederherstellen“ adds the missing examples and keeps the user's entries", async ({ page }) => {
  // the user deleted the example „Fenster putzen“, changed „Rosen schneiden“ (now theirs) and added an entry
  await open(page, "/eintrag/4");
  await button(page, "Eintrag löschen").click();
  await page.locator('#app-dlg-delete button[value="confirm"]').click();
  await expect(heading(page)).toHaveText("Einträge");
  await open(page, "/bearbeiten/2");
  await page.fill("#app-f-title", "Rosen und Hecke schneiden");
  await page.locator('#app-form button[type="submit"]').click();
  await expect(heading(page)).toHaveText("Rosen und Hecke schneiden");
  await open(page, "/neu");
  await page.fill("#app-f-title", "Keller aufräumen");
  await page.fill("#app-f-effort", "90");
  await page.locator('#app-form button[type="submit"]').click();
  await expect(heading(page)).toHaveText("Keller aufräumen");

  await open(page, "/einstellungen"); // the app reads the storage at its start
  await button(page, "Beispieldaten wiederherstellen").click();
  // no dialog: nothing is removed
  expect(await page.evaluate(() => document.querySelectorAll("dialog[open]").length)).toBe(0);
  await expect(page.locator("#app-toast p")).toHaveText("2 Beispiele wiederhergestellt");
  const mine = ["Wasser trinken", "Rosen und Hecke schneiden", "Steuerunterlagen sortieren", "Keller aufräumen"];
  expect(await stored(page)).toEqual([...mine, "Rosen schneiden", "Fenster putzen"]);
  // „Rückgängig“ takes back only the added examples
  await page.locator("#app-toast .sb-toast__action").click();
  await expect(page.locator("#app-toast")).toBeHidden();
  expect(await stored(page)).toEqual(mine);
  // adding them again, then a second press finds nothing missing, changes nothing and offers nothing to take back
  await button(page, "Beispieldaten wiederherstellen").click();
  await expect(page.locator("#app-toast p")).toHaveText("2 Beispiele wiederhergestellt");
  await button(page, "Beispieldaten wiederherstellen").click();
  await expect(page.locator("#app-toast p")).toHaveText("Alle Beispiele sind schon da.");
  await expect(page.locator("#app-toast .sb-toast__action")).toHaveCount(0);
  expect(await stored(page)).toHaveLength(6);
});
