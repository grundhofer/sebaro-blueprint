import { expect, test } from "vitest";
import de from "../../../../../i18n/de.json";
import { ariaKeys, chord, keyText, pressed } from "./keys";

const press = (key: string, mods: KeyboardEventInit = {}, code = "") =>
  new KeyboardEvent("keydown", { key, code, ...mods });

test("macOS shows signs, Windows and Linux words with Strg for ⌘", () => {
  expect(keyText("Mod+K", "mac", de.common.keys)).toEqual({ shown: "⌘K", said: "Befehl K" });
  expect(keyText("Mod+K", "other", de.common.keys)).toEqual({ shown: "Strg+K", said: "Steuerung K" });
  expect(keyText("Shift+Mod+N", "mac", de.common.keys).shown).toBe("⇧⌘N");
  expect(keyText("Shift+Mod+N", "other", de.common.keys).shown).toBe("Strg+Umschalt+N");
  expect(keyText("Mod+Comma", "other", de.common.keys).shown).toBe("Strg+,");
  expect(keyText("Shift+F6", "mac", de.common.keys).shown).toBe("⇧F6");
  expect(keyText("Up Down", "mac", de.common.keys)).toEqual({ shown: "↑↓", said: "Pfeil nach oben, Pfeil nach unten" });
});

test("⌃⌘ becomes Strg+Alt, and four chords have their own form off macOS", () => {
  expect(keyText("Ctrl+Mod+S", "mac", de.common.keys).shown).toBe("⌃⌘S");
  expect(chord("Ctrl+Mod+S", "other")).toEqual(["Mod", "Alt", "S"]);
  expect(keyText("Alt+Mod+I", "other", de.common.keys).shown).toBe("Strg+Alt+I");
  expect(keyText("Mod+Backspace", "other", de.common.keys).shown).toBe("Entf");
  expect(keyText("Shift+Mod+Z", "other", de.common.keys).shown).toBe("Strg+Y");
  expect(keyText("Mod+Left", "other", de.common.keys).shown).toBe("Alt+←");
  expect(keyText("Ctrl+Tab", "other", de.common.keys).shown).toBe("Strg+Tab");
});

test("aria-keyshortcuts names the chord of the platform", () => {
  expect(ariaKeys("Mod+K", "mac")).toBe("Meta+K");
  expect(ariaKeys("Mod+K", "other")).toBe("Control+K");
  expect(ariaKeys("Ctrl+Mod+S", "mac")).toBe("Control+Meta+S");
  expect(ariaKeys("Ctrl+Mod+S", "other")).toBe("Control+Alt+S");
  expect(ariaKeys("Mod+Comma", "mac")).toBe("Meta+,");
  expect(ariaKeys("Mod+Backspace", "other")).toBe("Delete");
});

test("a key press is a chord only with exactly its modifiers", () => {
  expect(pressed(press("k", { metaKey: true }), "Mod+K", "mac")).toBe(true);
  expect(pressed(press("k", { ctrlKey: true }), "Mod+K", "mac")).toBe(false);
  expect(pressed(press("k", { ctrlKey: true }), "Mod+K", "other")).toBe(true);
  expect(pressed(press("k", { metaKey: true, shiftKey: true }), "Mod+K", "mac")).toBe(false);
  expect(pressed(press("s", { ctrlKey: true, altKey: true }), "Ctrl+Mod+S", "other")).toBe(true);
  expect(pressed(press("Delete"), "Mod+Backspace", "other")).toBe(true);
  expect(pressed(press("Backspace", { metaKey: true }), "Mod+Backspace", "mac")).toBe(true);
  expect(pressed(press("F6", { shiftKey: true }), "Shift+F6", "mac")).toBe(true);
  expect(pressed(press("F6", { shiftKey: true }), "F6", "mac")).toBe(false);
  expect(pressed(press("Tab", { ctrlKey: true }), "Ctrl+Tab", "other")).toBe(true);
});

test("⌥ changes the letter, the key's place still tells it; „+“ may need ⇧", () => {
  expect(pressed(press("ˆ", { metaKey: true, altKey: true }, "KeyI"), "Alt+Mod+I", "mac")).toBe(true);
  expect(pressed(press("+", { metaKey: true, shiftKey: true }), "Mod+Plus", "mac")).toBe(true);
  expect(pressed(press("=", { metaKey: true }), "Mod+Plus", "mac")).toBe(true);
  expect(pressed(press(",", { metaKey: true }), "Mod+Comma", "mac")).toBe(true);
});
