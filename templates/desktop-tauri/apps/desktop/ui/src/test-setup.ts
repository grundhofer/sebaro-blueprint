// What every unit test needs: German, a clean start after each test, and the browser parts that jsdom lacks. A
// dialog or a popover is not opened here: the end-to-end tests do that in a real browser.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom reports English as the system's language; the tests read German. Set before the stores take their words.
Object.defineProperty(navigator, "language", { value: "de-DE" });
const { useAppearance } = await import("./store/appearance");
const { useNotes } = await import("./store/notes");
const { useWindow } = await import("./store/window");

afterEach(() => {
  cleanup();
  localStorage.clear();
  for (const name of ["theme", "sbTone", "sbMotion"]) delete document.documentElement.dataset[name];
  useAppearance.setState(useAppearance.getInitialState());
  useNotes.setState(useNotes.getInitialState());
  useWindow.setState(useWindow.getInitialState());
});

window.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
