// What every unit test needs: the app's languages, a clean start after each test, and the browser parts that jsdom
// lacks. A dialog or a popover is not opened here: the end-to-end tests do that in a real browser.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import i18n from "./i18n";
import { useEntries } from "./store/entries";
import { useListView } from "./store/list";
import { useToast } from "./store/toast";

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage("de");
  localStorage.clear();
  useEntries.setState(useEntries.getInitialState());
  useListView.setState(useListView.getInitialState());
  useToast.setState(useToast.getInitialState());
});

window.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.matchMedia ??= (query: string) => ({ matches: false, media: query }) as MediaQueryList;
