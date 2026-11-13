import { expect, test } from "vitest";
import { clamp, keyWidth } from "./panes";

const sidebar = { min: 200, start: 240, max: 360 };

test("a width stays inside the limits", () => {
  expect(clamp(120, sidebar)).toBe(200);
  expect(clamp(250.4, sidebar)).toBe(250);
  expect(clamp(900, sidebar)).toBe(360);
});

test("the arrows step by 8 px, with ⇧ by 32 px; Home and End jump", () => {
  expect(keyWidth("ArrowRight", false, 240, sidebar, 1)).toBe(248);
  expect(keyWidth("ArrowLeft", true, 240, sidebar, 1)).toBe(208);
  expect(keyWidth("ArrowLeft", true, 208, sidebar, 1)).toBe(200);
  expect(keyWidth("Home", false, 240, sidebar, 1)).toBe(200);
  expect(keyWidth("End", false, 240, sidebar, 1)).toBe(360);
  expect(keyWidth("a", false, 240, sidebar, 1)).toBeNull();
});

test("a pane at the end grows with Arrow left", () => {
  const inspector = { min: 240, start: 280, max: 400 };
  expect(keyWidth("ArrowLeft", false, 280, inspector, -1)).toBe(288);
  expect(keyWidth("ArrowRight", false, 280, inspector, -1)).toBe(272);
});
