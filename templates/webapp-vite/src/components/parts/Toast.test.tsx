import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Toast } from "./Toast";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// the sentence is written two frames after the toast is shown
const frames = () => act(() => void vi.advanceTimersByTime(50));

test("a toast shows its sentence and hides after 6 s", () => {
  const onHide = vi.fn();
  const { rerender } = render(<Toast id="toast" message={null} onHide={onHide} />);
  expect(screen.getByRole("status", { hidden: true }).hidden).toBe(true);

  rerender(<Toast id="toast" message={{ text: "„Wasser trinken“ erledigt" }} onHide={onHide} />);
  frames();
  expect(screen.getByRole("status").textContent).toBe("„Wasser trinken“ erledigt");
  expect(screen.queryByRole("button")).toBeNull();
  act(() => void vi.advanceTimersByTime(6000));
  expect(onHide).toHaveBeenCalledOnce();
});

test("„Rückgängig“ takes the result back and closes the toast; Escape closes it too", () => {
  const onHide = vi.fn();
  const undo = vi.fn();
  render(<Toast id="toast" message={{ text: "erledigt", undo }} onHide={onHide} />);
  frames();
  fireEvent.keyDown(document.body, { key: "Escape" });
  expect(onHide).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Rückgängig" }));
  expect(undo).toHaveBeenCalledOnce();
  expect(onHide).toHaveBeenCalledTimes(2);
});

test("the time does not run while the pointer is over the toast", () => {
  const onHide = vi.fn();
  render(<Toast id="toast" message={{ text: "erledigt" }} onHide={onHide} />);
  fireEvent.pointerEnter(screen.getByRole("status"));
  act(() => void vi.advanceTimersByTime(10000));
  expect(onHide).not.toHaveBeenCalled();
  fireEvent.pointerLeave(screen.getByRole("status"));
  act(() => void vi.advanceTimersByTime(6000));
  expect(onHide).toHaveBeenCalledOnce();
});
