import { expect, test } from "vitest";
import { paneOpen, TEXT_STEPS, useWindow } from "./window";

const sidebar = () => useWindow.getState().panes.sidebar;

test("a pane turns over; in a narrow window it never starts open, and the wide choice comes back", () => {
  const { togglePane, setPaneOverlay } = useWindow.getState();
  expect(paneOpen(sidebar())).toBe(true);
  setPaneOverlay("sidebar", true); // the window narrows
  expect(paneOpen(sidebar())).toBe(false);
  togglePane("sidebar"); // opened over the content
  expect(paneOpen(sidebar())).toBe(true);
  setPaneOverlay("sidebar", false); // wide again: as the person left it
  expect(paneOpen(sidebar())).toBe(true);
  togglePane("sidebar");
  setPaneOverlay("sidebar", true);
  setPaneOverlay("sidebar", false);
  expect(paneOpen(sidebar())).toBe(false);
});

test("a chosen width and „Beim Schließen sichern“ stay on this device", () => {
  useWindow.getState().setPaneWidth("sidebar", 300);
  expect(sidebar().width).toBe(300);
  expect(localStorage.getItem("sb-pane:main:sidebar")).toBe("300");
  useWindow.getState().setAutosave(true);
  expect(localStorage.getItem("app-autosave")).toBe("on");
});

test("the text size stops at its smallest and largest step", () => {
  const { stepText } = useWindow.getState();
  for (let n = 0; n < 9; n++) stepText(1);
  expect(useWindow.getState().textStep).toBe(TEXT_STEPS.length - 1);
  for (let n = 0; n < 9; n++) stepText(-1);
  expect(useWindow.getState().textStep).toBe(0);
});
