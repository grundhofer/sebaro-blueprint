import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, test } from "vitest";
import { Listbox } from "./Listbox";

const options = ["Wochenplan", "Umzug", "Lesestapel"].map((name, at) => ({ id: String(at), name, icon: "file-text" }));

function Projects() {
  const [selected, setSelected] = useState(["0"]);
  return (
    <>
      <p id="head">Projekte</p>
      <Listbox labelledBy="head" options={options} selected={selected} onChange={setSelected} />
    </>
  );
}

test("the arrows move the focus, Space adds the focused row or takes it away", () => {
  render(<Projects />);
  const rows = screen.getAllByRole("option");
  const chosen = () => rows.map((row) => row.getAttribute("aria-selected"));
  expect(chosen()).toEqual(["true", "false", "false"]);

  rows[0].focus();
  fireEvent.keyDown(rows[0], { key: "ArrowDown" });
  expect(document.activeElement).toBe(rows[1]);
  expect(rows.map((row) => row.tabIndex)).toEqual([-1, 0, -1]);
  fireEvent.keyDown(rows[1], { key: " " });
  expect(chosen()).toEqual(["true", "true", "false"]);
  fireEvent.click(rows[0]);
  expect(chosen()).toEqual(["false", "true", "false"]);
  fireEvent.keyDown(rows[1], { key: "End" });
  expect(document.activeElement).toBe(rows[2]);
});
