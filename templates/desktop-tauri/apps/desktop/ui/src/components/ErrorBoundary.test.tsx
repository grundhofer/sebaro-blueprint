import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorView } from "./ErrorView";

function Broken(): never {
  throw new Error("broken on purpose");
}

test("a part that fails gives way to the error view; what stands beside it stays", () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {}); // React reports the caught error
  render(
    <>
      <p>Seitenleiste</p>
      <ErrorBoundary fallback={<ErrorView />}>
        <Broken />
      </ErrorBoundary>
    </>,
  );
  expect(screen.getByText("Seitenleiste")).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toContain("Deine Notizen sind unverändert.");
  expect(screen.getByRole("button", { name: "Noch mal versuchen" })).toBeTruthy();
  quiet.mockRestore();
});
