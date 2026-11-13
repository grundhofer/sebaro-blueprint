import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ClaimRow } from "./ClaimRow";

test("a press opens the note of a claim and closes it again", () => {
  render(
    <ul>
      <ClaimRow claim="Kein Konto" result="bestanden">
        <p>Manifest der App</p>
      </ClaimRow>
    </ul>,
  );
  const toggle = screen.getByRole("button", { name: /Kein Konto/ });
  const note = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(note?.hidden).toBe(true);
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(note?.hidden).toBe(false);
});
