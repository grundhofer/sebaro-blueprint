import { afterEach, expect, test, vi } from "vitest";
import { showWindowTitle, storeAppearance } from "./shell";

type Invoke = (command: string, args: unknown) => Promise<unknown>;
const page = window as unknown as { isTauri?: boolean; __TAURI_INTERNALS__?: { invoke: Invoke } };

/** Stands in for the shell: the page then believes it runs in the app's window. */
function shell(invoke: Invoke) {
  page.isTauri = true;
  page.__TAURI_INTERNALS__ = { invoke };
}

afterEach(() => {
  delete page.isTauri;
  delete page.__TAURI_INTERNALS__;
});

test("without a shell a call does nothing and fails nothing", async () => {
  expect(await storeAppearance("dark", "warm")).toBeNull();
  await showWindowTitle("Wochenplan · Musterapp Desktop");
});

test("the choice goes to the command with its typed arguments", async () => {
  const invoke = vi.fn<Invoke>(() => Promise.resolve(null));
  shell(invoke);
  expect(await storeAppearance("dark", "warm")).toBeNull();
  expect(invoke).toHaveBeenCalledWith("set_appearance", { theme: "dark", tone: "warm" }, undefined);
});

test("an error from Rust comes back as its code; a call that breaks is „unknown“", async () => {
  shell(() => Promise.reject({ code: "settingsNotSaved" }));
  expect(await storeAppearance("light", "cool")).toBe("settingsNotSaved");
  shell(() => Promise.reject(new Error("no channel")));
  expect(await storeAppearance("light", "cool")).toBe("unknown");
});
