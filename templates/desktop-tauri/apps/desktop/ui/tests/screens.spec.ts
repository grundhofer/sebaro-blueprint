// Every view and overlay of the window, light and dark, at 390, 480 and 1440 px, at 100 % and at real 200 % text
// (sebaro-checks.ts): the screen asked for (heading, view, open overlays), axe, no sideways scroll, no cut text or
// control value, no console or CSP error. 480 px is the smallest window the app allows; 390 px covers the same UI
// served as a web page.
import { expect, test, type Page } from "@playwright/test";
import { checkScreens, type Screen } from "./sebaro-checks";

const mac = process.platform === "darwin";
const MOD = mac ? "Meta" : "Control";
const TRASH = mac ? "Meta+Backspace" : "Delete";

// an overlay fades in for 200 ms even with reduced motion: check it once it stands
async function settle(page: Page): Promise<void> {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"));
}

/** A click by script: in a narrow window the sidebar and the inspector are closed, the app still answers the click. */
const press = (page: Page, selector: string) =>
  page.evaluate((s) => {
    document.querySelector<HTMLElement>(s)!.click();
  }, selector);

async function openDialog(page: Page, id: string): Promise<void> {
  await expect(page.locator(`#${id}`)).toHaveJSProperty("open", true);
  await settle(page);
}

async function openMenu(page: Page, ...path: string[]): Promise<void> {
  await page.locator("#menue-button").click();
  for (const id of path) {
    await page.locator(`[popovertarget="${id}"]`).click();
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await settle(page);
}

/** „Umzug Checkliste“ into the bin through its dialog, then the bin opened in the tree. */
async function binWithNote(page: Page): Promise<void> {
  await press(page, "[data-row='umzug']");
  await page.keyboard.press(TRASH);
  await page.locator("#dlg-papierkorb button[value='confirm']").click();
  await expect(page.locator("[data-row='bin:umzug']")).toHaveCount(1);
  await expect(page.locator("#tab-einkauf")).toBeFocused(); // the focus has settled before the tree is pressed
  await press(page, "[data-row='bin']");
  await expect(page.locator("[data-row='bin']")).toHaveAttribute("aria-expanded", "true");
}

/** Loads the window again and waits until it listens. */
async function reload(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState("networkidle");
}

/** Stands in for the Rust side, which refuses to store the choice: the UI gets the code of the error. */
async function refusingShell(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.assign(window, {
      isTauri: true,
      __TAURI_INTERNALS__: {
        invoke: (command: string) =>
          command === "set_appearance" ? Promise.reject({ code: "settingsNotSaved" }) : Promise.resolve(null),
      },
    });
  });
  await reload(page);
}

const MAIN = "[data-sb-view='haupt']";
const SETTINGS = "[data-sb-view='einstellungen']";

const screens: Screen[] = [
  { name: "fenster", path: "/", heading: "Wochenplan", view: MAIN, overlay: null },
  {
    name: "einstellungen",
    path: "/",
    heading: "Einstellungen",
    view: SETTINGS,
    overlay: null,
    prepare: async (page) => {
      await page.keyboard.press(`${MOD}+Comma`);
      await expect(page.locator("#einstellungen-h")).toBeFocused();
    },
  },
  {
    name: "palette",
    path: "/",
    heading: "Wochenplan",
    overlay: "palette",
    prepare: async (page) => {
      await page.locator("#werkzeug-befehle").click();
      await openDialog(page, "palette");
    },
  },
  {
    name: "palette-kein-treffer",
    path: "/",
    heading: "Wochenplan",
    overlay: "palette",
    prepare: async (page) => {
      await page.keyboard.press(`${MOD}+k`);
      await page.keyboard.type("Drucken");
      await expect(page.locator("#palette .sb-command-palette__empty")).toHaveText("Kein Befehl passt zu „Drucken“.");
      await settle(page);
    },
  },
  {
    // „Datei“ opens beside the menu, or in its place where the window has no room beside it
    name: "menue",
    path: "/",
    heading: "Wochenplan",
    overlay: ["menue", "menue-datei"],
    prepare: (page) => openMenu(page, "menue-datei"),
  },
  {
    // a submenu of a submenu, with the checks of a choice
    name: "menue-hell-oder-dunkel",
    path: "/",
    heading: "Wochenplan",
    overlay: ["menue", "menue-darstellung", "menue-hell"],
    prepare: (page) => openMenu(page, "menue-darstellung", "menue-hell"),
  },
  {
    name: "dialog-papierkorb",
    path: "/",
    heading: "Wochenplan",
    overlay: "dlg-papierkorb",
    prepare: async (page) => {
      await page.keyboard.press(TRASH);
      await openDialog(page, "dlg-papierkorb");
    },
  },
  {
    name: "dialog-kuerzel",
    path: "/",
    heading: "Wochenplan",
    overlay: "dlg-kuerzel",
    prepare: async (page) => {
      await openMenu(page, "menue-hilfe");
      await page.locator("#menue-hilfe [role='menuitem']:not([aria-disabled], .sb-menu__back)").click();
      await openDialog(page, "dlg-kuerzel");
    },
  },
  {
    name: "dialog-ungesichert",
    path: "/",
    heading: "Wochenplan",
    overlay: "dlg-ungesichert",
    prepare: async (page) => {
      await page.locator("#tab-wochenplan").focus();
      await page.keyboard.press("Delete");
      await openDialog(page, "dlg-ungesichert");
    },
  },
  {
    // a note in the bin, chosen in the tree: the inspector shows where it came from and „Zurücklegen“
    name: "papierkorb-notiz",
    path: "/",
    heading: "Einkauf",
    view: MAIN,
    overlay: null,
    prepare: async (page) => {
      await binWithNote(page);
      await press(page, "[data-row='bin:umzug']");
      await expect(page.locator("#zuruecklegen")).toHaveCount(1);
      await expect(page.locator("#menue-zuruecklegen")).not.toHaveAttribute("aria-disabled");
      await settle(page);
    },
  },
  {
    name: "dialog-leeren",
    path: "/",
    heading: "Einkauf",
    overlay: "dlg-leeren",
    prepare: async (page) => {
      await binWithNote(page);
      await press(page, "#leeren");
      await openDialog(page, "dlg-leeren");
      await expect(page.locator("#dlg-leeren-text")).toContainText("endgültig gelöscht");
    },
  },
  {
    // every tab closed: the window says so and has no heading of a note; the counter line keeps its place
    name: "keine-notiz",
    path: "/",
    heading: null,
    view: MAIN,
    overlay: null,
    prepare: async (page) => {
      await page.evaluate(() => localStorage.setItem("app-autosave", "on")); // a changed tab closes without asking
      await reload(page);
      for (const id of ["wochenplan", "einkauf"]) {
        await page.locator(`#tab-${id}`).focus();
        await page.keyboard.press("Delete");
      }
      await expect(page.locator(".sb-doc-tabs__none")).toBeVisible();
      await expect(page.locator(".sb-doc-tabs__none")).toBeFocused();
    },
  },
  {
    name: "suche-kein-treffer",
    path: "/",
    heading: "Wochenplan",
    view: MAIN,
    overlay: null,
    prepare: async (page) => {
      await page.keyboard.press(`${MOD}+f`);
      await expect(page.locator("#suche")).toBeFocused();
      await page.keyboard.type("Steuer");
      await expect(page.locator(".app-side-none")).toHaveText("Keine Notiz passt zu „Steuer“.");
      await settle(page);
    },
  },
  {
    // the Rust side could not store the choice: the action zone says so, with what to do
    name: "fehler-sichern",
    path: "/",
    heading: "Wochenplan",
    view: MAIN,
    overlay: null,
    prepare: async (page) => {
      await refusingShell(page);
      await page.keyboard.press(`${MOD}+k`);
      await page.keyboard.type("Dunkel");
      await page.keyboard.press("Enter");
      await expect(page.locator(".sb-primary-action-bar__message")).toContainText("Die Wahl ließ sich nicht sichern.");
      await settle(page);
    },
  },
  {
    name: "einstellungen-fehler-sichern",
    path: "/",
    heading: "Einstellungen",
    view: SETTINGS,
    overlay: null,
    prepare: async (page) => {
      await refusingShell(page);
      await page.keyboard.press(`${MOD}+Comma`);
      await page.getByRole("radio", { name: "Warm" }).check();
      await expect(page.locator(".sb-field__error")).toContainText("Die Wahl ließ sich nicht sichern.");
    },
  },
];

checkScreens(screens, { widths: [390, 480, 1440] });

// What only one width shows. Narrow: a side pane opened over the content's edge. Wide: the tooltip of a tool.
checkScreens(
  [
    {
      name: "seitenleiste-ueber-inhalt",
      path: "/",
      heading: "Wochenplan",
      view: MAIN,
      overlay: null,
      prepare: async (page) => {
        await expect(page.locator("#seite")).toBeHidden();
        await page.locator("#werkzeug-seite").click();
        await expect(page.locator("#seite")).toBeVisible();
      },
    },
    {
      name: "inspektor-ueber-inhalt",
      path: "/",
      heading: "Wochenplan",
      view: MAIN,
      overlay: null,
      prepare: async (page) => {
        await page.locator("#werkzeug-inspektor").click();
        await expect(page.locator("#inspektor")).toBeVisible();
      },
    },
  ],
  { widths: [480], scales: [1] },
);
checkScreens(
  [
    {
      name: "tooltip",
      path: "/",
      heading: "Wochenplan",
      view: MAIN,
      overlay: "werkzeug-seite-tip",
      prepare: async (page) => {
        await page.keyboard.press("Tab"); // the skip link
        await page.keyboard.press("Tab"); // the first tool
        await expect(page.locator("#werkzeug-seite")).toBeFocused();
        await expect(page.locator("#werkzeug-seite-tip")).toBeVisible();
      },
    },
  ],
  { widths: [1440], scales: [1] },
);

// A system that speaks English: the same window in the other language.
test.describe("English", () => {
  test.use({ locale: "en-GB" });
  checkScreens(
    [
      { name: "fenster-en", path: "/", heading: "Weekly plan", view: MAIN, overlay: null },
      {
        name: "dialog-kuerzel-en",
        path: "/",
        heading: "Weekly plan",
        overlay: "dlg-kuerzel",
        prepare: async (page) => {
          await openMenu(page, "menue-hilfe");
          await page.locator("#menue-hilfe [role='menuitem']:not([aria-disabled], .sb-menu__back)").click();
          await openDialog(page, "dlg-kuerzel");
        },
      },
    ],
    { widths: [480, 1440] },
  );
});
