// panes.ts: the widths of the side panes. The limits are tokens of the copy; the content between the panes keeps its
// own least width through the copy's stylesheet.

export type Pane = "sidebar" | "inspector";
export type Limits = { min: number; start: number; max: number };

/** Dragging this far under the least width closes the pane. */
export const COLLAPSE_AT = 48;

/** The limits of a pane in px, from the copy's tokens (--sb-x-sebaro-pane-*) as the page has them. */
export function limits(pane: Pane): Limits {
  const style = getComputedStyle(document.documentElement);
  const px = (name: string) => Math.round(parseFloat(style.getPropertyValue(`--sb-x-sebaro-pane-${name}`)));
  return { min: px(`${pane}-min`), start: px(pane), max: px(`${pane}-max`) };
}

/** A width inside the limits, in whole px. */
export function clamp(width: number, { min, max }: Limits): number {
  return Math.round(Math.min(max, Math.max(min, width)));
}

/** The width a key asks for: the arrows step by 8 px (32 px with ⇧), Home and End jump to the limits. `grow` is the
 *  direction in which Arrow right widens the pane: 1 for a pane at the start, -1 for one at the end. */
export function keyWidth(key: string, shift: boolean, width: number, limits: Limits, grow: 1 | -1): number | null {
  const step = (shift ? 32 : 8) * grow;
  if (key === "ArrowRight") return clamp(width + step, limits);
  if (key === "ArrowLeft") return clamp(width - step, limits);
  if (key === "Home") return limits.min;
  if (key === "End") return limits.max;
  return null;
}
