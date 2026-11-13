// The four fixed tasks by keyboard alone: create, delete through the dialog, open a claim (evidence), switch light
// and dark in the „Mehr“ menu; plus Escape and the return of the focus, the form's errors, the dialog before leaving
// unsaved changes, the toast's „Rückgängig“ and the language without a reload. Last, a class check: every class on
// every screen is sebaro's (and stands in the copy) or the app's own (app-).
import { readFileSync, readdirSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";

test.use({ reducedMotion: "reduce", colorScheme: "light" });

/** Presses Tab until the element has the focus (at most 120 presses). */
async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 120; i++) {
    if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab never reached ${String(target)}`);
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

const main = (page: Page) => page.getByRole("main");
const heading = (page: Page) => main(page).locator("h1");
const more = (page: Page) => page.locator("[data-sb-web-app-head] [aria-haspopup=menu]");
const row = (page: Page, name: string) => page.getByRole("menuitemradio", { name, exact: true });
/** Opens the „Mehr“ menu, whose button has the focus, with Enter: the focus is then on its first row. */
async function openMore(page: Page) {
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitemradio").first()).toBeFocused();
}
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

test("create an entry by keyboard, with the errors first", async ({ page }) => {
  await open(page, "/");
  await tabTo(page, page.locator('a.sb-primary-action[href="/neu"]'));
  await page.keyboard.press("Enter");
  await expect(heading(page)).toHaveText("Neuer Eintrag");
  await expect(heading(page)).toBeFocused();
  // the primary action stays enabled; its press names what is missing and focuses the first field
  await tabTo(page, page.locator('#app-form button[type="submit"]'));
  await page.keyboard.press("Enter");
  await expect(page.locator("#app-f-title")).toBeFocused();
  await expect(page.locator("#app-f-title-error")).toHaveText("Titel fehlt.");
  await expect(page.locator("#app-f-effort-error")).toHaveText("Aufwand fehlt.");
  await expect(page.locator("#app-f-title")).toHaveAttribute("aria-invalid", "true");
  await page.keyboard.type("Keller aufräumen");
  await tabTo(page, page.locator("#app-f-effort"));
  await page.keyboard.type("90");
  await page.keyboard.press("Enter");
  await expect(heading(page)).toHaveText("Keller aufräumen");
  await expect(heading(page)).toBeFocused();
});

test("delete through the dialog: Escape returns focus, „Löschen“ removes", async ({ page }) => {
  await open(page, "/eintrag/4");
  await tabTo(page, button(page, "Eintrag löschen"));
  await page.keyboard.press("Enter");
  const dialog = page.locator("#app-dlg-delete");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('button[value="cancel"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button(page, "Eintrag löschen")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(dialog.locator('button[value="confirm"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(heading(page)).toHaveText("Einträge");
  await expect(heading(page)).toBeFocused();
  await expect(main(page)).not.toContainText("Fenster putzen");
});

test("the final step that deletes nothing asks like a deletion and closes the entry", async ({ page }) => {
  await open(page, "/eintrag/2");
  // in the content it is a text action; the one danger action there is the deletion
  await expect(button(page, "Eintrag abschließen")).toHaveClass("sb-text-action");
  await expect(main(page).locator(".sb-danger-action:visible")).toHaveText(["Eintrag löschen"]);
  await tabTo(page, button(page, "Eintrag abschließen"));
  await expect(button(page, "Eintrag abschließen").locator("svg")).toHaveCount(0); // no trash: nothing is deleted
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(main(page)).toContainText("abgeschlossen");
  await expect(button(page, "Als erledigt markieren")).toHaveCount(0);
  // the action that had the focus is gone: the heading has it
  await expect(heading(page)).toBeFocused();
});

test("unsaved changes ask „Abbrechen“ · „Verwerfen“ · „Sichern“, Sichern last", async ({ page }) => {
  await open(page, "/neu");
  await page.locator("#app-f-title").focus();
  await page.keyboard.type("Keller aufräumen");
  const cancel = page.locator("#app-form").getByRole("button", { name: "Abbrechen" });
  await tabTo(page, cancel);
  await page.keyboard.press("Enter");
  // the router holds the departure back, then the question opens with the focus on its first action
  const actions = page.locator("#app-dlg-unsaved .sb-dialog__actions button");
  await expect(actions.first()).toBeFocused();
  await expect(actions).toHaveText(["Abbrechen", "Verwerfen", "Sichern"]);
  await expect(page.locator("#app-dlg-unsaved .sb-danger-action")).toHaveText("Verwerfen");
  await page.keyboard.press("Escape");
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(actions.first()).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter"); // Verwerfen
  await expect(heading(page)).toHaveText("Einträge");
});

test("mark as done shows a toast; „Rückgängig“ by keyboard takes it back", async ({ page }) => {
  await open(page, "/eintrag/1");
  await tabTo(page, button(page, "Als erledigt markieren"));
  await page.keyboard.press("Enter");
  const toast = page.locator("#app-toast");
  await expect(toast).toBeVisible();
  await expect(toast.locator("p")).toHaveText("„Wasser trinken“ erledigt");
  await expect(main(page).locator("dl")).toContainText("erledigt");
  await tabTo(page, toast.locator(".sb-toast__action"));
  await page.keyboard.press("Enter");
  await expect(toast).toBeHidden();
  await expect(main(page).locator("dl")).toContainText("offen");
  // the focus is back where it was before the toast
  await expect(button(page, "Als erledigt markieren")).toBeFocused();
});

test("„Hell oder Dunkel“ in the „Mehr“ menu by keyboard switches and announces", async ({ page }) => {
  await open(page, "/");
  await tabTo(page, more(page));
  await openMore(page);
  // the first row is „Hell“; the shown mode is the chosen one
  await expect(row(page, "Hell")).toBeFocused();
  await expect(row(page, "Hell")).toHaveAttribute("aria-checked", "true");
  await expect(more(page)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("[data-sb-web-app-head] [role=status]")).toHaveText("Dunkel ist an.");
  // the choice closes the menu and the focus is back on its button
  await expect(page.locator("#app-more")).toBeHidden();
  await expect(more(page)).toBeFocused();
  await expect(more(page)).toHaveAttribute("aria-expanded", "false");
  // the system's own mode is never stored
  await openMore(page);
  await expect(row(page, "Dunkel")).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /./);
  expect(await page.evaluate(() => localStorage.getItem("sb-theme"))).toBeNull();
});

test("the „Mehr“ menu: the arrows wrap, Home and End jump, Escape and Tab close it", async ({ page }) => {
  await open(page, "/");
  await more(page).focus();
  await openMore(page);
  await page.keyboard.press("ArrowUp");
  await expect(row(page, "English")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(row(page, "Hell")).toBeFocused();
  await page.keyboard.press("End");
  await expect(row(page, "English")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(row(page, "Hell")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#app-more")).toBeHidden();
  await expect(more(page)).toBeFocused();
  // Tab moves on and closes the menu
  await openMore(page);
  await page.keyboard.press("Tab");
  await expect(page.locator("#app-more")).toBeHidden();
  // the tone stands beside „Hell oder Dunkel“ and is stored
  await more(page).click();
  await row(page, "Warm").click();
  await expect(page.locator("html")).toHaveAttribute("data-sb-tone", "warm");
  await expect(page.locator("[data-sb-web-app-head] [role=status]")).toHaveText("Farbton Warm ist an.");
  expect(await page.evaluate(() => localStorage.getItem("sb-tone"))).toBe("warm");
});

test("open a claim row (evidence) by keyboard", async ({ page }) => {
  await open(page, "/daten");
  const toggle = page.locator(".sb-claim-row__toggle").nth(1);
  await tabTo(page, toggle);
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".sb-claim-row__note").nth(1)).toBeVisible();
});

test("search, filter chips and the empty state", async ({ page }) => {
  await open(page, "/");
  await page.locator("#app-search").focus();
  await page.keyboard.type("zzz");
  await expect(page.locator("#app-results")).toContainText("Kein Eintrag passt");
  await tabTo(page, button(page, "Filter zurücksetzen"));
  await page.keyboard.press("Enter");
  await expect(page.locator("#app-search")).toHaveValue("");
  await expect(page.locator("#app-search")).toBeFocused();
  await tabTo(page, button(page, "Erledigt"));
  await page.keyboard.press("Enter");
  await expect(page.locator("#app-results .sb-list-row")).toHaveCount(1);
});

test("the language in the „Mehr“ menu swaps every word without a reload and keeps the choice", async ({ page }) => {
  await open(page, "/");
  await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
  await tabTo(page, more(page));
  await openMore(page);
  await page.keyboard.press("End");
  await expect(row(page, "English")).toHaveAttribute("lang", "en");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(heading(page)).toHaveText("Entries");
  await expect(page.locator(".sb-bottom-nav__item")).toHaveText(["Entries", "Data types", "Settings"]);
  await expect(more(page)).toBeFocused();
  await expect(more(page)).toHaveAttribute("aria-label", "More");
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(more(page)).toHaveAttribute("aria-label", "More");
});

test("only sebaro's classes (that exist) and the app's own app-* classes", async ({ page }) => {
  // every class the copy itself names (its CSS, scripts and inline brand files) …
  const root = new URL("../src/sebaro/", import.meta.url);
  const known = readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((f) => /\.(css|js|svg)$/.test(f))
    .map((f) => readFileSync(new URL(f, root), "utf8"))
    .join("\n");
  // … and the classes the guide's markup of a part writes although no rule of the stylesheet styles them (hooks)
  const HOOKS = ["sb-danger-action--outlined", "sb-diff__code", "sb-code__copy-label"];
  const routes = ["/", "/eintrag/2", "/neu", "/einstellungen", "/daten", "/impressum", "/gibt-es-nicht"];
  const bad = new Set<string>();
  for (const r of routes) {
    await open(page, r);
    const classes = await page.evaluate(() => [
      ...new Set([...document.querySelectorAll("[class]")].flatMap((e) => [...e.classList])),
    ]);
    for (const c of classes) {
      if (c.startsWith("app-")) continue;
      if (HOOKS.includes(c)) continue;
      if (!c.startsWith("sb-") || !new RegExp(`${c}(?![\\w-])`).test(known)) bad.add(`${r} ${c}`);
    }
  }
  expect([...bad]).toEqual([]);
});
