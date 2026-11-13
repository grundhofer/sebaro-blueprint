import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Switch } from "./Switch";

test("a switch says its state and asks for the other one", () => {
  const onChange = vi.fn();
  render(<Switch label="Bewegung immer reduzieren" help="Gilt immer." checked={false} onChange={onChange} />);
  const button = screen.getByRole("switch", { name: "Bewegung immer reduzieren" });
  expect(button.getAttribute("aria-checked")).toBe("false");
  expect(document.getElementById(button.getAttribute("aria-describedby") ?? "")?.textContent).toBe("Gilt immer.");
  fireEvent.click(button);
  expect(onChange).toHaveBeenCalledWith(true);
});
