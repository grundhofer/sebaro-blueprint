import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { AppFrame } from "./AppFrame";

const frame = (props: { split?: boolean; sub?: boolean }) => (
  <AppFrame name="rahmen" navLabel="Hauptmenü" tile={null} places={<a href="/">Einträge</a>} {...props}>
    <section>Ansicht</section>
  </AppFrame>
);

test("the navigation comes last; a sub-view hides it on a phone, beside a list it takes the end pane", () => {
  const { container, rerender } = render(frame({}));
  const root = container.firstElementChild;
  const nav = container.querySelector("nav");
  expect(root?.className).toBe("sb-app-frame");
  expect(root?.hasAttribute("data-sb-pane")).toBe(false);
  expect(nav).toBe(container.querySelector(".sb-app-frame__body")?.lastElementChild);
  expect(nav?.className).toBe("sb-bottom-nav sb-app-frame__rail");

  rerender(frame({ sub: true }));
  expect(nav?.className).toBe("sb-bottom-nav sb-app-frame__rail sb-app-frame__rail--sub");
  expect(root?.hasAttribute("data-sb-pane")).toBe(false);

  rerender(frame({ split: true, sub: true }));
  expect(root?.className).toBe("sb-app-frame sb-app-frame--split");
  expect(root?.getAttribute("data-sb-pane")).toBe("end");
  expect(nav?.className).toBe("sb-bottom-nav sb-app-frame__rail");
});
