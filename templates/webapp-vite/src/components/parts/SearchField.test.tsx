import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, test } from "vitest";
import { SearchField } from "./SearchField";

function Search() {
  const [value, setValue] = useState("");
  return <SearchField id="q" label="Einträge durchsuchen" placeholder="Suchen …" value={value} onChange={setValue} />;
}

test("„Suche leeren“ shows only with text; the button and Escape empty the field and keep the focus in it", () => {
  render(<Search />);
  const field = screen.getByRole<HTMLInputElement>("searchbox", { name: "Einträge durchsuchen" });
  expect(screen.queryByRole("button", { name: "Suche leeren" })).toBeNull();

  fireEvent.change(field, { target: { value: "Rosen" } });
  fireEvent.click(screen.getByRole("button", { name: "Suche leeren" }));
  expect(field.value).toBe("");
  expect(document.activeElement).toBe(field);

  fireEvent.change(field, { target: { value: "Rosen" } });
  fireEvent.keyDown(field, { key: "Escape" });
  expect(field.value).toBe("");
  expect(screen.queryByRole("button", { name: "Suche leeren" })).toBeNull();
});
