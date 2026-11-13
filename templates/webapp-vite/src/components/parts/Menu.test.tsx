import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Menu } from "./Menu";

// jsdom keeps a popover closed and so out of reach of names and of the focus: opening it and the keys inside it are
// checked in a real browser (tests/keyboard.spec.ts)
test("the rows of a group say which one is chosen; a choice reports its value and the button has the focus", () => {
  const onChange = vi.fn();
  const tone = {
    heading: "Farbton",
    options: [
      { value: "cool", label: "Kühl" },
      { value: "warm", label: "Warm", lang: "de" },
    ],
    value: "cool",
    onChange,
  };
  render(<Menu id="more" label="Mehr" icon="more-horizontal" groups={[tone]} />);
  const button = screen.getByRole("button", { name: "Mehr" });
  const menu = screen.getByRole("menu", { hidden: true });
  expect(button.getAttribute("aria-haspopup")).toBe("menu");
  expect(button.getAttribute("popovertarget")).toBe("more");
  expect(menu.id).toBe("more");
  expect(menu.getAttribute("aria-label")).toBe("Mehr");
  const group = screen.getByRole("group", { hidden: true });
  expect(document.getElementById(group.getAttribute("aria-labelledby") ?? "")?.textContent).toBe("Farbton");
  const [cool, warm] = screen.getAllByRole("menuitemradio", { hidden: true });
  expect([cool.getAttribute("aria-checked"), warm.getAttribute("aria-checked")]).toEqual(["true", "false"]);
  expect([cool.textContent, warm.textContent, warm.lang]).toEqual(["Kühl", "Warm", "de"]);
  fireEvent.click(warm);
  expect(onChange).toHaveBeenCalledWith("warm");
  expect(document.activeElement).toBe(button);
});
