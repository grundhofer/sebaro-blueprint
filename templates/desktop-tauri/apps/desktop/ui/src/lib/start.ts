// start.ts: the end of the start. index.html shows it from the first paint on (html.sb-starting): the whole window in
// the product's colour with its white sign. Once the app has painted under it, it fades over the copy's fade of an
// entering part; with reduced motion, the system's or „Bewegung immer reduzieren“, it goes at once.
import { readSetting } from "./appearance";

let ended = false;

/** Ends the start, once. */
export function endStart(): void {
  if (ended) return;
  ended = true;
  const root = document.documentElement;
  const start = document.querySelector<HTMLElement>("body > .sb-start");
  const over = () => root.classList.remove("sb-starting");
  if (!start || readSetting("motion") === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    over();
    return;
  }
  const fade = getComputedStyle(root).getPropertyValue("--sb-x-sebaro-enter-fade-duration").trim();
  const duration = parseFloat(fade) * (fade.endsWith("ms") ? 1 : 1000);
  void start.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: "forwards" }).finished.then(over, over);
}
