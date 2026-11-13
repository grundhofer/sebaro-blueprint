// appearance.ts: the chosen theme, tone and motion setting. The values live on <html> and in localStorage
// (lib/appearance.ts); the store lets the views follow them.
import { create } from "zustand";
import { readSetting, storedTheme, systemTheme, writeSetting, type Theme, type Tone } from "../lib/appearance";

type Appearance = {
  /** the chosen theme; null: the page follows the system */
  theme: Theme | null;
  tone: Tone;
  reduceMotion: boolean;
  /** Shows this theme from now on. */
  setTheme(shown: Theme): void;
  setTone(tone: Tone): void;
  setReduceMotion(on: boolean): void;
};

const stored = readSetting("theme");

export const useAppearance = create<Appearance>()((set) => ({
  theme: stored === "light" || stored === "dark" ? stored : null,
  tone: readSetting("tone") === "warm" ? "warm" : "cool",
  reduceMotion: readSetting("motion") === "reduce",
  setTheme(shown) {
    const chosen = storedTheme(shown, systemTheme());
    writeSetting("theme", chosen);
    set({ theme: chosen });
  },
  setTone(tone) {
    writeSetting("tone", tone === "warm" ? "warm" : null);
    set({ tone });
  },
  setReduceMotion(on) {
    writeSetting("motion", on ? "reduce" : null);
    set({ reduceMotion: on });
  },
}));
