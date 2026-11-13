import { afterEach, expect, test, vi } from "vitest";
import { useAppearance } from "./appearance";

type Invoke = (command: string, args: unknown) => Promise<unknown>;
const page = window as unknown as { isTauri?: boolean; __TAURI_INTERNALS__?: { invoke: Invoke } };

/** Stands in for the Rust side: the page then believes it runs in the app's window. */
function shell(invoke: Invoke) {
  page.isTauri = true;
  page.__TAURI_INTERNALS__ = { invoke };
  return invoke;
}

afterEach(() => {
  delete page.isTauri;
  delete page.__TAURI_INTERNALS__;
});

test("a choice stands on the page at once and goes to the Rust side with the other one", () => {
  const invoke = shell(vi.fn<Invoke>(() => Promise.resolve(null)));
  useAppearance.getState().setTheme("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(invoke).toHaveBeenLastCalledWith("set_appearance", { theme: "dark", tone: "cool" }, undefined);

  useAppearance.getState().setTone("warm");
  expect(localStorage.getItem("sb-tone")).toBe("warm");
  expect(invoke).toHaveBeenLastCalledWith("set_appearance", { theme: "dark", tone: "warm" }, undefined);

  useAppearance.getState().setTheme("system");
  expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  expect(invoke).toHaveBeenLastCalledWith("set_appearance", { theme: "system", tone: "warm" }, undefined);
});

test("a choice the Rust side could not store keeps its code, until the next one is stored", async () => {
  shell(() => Promise.reject({ code: "settingsNotSaved" }));
  useAppearance.getState().setTone("warm");
  await vi.waitFor(() => expect(useAppearance.getState().failure).toBe("settingsNotSaved"));
  shell(() => Promise.resolve(null));
  useAppearance.getState().setTone("cool");
  await vi.waitFor(() => expect(useAppearance.getState().failure).toBeNull());
});

test("the motion setting stays on this page: the Rust side is not asked", () => {
  const invoke = shell(vi.fn<Invoke>(() => Promise.resolve(null)));
  useAppearance.getState().setReduceMotion(true);
  expect(document.documentElement.dataset.sbMotion).toBe("reduce");
  expect(invoke).not.toHaveBeenCalled();
});
