import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Field } from "./Field";

test("a field names its control; an error marks it and is read with it, before the help", () => {
  const field = (error?: string) => (
    <Field id="effort" label="Aufwand" help="Ganze Minuten." error={error}>
      {(control) => <input {...control} />}
    </Field>
  );
  const { rerender } = render(field());
  const input = screen.getByLabelText("Aufwand");
  expect(input.getAttribute("aria-invalid")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("effort-help");

  rerender(field("Aufwand fehlt."));
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.getAttribute("aria-describedby")).toBe("effort-error effort-help");
  expect(document.getElementById("effort-error")?.textContent).toBe("Aufwand fehlt.");
});

test("an optional field says so beside its label", () => {
  render(
    <Field id="note" label="Notiz" optional>
      {(control) => <textarea {...control} />}
    </Field>,
  );
  expect(screen.getByLabelText("Notiz (optional)")).toBeTruthy();
});
