import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Heatmap, type HeatDay } from "./Heatmap";

const day = (sentence: string, today = false): HeatDay => ({ level: "seq-1", sentence, today });
const weeks = [
  { head: "ab 28.09.", days: [day("Montag: 4 Gläser"), day("Dienstag: 6 Gläser"), null] },
  { head: "ab 05.10.", days: [day("Montag: 2 Gläser"), day("Dienstag: 5 Gläser", true), null] },
];
const cell = (name: string) => screen.getByRole("cell", { name });
const press = (key: string, ctrlKey = false) =>
  fireEvent.keyDown(document.activeElement ?? document.body, { key, ctrlKey });

test("today is the tab stop; the focused day stands in the read-out, the hint comes back after it", () => {
  render(
    <>
      <p id="cap">Gläser je Tag</p>
      <Heatmap labelledBy="cap" heads={["Mo", "Di", "Mi"]} weeks={weeks} hint="Zeig auf einen Tag." />
    </>,
  );
  const readout = document.querySelector(".sb-chart__readout");
  expect(cell("Dienstag: 5 Gläser").tabIndex).toBe(0);
  expect(readout?.textContent).toBe("Zeig auf einen Tag.");

  act(() => cell("Dienstag: 5 Gläser").focus());
  expect(readout?.textContent).toBe("Dienstag: 5 Gläser");
  press("ArrowUp"); // the same weekday a week earlier
  expect(document.activeElement).toBe(cell("Dienstag: 6 Gläser"));
  press("ArrowRight"); // the next day with a value: the week's end goes on in the next week
  expect(document.activeElement).toBe(cell("Montag: 2 Gläser"));
  press("Home", true);
  expect(document.activeElement).toBe(cell("Montag: 4 Gläser"));
  fireEvent.blur(cell("Montag: 4 Gläser"));
  expect(readout?.textContent).toBe("Zeig auf einen Tag.");
});
