// appearance.ts: „Hell oder Dunkel“, „Farbton“ and „Bewegung immer reduzieren“. Each is an attribute of <html> and
// a key in localStorage; theme-init.js of the copy reads the keys and sets the attributes before the first paint.
// Theme and tone are kept by the Rust side too (its settings file): it writes the two keys before the page starts.
import type { Theme, Tone } from "../ipc/bindings";

const SETTINGS = {
  theme: { attribute: "theme", key: "sb-theme" },
  tone: { attribute: "sbTone", key: "sb-tone" },
  motion: { attribute: "sbMotion", key: "sb-motion" },
} as const;

/** What <html> says now (data-theme, data-sb-tone, data-sb-motion); undefined: not set. */
export function readSetting(name: keyof typeof SETTINGS): string | undefined {
  return document.documentElement.dataset[SETTINGS[name].attribute];
}

/** Sets a setting and stores it; null takes it away, so the page follows the system or the standard again. */
export function writeSetting(name: keyof typeof SETTINGS, value: string | null): void {
  const { attribute, key } = SETTINGS[name];
  if (value === null) delete document.documentElement.dataset[attribute];
  else document.documentElement.dataset[attribute] = value;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage blocked: the setting holds until the page closes
  }
}

/** The theme <html> shows: "system" while no choice is set. */
export function readTheme(): Theme {
  const set = readSetting("theme");
  return set === "light" || set === "dark" ? set : "system";
}

export function readTone(): Tone {
  return readSetting("tone") === "warm" ? "warm" : "cool";
}
