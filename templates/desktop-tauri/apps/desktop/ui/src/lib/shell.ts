// shell.ts: the one place where the UI calls the Rust side, through the bindings generated from its commands
// (ipc/bindings.ts). An error comes back as a code; the string table has its sentence (`errors.<code>`).
// In a plain browser (vite preview, the end-to-end tests) there is no shell: a call then does nothing.
import { isTauri } from "@tauri-apps/api/core";
import { commands, type ErrorCode, type Theme, type Tone } from "../ipc/bindings";

/** The code of a failed call: one of the shell's, or "unknown" when the call itself broke. */
export type Failure = ErrorCode | "unknown";

/** Stores „Hell oder Dunkel“ and „Farbton“ in the app's settings file and gives them to every window. */
export async function storeAppearance(theme: Theme, tone: Tone): Promise<Failure | null> {
  if (!isTauri()) return null;
  try {
    const result = await commands.setAppearance(theme, tone);
    return result.status === "ok" ? null : result.error.code;
  } catch {
    return "unknown";
  }
}

/** The title the system shows for the window. A title the system refuses stays as it was. */
export async function showWindowTitle(title: string): Promise<void> {
  if (!isTauri()) return;
  try {
    await commands.setWindowTitle(title);
  } catch {
    // nothing the person could act on
  }
}
