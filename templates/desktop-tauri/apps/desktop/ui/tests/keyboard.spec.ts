// The window by keyboard alone: the fixed shortcuts reach their targets, Escape closes, the focus returns and never
// falls to the page. Then what the browser has to show for the parts: the menu and its submenus, the lines between
// the panes, the panes of a narrow window, the tooltip. Last, a class check: every class is sebaro's or the app's.
// On macOS the chords use ⌘, elsewhere Strg: the UI reads the platform from the browser here, from the Rust side
// in the app.
import { readFileSync, readdirSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

test.use({ reducedMotion: "reduce", colorScheme: "light" });

const mac = process.platform === "darwin";
const MOD = mac ? "Meta" : "Control";
const SIDEBAR = mac ? "Control+Meta+s" : "Control+Alt+s";
const TRASH = mac ? "Meta+Backspace" : "Delete";

async function load(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

const row = (page: Page, id: string) => page.locator(`[data-row='${id}']`);
const message = (page: Page) => page.locator(".sb-primary-action-bar__message");

test("⌘K / Strg+K opens the palette, Escape closes it and the focus returns", async ({ page }) => {
  await load(page);
  await page.locator("#neue-notiz").focus();
  await page.keyboard.press(`${MOD}+k`);
  await expect(page.locator("#palette")).toHaveJSProperty("open", true);
  await expect(page.locator("#palette input")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#palette")).toHaveJSProperty("open", false);
  await expect(page.locator("#neue-notiz")).toBeFocused();
  // its own shortcut closes it too
  await page.keyboard.press(`${MOD}+k`);
  await page.keyboard.press(`${MOD}+k`);
  await expect(page.locator("#palette")).toHaveJSProperty("open", false);
});

test("a palette option runs: „Dunkel“ sets the theme, and the check follows in the menu", async ({ page }) => {
  await load(page);
  await page.keyboard.press(`${MOD}+k`);
  await page.keyboard.type("Dunkel");
  // „Wie das System“ is found by a keyword; the option whose name matches is the active one
  await expect(page.locator("#palette [role='option']")).toHaveText(["Wie das System", "Dunkel"]);
  await expect(page.locator("#palette [aria-selected='true'] .sb-command-palette__hit")).toHaveText("Dunkel");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#menue-hell [role='menuitemradio']")).toHaveText(["Wie das System", "Hell", "Dunkel"]);
  await expect(page.locator("#menue-hell [aria-checked='true']")).toHaveText("Dunkel");
});

test("the arrows move through the palette, a keyword finds an option", async ({ page }) => {
  await load(page);
  await page.keyboard.press(`${MOD}+k`);
  const active = page.locator("#palette [aria-selected='true']");
  await expect(active).toHaveText(/^Neue Notiz/);
  await page.keyboard.press("ArrowUp"); // wraps to the last
  await expect(active).toHaveText(/^Einstellungen/);
  await page.keyboard.type("papier"); // a keyword of „Farbton Warm“
  await expect(active).toHaveText("Farbton Warm");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-sb-tone", "warm");
});

test("⌘, / Strg+, opens the settings, Escape leads back", async ({ page }) => {
  await load(page);
  await page.locator("#neue-notiz").focus();
  await page.keyboard.press(`${MOD}+Comma`);
  await expect(page.locator("#einstellungen-h")).toBeFocused();
  await expect(page.locator("#haupt")).toHaveCount(0);
  await expect(page).toHaveTitle("Einstellungen · Musterapp Desktop");
  await expect(page.locator("#zurueck")).toHaveText("Zurück zu Wochenplan");
  await page.keyboard.press("Escape");
  await expect(page.locator("#zu-einstellungen")).toBeFocused();
  await expect(page).toHaveTitle("Wochenplan · Musterapp Desktop");
});

test("the settings hold: theme, tone, motion and „Beim Schließen sichern“ survive a reload", async ({ page }) => {
  await load(page);
  await page.keyboard.press(`${MOD}+Comma`);
  await page.getByRole("radio", { name: "Dunkel" }).check();
  await page.getByRole("radio", { name: "Warm" }).check();
  await page.getByRole("switch", { name: "Bewegung immer reduzieren" }).click();
  await page.getByRole("switch", { name: "Beim Schließen sichern" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-sb-tone", "warm");
  await expect(page.locator("html")).toHaveAttribute("data-sb-motion", "reduce");
  // a changed tab now closes without the question
  await page.locator("#tab-wochenplan").focus();
  await page.keyboard.press("Delete");
  await expect(page.locator("#tab-wochenplan")).toHaveCount(0);
  await expect(page.locator("#tab-einkauf")).toBeFocused();
});

test("F6 and ⇧F6 move through the window's areas", async ({ page }) => {
  await load(page);
  const area = () => page.evaluate(() => document.activeElement?.closest("[id]")?.id);
  await page.locator("#werkzeug-seite").focus();
  await page.keyboard.press("F6");
  expect(await page.evaluate(() => !!document.activeElement?.closest("#seite"))).toBe(true);
  await page.keyboard.press("F6");
  await expect(page.locator("#tab-wochenplan")).toBeFocused();
  await page.keyboard.press("F6"); // the inspector has nothing to press: it takes the focus itself
  expect(await area()).toBe("inspektor");
  await page.keyboard.press("F6");
  await expect(page.locator("#neue-notiz")).toBeFocused();
  await page.keyboard.press("Shift+F6");
  await page.keyboard.press("Shift+F6");
  await expect(page.locator("#tab-wochenplan")).toBeFocused();
  await page.keyboard.press("Shift+F6");
  await page.keyboard.press("Shift+F6"); // each area gives back what had the focus there last
  await expect(page.locator("#werkzeug-seite")).toBeFocused();
});

test("⌃⌘S / Strg+Alt+S hides and shows the sidebar", async ({ page }) => {
  await load(page);
  await page.locator("#neue-notiz").focus();
  await page.keyboard.press(SIDEBAR);
  await expect(page.locator("#seite")).toBeHidden();
  await expect(page.locator("#werkzeug-seite")).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press(SIDEBAR);
  await expect(page.locator("#seite")).toBeVisible();
});

test("closing a changed tab asks: Abbrechen keeps it, Verwerfen closes it", async ({ page }) => {
  await load(page);
  const tab = page.locator("#tab-wochenplan");
  await tab.focus();
  await page.keyboard.press("Delete");
  const dialog = page.locator("#dlg-ungesichert");
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(dialog.locator("button[value='cancel']")).toBeFocused();
  await expect(dialog.locator(".sb-dialog__actions button")).toHaveText(["Abbrechen", "Verwerfen", "Sichern"]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveJSProperty("open", false);
  await expect(tab).toBeFocused();
  await page.keyboard.press(`${MOD}+w`); // ⌘W / Strg+W asks the same
  await dialog.locator("button[value='discard']").click();
  await expect(tab).toHaveCount(0);
  await expect(page.locator("#tab-einkauf")).toBeFocused();
  await expect(page.locator("#stand")).toHaveText("Alles gesichert.");
});

test("the arrows choose a tab, ⌃⇥ goes on to the next, the menu moves a tab", async ({ page }) => {
  await load(page);
  await page.locator("#tab-wochenplan").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-einkauf")).toBeFocused();
  await expect(page.locator("#tab-einkauf")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("main h1:visible")).toHaveText("Einkauf");
  await page.keyboard.press("Control+Tab");
  await expect(page.locator("#tab-wochenplan")).toBeFocused();
  await page.locator("#menue-button").click();
  await page.locator("[popovertarget='menue-fenster']").click();
  await page.locator("#menue-fenster [role='menuitem']", { hasText: "Reiter nach hinten" }).click();
  await expect(page.locator("[role='tab']")).toHaveText([/Einkauf/, /Wochenplan/]);
});

test("⌘⌫ / Entf asks before a note goes to the bin, then it is gone from its folder", async ({ page }) => {
  await load(page);
  await row(page, "umzug").click();
  await page.keyboard.press(TRASH);
  const dialog = page.locator("#dlg-papierkorb");
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(page.locator("#dlg-papierkorb-title")).toHaveText("„Umzug Checkliste“ in den Papierkorb legen?");
  await dialog.locator("button[value='confirm']").click();
  await expect(row(page, "umzug")).toHaveCount(0);
  // the focus is on the tab now on screen, not on the page
  await expect(page.locator("#tab-einkauf")).toBeFocused();
});

test("the bin keeps the note: open it in the tree, „Zurücklegen“ brings it back", async ({ page }) => {
  await load(page);
  await expect(page.locator("#menue-zuruecklegen")).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("#menue-leeren")).toHaveAttribute("aria-disabled", "true");
  await row(page, "umzug").click();
  await page.keyboard.press(TRASH);
  await page.locator("#dlg-papierkorb button[value='confirm']").click();
  await expect(message(page)).toHaveText("„Umzug Checkliste“ liegt im Papierkorb.");
  // the bin is a parent row now; by keyboard: focus it, → opens it, ↓ moves to the note, Enter chooses it
  const bin = row(page, "bin");
  await expect(bin).toHaveAttribute("aria-expanded", "false");
  await bin.focus();
  await page.keyboard.press("ArrowRight");
  await expect(bin).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await expect(row(page, "bin:umzug")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#eigenschaften")).toContainText("Projekte");
  await expect(page.locator("#menue-zuruecklegen")).not.toHaveAttribute("aria-disabled");
  await page.locator("#zuruecklegen").click();
  await expect(message(page)).toHaveText("„Umzug Checkliste“ liegt wieder in „Projekte“.");
  await expect(row(page, "umzug")).toBeFocused();
  await expect(page.locator("[data-row^='bin:']")).toHaveCount(0);
  await expect(bin).not.toHaveAttribute("aria-expanded");
});

test("„Papierkorb leeren …“ asks, says it is for good, and only „Papierkorb leeren“ deletes", async ({ page }) => {
  await load(page);
  for (const id of ["umzug", "oktober"]) {
    if (id === "oktober") await row(page, "folder:journal").click();
    await row(page, id).click();
    await page.keyboard.press(TRASH);
    await page.locator("#dlg-papierkorb button[value='confirm']").click();
  }
  await expect(page.locator("#menue-leeren")).not.toHaveAttribute("aria-disabled");
  await row(page, "bin").click();
  await expect(page.locator("#eigenschaften")).toContainText("2 Notizen");
  const dialog = page.locator("#dlg-leeren");
  await page.locator("#leeren").click();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(page.locator("#dlg-leeren-title")).toHaveText("Papierkorb leeren?");
  await expect(page.locator("#dlg-leeren-text")).toHaveText(
    "Die 2 Notizen im Papierkorb werden endgültig gelöscht. Das lässt sich nicht rückgängig machen.",
  );
  await expect(dialog.locator("button[value='cancel']")).toBeFocused();
  await expect(dialog.locator(".sb-dialog__actions button")).toHaveText(["Abbrechen", "Papierkorb leeren"]);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-row^='bin:']")).toHaveCount(2);
  await page.locator("#leeren").click();
  await dialog.locator("button[value='confirm']").click();
  await expect(page.locator("[data-row^='bin:']")).toHaveCount(0);
  await expect(message(page)).toHaveText("Der Papierkorb ist leer.");
  await expect(row(page, "bin")).toBeFocused();
  await expect(page.locator("#menue-leeren")).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("[data-row='umzug'], [data-row='oktober']")).toHaveCount(0);
});

test("⌘N / Strg+N is the primary action: a new note opens in a tab", async ({ page }) => {
  await load(page);
  await page.locator("#werkzeug-seite").focus();
  await page.keyboard.press(`${MOD}+n`);
  await expect(page.locator("#tab-neu-1")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-neu-1")).toBeFocused();
  await expect(page.locator(".sb-window__path")).toContainText("Neue Notiz 1");
  await expect(row(page, "neu-1")).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveTitle("Neue Notiz 1 · Musterapp Desktop");
});

test("⌘F / Strg+F leads to the search; it filters the tree, and Escape empties it", async ({ page }) => {
  await load(page);
  await page.keyboard.press(SIDEBAR); // also from a hidden sidebar
  await page.keyboard.press(`${MOD}+f`);
  await expect(page.locator("#suche")).toBeFocused();
  await page.keyboard.type("27");
  await expect(page.locator("[role='treeitem']:visible")).toHaveText([/Journal/, /27\. Oktober/, /Papierkorb/]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#suche")).toHaveValue("");
  await expect(row(page, "wochenplan")).toBeVisible();
});

test("⌘+ and ⌘− change the text of the content only", async ({ page }) => {
  await load(page);
  const size = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
  const [text, name] = [await size(".app-doc p"), await size("[data-row='wochenplan']")];
  await page.keyboard.press(`${MOD}+Equal`);
  expect(parseFloat(await size(".app-doc p"))).toBeGreaterThan(parseFloat(text));
  expect(await size("[data-row='wochenplan']")).toBe(name);
  await page.keyboard.press(`${MOD}+Minus`);
  expect(await size(".app-doc p")).toBe(text);
});

test("F10 opens „Menü“ on its first item, Escape gives the focus back to where it was", async ({ page }) => {
  await load(page);
  await page.locator("#neue-notiz").focus();
  await page.keyboard.press("F10");
  await expect(page.locator("#menue [popovertarget='menue-datei']")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#menue")).toBeHidden();
  await expect(page.locator("#neue-notiz")).toBeFocused();
  await page.keyboard.press("F10"); // F10 again closes it too
  await page.keyboard.press("F10");
  await expect(page.locator("#menue")).toBeHidden();
  await expect(page.locator("#neue-notiz")).toBeFocused();
});

test("the menu by keyboard: arrows, submenus, letters; a chosen item acts and the focus returns", async ({ page }) => {
  await load(page);
  const button = page.locator("#menue-button");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowUp"); // wraps to „Hilfe“
  await expect(page.locator("[popovertarget='menue-hilfe']")).toBeFocused();
  await page.keyboard.press("d"); // the next item that starts with „d“: „Datei“, then „Darstellung“
  await page.keyboard.press("d");
  await expect(page.locator("[popovertarget='menue-darstellung']")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const sidebar = page.locator("#menue-darstellung [role='menuitemcheckbox']").first();
  await expect(sidebar).toBeFocused();
  await expect(sidebar).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowLeft"); // back to the item that opened the submenu
  await expect(page.locator("#menue-darstellung")).toBeHidden();
  await expect(page.locator("[popovertarget='menue-darstellung']")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter"); // „Seitenleiste“: the pane hides, every menu closes
  await expect(page.locator("#seite")).toBeHidden();
  await expect(page.locator("#menue")).toBeHidden();
  await expect(button).toBeFocused();
  await expect(sidebar).toHaveAttribute("aria-checked", "false");
  // an item without a target is skipped by the arrows
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight"); // „Datei“
  await page.keyboard.press("ArrowDown"); // from „Neue Notiz“ past „Neues Fenster“ and „Öffnen …“ to „Schließen“
  await expect(page.locator("#menue-datei [role='menuitem']:focus")).toHaveText(/^Schließen/);
});

test("the line beside the sidebar sets its width: keys, the menu, and the width is kept", async ({ page }) => {
  await load(page);
  const divider = page.locator(".sb-window__divider[aria-controls='seite']");
  const width = () => page.locator("#seite").evaluate((el) => el.getBoundingClientRect().width);
  expect(await width()).toBe(240);
  await divider.focus();
  await page.keyboard.press("ArrowRight");
  expect(await width()).toBe(248);
  await expect(divider).toHaveAttribute("aria-valuenow", "248");
  await expect(divider).toHaveAttribute("aria-valuetext", "248 Pixel");
  await page.keyboard.press("Shift+ArrowLeft");
  expect(await width()).toBe(216);
  await page.keyboard.press("End");
  expect(await width()).toBe(360);
  await expect(page.locator("#menue-breite [aria-checked='true']")).toHaveText("Breit");
  await page.keyboard.press("Enter"); // closes the pane; the line stays at the window's edge
  await expect(page.locator("#seite")).toBeHidden();
  await expect(divider).toHaveAttribute("aria-valuetext", "zugeklappt");
  await page.keyboard.press("Enter");
  await page.reload();
  expect(await width()).toBe(360);
  // the way without dragging and without the line
  await page.locator("#menue-button").click();
  await page.locator("[popovertarget='menue-darstellung']").click();
  await page.locator("[popovertarget='menue-breite']").click();
  await page.locator("#menue-breite [role='menuitemradio']", { hasText: "Schmal" }).click();
  expect(await width()).toBe(200);
});

test("the line is dragged with the pointer; far under the least width the pane closes", async ({ page }) => {
  await load(page);
  const width = () => page.locator("#seite").evaluate((el) => el.getBoundingClientRect().width);
  const box = (await page.locator(".sb-window__divider[aria-controls='seite']").boundingBox())!;
  const [x, y] = [box.x + box.width / 2, box.y + 200];
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 60, y);
  expect(await width()).toBe(300);
  await page.mouse.move(x + 400, y); // never wider than the largest width
  expect(await width()).toBe(360);
  await page.mouse.move(x - 150, y); // 90 px: well under the least width of 200
  await expect(page.locator("#seite")).toBeHidden();
  await page.mouse.up();
  await expect(page.locator("html")).not.toHaveAttribute("data-sb-dragging");
});

test("a narrow window: the side panes start closed, open over the content, and close again", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 800 });
  await load(page);
  const [sidebar, tool] = [page.locator("#seite"), page.locator("#werkzeug-seite")];
  await expect(sidebar).toBeHidden();
  await expect(page.locator("#inspektor")).toBeHidden();
  await tool.click();
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveCSS("position", "absolute");
  await page.keyboard.press("Escape");
  await expect(sidebar).toBeHidden();
  await expect(tool).toBeFocused();
  await tool.click();
  await page.locator("main h1:visible").click(); // a press beside the pane
  await expect(sidebar).toBeHidden();
  // wide again, the panes come back as they were left
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(sidebar).toBeVisible();
  await expect(page.locator("#inspektor")).toBeVisible();
});

test("the title bar is the region the window is dragged by; its tools are not", async ({ page }) => {
  await load(page);
  const drag = "[data-tauri-drag-region]";
  await expect(page.locator(`.sb-window__titlebar${drag}`)).toHaveCount(1);
  await expect(page.locator(`.sb-window__name${drag}, .sb-window__path${drag}`)).toHaveCount(2);
  await expect(page.locator(`.sb-window__tools${drag}, .sb-window__tools ${drag}`)).toHaveCount(0);
});

test("in the search field the keys that edit text stay the field's", async ({ page }) => {
  await load(page);
  await page.locator("#suche").fill("Umzug");
  await page.keyboard.press(TRASH);
  await expect(page.locator("#dlg-papierkorb")).toHaveJSProperty("open", false);
  await page.keyboard.press(`${MOD}+k`); // a shortcut of the window still works from the field
  await expect(page.locator("#palette")).toHaveJSProperty("open", true);
});

test("a tooltip names the tool and its shortcut after keyboard focus; Escape hides it alone", async ({ page }) => {
  await load(page);
  const tip = page.locator("#werkzeug-befehle-tip");
  await page.locator("#werkzeug-inspektor").focus();
  await page.keyboard.press("Tab");
  await expect(tip).toBeVisible();
  await expect(tip).toHaveText(mac ? "Befehle⌘KBefehl K" : "BefehleStrg+KSteuerung K");
  await page.keyboard.press("Escape");
  await expect(tip).toBeHidden();
  await expect(page.locator("#werkzeug-befehle")).toBeFocused();
});

test("the shortcuts are written for the platform, and the list names all 15", async ({ page }) => {
  await load(page);
  await page.locator("#menue-button").click();
  await page.locator("[popovertarget='menue-hilfe']").click();
  await page.locator("#menue-hilfe [role='menuitem']", { hasText: "Tastaturkürzel" }).click();
  const rows = page.locator("#dlg-kuerzel tbody tr");
  await expect(rows).toHaveCount(15);
  await expect(rows.first().locator(".sb-keys [aria-hidden]")).toHaveText(mac ? "⌘K" : "Strg+K");
  await expect(rows.nth(5).locator(".sb-keys [aria-hidden]")).toHaveText(mac ? "⌃⌘S" : "Strg+Alt+S");
  await expect(page.locator("#dlg-kuerzel button[value='close']")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#menue-button")).toBeFocused();
});

test("the Rust side gets the choice and the window's title through the generated commands", async ({ page }) => {
  await page.addInitScript(() => {
    const calls: unknown[] = [];
    const invoke = (command: string, args: unknown) => Promise.resolve(void calls.push([command, args]));
    Object.assign(window, { calls, isTauri: true, __TAURI_INTERNALS__: { invoke } });
  });
  await load(page);
  await page.keyboard.press(`${MOD}+k`);
  await page.keyboard.type("Dunkel");
  await page.keyboard.press("Enter");
  await page.locator("#tab-einkauf").click();
  const calls = await page.evaluate(() => (window as unknown as { calls: [string, unknown][] }).calls);
  expect(calls).toEqual([
    ["set_window_title", { title: "Wochenplan · Musterapp Desktop" }],
    ["set_appearance", { theme: "dark", tone: "cool" }],
    ["set_window_title", { title: "Einkauf · Musterapp Desktop" }],
  ]);
  await expect(message(page)).toBeEmpty(); // stored: nothing to say
});

test("a system that speaks English gets English, numbers and dates too", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-GB" });
  const page = await context.newPage();
  await load(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("main h1:visible")).toHaveText("Weekly plan");
  await expect(page.locator("#eigenschaften")).toContainText("2026-10-28, 09:40");
  await expect(page.locator("#neue-notiz")).toHaveText("New note");
  await context.close();
});

test("a pane that cannot be loaded says so, and „Noch mal versuchen“ loads the window again", async ({ page }) => {
  // the chunk main.tsx loads with lazy(): held back, the settings fail as on a broken disk
  const lazy = /\/assets\/Settings-.*\.js$/;
  await page.route(lazy, (route) => route.abort());
  await load(page);
  await page.keyboard.press(`${MOD}+Comma`);
  await expect(page.getByRole("alert")).toContainText("Deine Notizen sind unverändert.");
  await page.unroute(lazy);
  await page.getByRole("button", { name: "Noch mal versuchen" }).click();
  await expect(page.locator("main h1:visible")).toHaveText("Wochenplan");
});

test("only sebaro's classes (that exist) and the app's own app-* classes", async ({ page }) => {
  // every class the copy itself names (its CSS and scripts) …
  const root = new URL("../src/sebaro/", import.meta.url);
  const known = readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((f) => /\.(css|js|svg)$/.test(f))
    .map((f) => readFileSync(new URL(f, root), "utf8"))
    .join("\n");
  // … and the classes the guide's markup of a part writes although no rule of the stylesheet styles them (hooks)
  const HOOKS = ["sb-danger-action--outlined"];
  const bad = new Set<string>();
  const collect = async (view: string) => {
    const classes = await page.evaluate(() => [
      ...new Set([...document.querySelectorAll("[class]")].flatMap((e) => [...e.classList])),
    ]);
    for (const c of classes) {
      if (c.startsWith("app-") || HOOKS.includes(c)) continue;
      if (!c.startsWith("sb-") || !new RegExp(`${c}(?![\\w-])`).test(known)) bad.add(`${view} ${c}`);
    }
  };
  await load(page);
  await row(page, "umzug").click();
  await page.keyboard.press(TRASH);
  await page.locator("#dlg-papierkorb button[value='confirm']").click();
  await row(page, "bin").click();
  await collect("window");
  await page.keyboard.press(`${MOD}+Comma`);
  await expect(page.locator("#einstellungen-h")).toBeFocused();
  await collect("settings");
  expect([...bad]).toEqual([]);
});
