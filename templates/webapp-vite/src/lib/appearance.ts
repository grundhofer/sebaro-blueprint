// appearance.ts: „Hell oder Dunkel“, „Farbton“ and „Bewegung immer reduzieren“. Each is an attribute of <html> and
// a key in localStorage; theme-init.js of the copy reads the keys and sets the attributes before the first paint.

export type Theme = "light" | "dark";
export type Tone = "cool" | "warm";

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

export function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** A choice under „Hell oder Dunkel“, as it is stored. Storing the system's own mode would mean „follow the
 *  system“, so that choice is taken away instead (null): the page follows the system again. */
export function storedTheme(shown: Theme, system: Theme): Theme | null {
  return shown === system ? null : shown;
}
