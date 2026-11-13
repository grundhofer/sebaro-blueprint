// appearance.ts: the chosen theme, tone and motion setting. The values live on <html> and in localStorage
// (lib/appearance.ts); the store lets the views follow them.
import { create } from "zustand";
import { otherTheme, readSetting, systemTheme, writeSetting, type Theme, type Tone } from "../lib/appearance";

type Appearance = {
  /** the chosen theme; null: the page follows the system */
  theme: Theme | null;
  tone: Tone;
  reduceMotion: boolean;
  /** Switches to the other theme and returns the one now shown. */
  switchTheme(): Theme;
  setTone(tone: Tone): void;
  setReduceMotion(on: boolean): void;
};

const stored = readSetting("theme");

export const useAppearance = create<Appearance>()((set, get) => ({
  theme: stored === "light" || stored === "dark" ? stored : null,
  tone: readSetting("tone") === "warm" ? "warm" : "cool",
  reduceMotion: readSetting("motion") === "reduce",
  switchTheme() {
    const { shown, chosen } = otherTheme(get().theme, systemTheme());
    writeSetting("theme", chosen);
    set({ theme: chosen });
    return shown;
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
