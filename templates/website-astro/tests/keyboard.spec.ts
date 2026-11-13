// Keyboard paths of the website (ZUG-06, ZUG-08, WEB-02, FAR-15, BEL-02, BEL-07, WEB-10), in every language of
// src/site.mjs.
import { test, expect } from "@playwright/test";
import { LANGUAGES, PAGES } from "../src/site.mjs";
import { urlOf, wordsOf } from "../src/lib/languages.mjs";

// what the copy's scripts announce (theme-button.js, sb-tone.js): they speak German and English. A further language
// gives them its words with window.sbMessages (TEC-10) and names them here.
const ANNOUNCED: Record<string, { dark: string; warm: string }> = {
  de: { dark: "Dunkel ist an.", warm: "Farbton Warm ist an." },
  en: { dark: "Dark is on.", warm: "Warm tone is on." },
};
const ARTICLE = "projekte/liste-als-csv/";

for (const [index, { code }] of LANGUAGES.entries()) {
  const s = wordsOf(code);
  const start = urlOf(code, "");
  const article = urlOf(code, ARTICLE);

  test.describe(code, () => {
    test("the skip link comes first and leads to the content", async ({ page }) => {
      await page.goto(start);
      await page.keyboard.press("Tab");
      const skip = page.locator(".sb-skip-link");
      await expect(skip).toBeFocused();
      await expect(skip).toHaveText(s.skip);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#inhalt$/);
    });

    test("„Hell oder Dunkel“ switches by keyboard, is announced and kept, twice returns to the system", async ({
      page,
    }) => {
      expect(ANNOUNCED[code], `what the copy's scripts announce in "${code}"`).toBeDefined();
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(start);
      const button = page.locator(".sb-theme-button");
      await expect(button).toHaveText(s.theme);
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(page.locator("[data-sb-theme-status]")).toHaveText(ANNOUNCED[code].dark);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await page.locator(".sb-theme-button").focus();
      await page.keyboard.press("Space");
      await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
      expect(await page.evaluate(() => localStorage.getItem("sb-theme"))).toBeNull();
    });

    test("the language link leads to the same page in every language", async ({ page }) => {
      await page.goto(article);
      await expect(page.locator(".sb-language-switch a")).toHaveText(LANGUAGES.map((l) => l.code.toUpperCase()));
      for (const { code: other } of LANGUAGES)
        await expect(page.locator(`.sb-language-switch a[hreflang="${other}"]`)).toHaveAttribute(
          "href",
          urlOf(other, ARTICLE),
        );
      await expect(page.locator('.sb-language-switch a[aria-current="true"]')).toHaveAttribute("hreflang", code);
      const next = LANGUAGES[(index + 1) % LANGUAGES.length].code;
      await page.locator(`.sb-language-switch a[hreflang="${next}"]`).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(urlOf(next, ARTICLE));
      await expect(page.locator("html")).toHaveAttribute("lang", next);
    });

    test("on the 404 page the language link leads to the part in that language", async ({ page }) => {
      await page.goto(urlOf(code, "gibt-es-nicht/"));
      await page.locator(`.sb-language-switch a[hreflang="${code}"]`).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`#${code}$`));
      await expect(page.locator(`#${code}`)).toHaveAttribute("lang", code);
    });

    test("„Farbton: Warm“ in the footer is chosen by keyboard and kept", async ({ page }) => {
      expect(ANNOUNCED[code], `what the copy's scripts announce in "${code}"`).toBeDefined();
      await page.goto(start);
      const cool = page.locator('input[name="sb-tone"][value="cool"]');
      await cool.focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("html")).toHaveAttribute("data-sb-tone", "warm");
      await expect(page.locator("[data-sb-tone-status]")).toHaveText(ANNOUNCED[code].warm);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-sb-tone", "warm");
    });

    test("wide: a footnote number moves focus to its note, its back link back to the number", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(article);
      await page.locator("#fnref-1-2").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#fn-1")).toBeFocused();
      await page.locator('#fn-1 .sb-note__back[href="#fnref-1-2"]').focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#fnref-1-2")).toBeFocused();
    });

    test("narrow: a footnote number opens the popover, Escape closes it and focus returns", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(article);
      const ref = page.locator("#fnref-2");
      await ref.focus();
      await page.keyboard.press("Enter");
      const pop = page.locator("#sb-note-popover");
      await expect(pop).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(pop).toBeHidden();
      await expect(ref).toBeFocused();
    });

    test("no request leaves the site (HAL-09)", async ({ page }) => {
      const foreign: string[] = [];
      page.on("request", (r) => {
        if (!r.url().startsWith("http://127.0.0.1")) foreign.push(r.url());
      });
      for (const { path } of PAGES) await page.goto(urlOf(code, path));
      expect(foreign).toEqual([]);
    });
  });
}
