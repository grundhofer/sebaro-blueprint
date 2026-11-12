import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

afterEach(() => vi.useRealTimers());

test("„Kopieren“ copies the code and says „Kopiert“ for 2 s", async () => {
  vi.useFakeTimers();
  const writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  render(
    <CodeBlock language="Shell" label="Shell-Beispiel">
      pnpm build
    </CodeBlock>,
  );
  const key = screen.getByRole("button", { name: "Kopieren" });
  await act(async () => {
    fireEvent.click(key);
    await Promise.resolve();
  });
  expect(writeText).toHaveBeenCalledWith("pnpm build");
  expect(key.textContent).toBe("Kopiert");
  expect(screen.getByRole("status").textContent).toBe("Kopiert");
  act(() => void vi.advanceTimersByTime(2000));
  expect(key.textContent).toBe("Kopieren");
});
