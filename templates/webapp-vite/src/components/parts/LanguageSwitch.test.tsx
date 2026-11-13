import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { LanguageSwitch } from "./LanguageSwitch";

test("the languages are radios in a named group", () => {
  const onChange = vi.fn();
  render(<LanguageSwitch label="Sprache" languages={["de", "en"]} value="de" onChange={onChange} />);
  expect(screen.getByRole("group", { name: "Sprache" })).toBeTruthy();
  expect(screen.getByRole<HTMLInputElement>("radio", { name: "DE" }).checked).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: "EN" }));
  expect(onChange).toHaveBeenCalledWith("en");
});
