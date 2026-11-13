// areas.ts: F6 and ⇧F6 move the focus through the areas of the window: title bar, sidebar, content, inspector,
// action zone. An area that is hidden is skipped; each area gets back what had the focus there last.

const AREAS =
  ".sb-window__titlebar, .sb-window__sidebar, .sb-window__content, .sb-window__inspector, .sb-window > .sb-bottom-block";
// what Tab would stop at; of a tree or a row of tabs that is its one row with tabindex 0
const STOPS = ["a[href]", "button:not([disabled])", "input:not([disabled])", "[tabindex]"]
  .map((stop) => `${stop}:not([tabindex="-1"])`)
  .join(", ");

const last = new WeakMap<Element, HTMLElement>();
/** the area the person works in; a menu or a dialog only passes through */
let working: Element | null = null;

const onScreen = (element: Element) => element.getClientRects().length > 0;

/** Remembers where the focus is. The window calls it for every focus that moves. */
export function noteFocus(target: EventTarget | null): void {
  if (!(target instanceof HTMLElement) || target.closest("[popover], dialog")) return;
  const area = target.closest(AREAS);
  if (!area || area === target) return;
  last.set(area, target);
  if (target.getAttribute("aria-haspopup") !== "menu") working = area;
}

/** Moves the focus to the next area, or the one before. It counts from the area the person works in, so „Nächster
 *  Bereich“ in the menu does not count from the title bar that holds the menu. */
export function moveArea(back: boolean): void {
  const areas = [...document.querySelectorAll<HTMLElement>(AREAS)].filter(onScreen);
  const from = working && onScreen(working) ? working : areas.find((area) => area.contains(document.activeElement));
  const at = from ? areas.indexOf(from as HTMLElement) : -1;
  const next = areas[at < 0 ? (back ? areas.length - 1 : 0) : (at + (back ? -1 : 1) + areas.length) % areas.length];
  if (!next) return;
  const held = last.get(next);
  const stop =
    held && next.contains(held) && onScreen(held)
      ? held
      : [...next.querySelectorAll<HTMLElement>(STOPS)].find(onScreen);
  // an area with nothing to press takes the focus itself and shows the ring
  if (!stop && !next.hasAttribute("tabindex")) next.setAttribute("tabindex", "-1");
  (stop ?? next).focus();
  working = next;
}
