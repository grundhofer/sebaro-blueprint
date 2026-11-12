import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ThemeButton } from "./ThemeButton";

test("the label stays; the status line says which mode is on", () => {
  render(<ThemeButton label="Hell oder Dunkel" onSwitch={() => "dark"} />);
  const button = screen.getByRole("button", { name: "Hell oder Dunkel" });
  expect(screen.getByRole("status").textContent).toBe("");
  fireEvent.click(button);
  expect(button.textContent).toBe("Hell oder Dunkel");
  expect(screen.getByRole("status").textContent).toBe("Dunkel ist an.");
});
