// appearance.ts: the chosen theme, tone and motion setting. The values live on <html> and in localStorage
// (lib/appearance.ts); the store lets the window follow them. Theme and tone also go to the Rust side, which keeps
// them in the app's settings file and gives every window its ground (lib/shell.ts).
import { create } from "zustand";
import type { Theme, Tone } from "../ipc/bindings";
import { readSetting, readTheme, readTone, writeSetting } from "../lib/appearance";
import { storeAppearance, type Failure } from "../lib/shell";

type Appearance = {
  theme: Theme;
  tone: Tone;
  reduceMotion: boolean;
  /** why the last choice was not stored by the Rust side; null: it was */
  failure: Failure | null;
  setTheme(theme: Theme): void;
  setTone(tone: Tone): void;
  setReduceMotion(on: boolean): void;
};

export const useAppearance = create<Appearance>()((set, get) => {
  // the page shows the choice at once; the answer of the Rust side says whether it will hold after a restart
  const store = () => void storeAppearance(get().theme, get().tone).then((failure) => set({ failure }));
  return {
    theme: readTheme(),
    tone: readTone(),
    reduceMotion: readSetting("motion") === "reduce",
    failure: null,
    setTheme(theme) {
      writeSetting("theme", theme === "system" ? null : theme);
      set({ theme });
      store();
    },
    setTone(tone) {
      writeSetting("tone", tone === "warm" ? "warm" : null);
      set({ tone });
      store();
    },
    setReduceMotion(on) {
      writeSetting("motion", on ? "reduce" : null);
      set({ reduceMotion: on });
    },
  };
});
