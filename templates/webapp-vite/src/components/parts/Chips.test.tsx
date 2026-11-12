import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Chips } from "./Chips";

test("one chip is pressed; a press on another asks for it", () => {
  const onChange = vi.fn();
  const options = [
    { value: "all", label: "Alle" },
    { value: "open", label: "Offen" },
  ];
  render(<Chips label="Filter" options={options} value="all" onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Alle" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "Offen" }).getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: "Offen" }));
  expect(onChange).toHaveBeenCalledWith("open");
});
