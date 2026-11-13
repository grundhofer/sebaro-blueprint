// focus.ts: where the focus goes after a command changed what is on screen, and what is scrolled into view.

/** Moves the focus to the first of the selectors that finds an element which takes it, once the change is drawn.
 *  So the focus never falls back to the page when its element went away. */
export function focusSoon(...selectors: string[]): void {
  requestAnimationFrame(() => {
    for (const selector of selectors) {
      const element = document.querySelector<HTMLElement>(selector);
      element?.focus();
      if (element && document.activeElement === element) return;
    }
  });
}

/** Scrolls `scroller`, and nothing else, by the least amount that shows `element` inside it. Unlike
 *  scrollIntoView it leaves the place alone from which Tab goes on. */
export function reveal(scroller: HTMLElement, element: HTMLElement): void {
  const [frame, box] = [scroller.getBoundingClientRect(), element.getBoundingClientRect()];
  if (box.left < frame.left) scroller.scrollLeft += box.left - frame.left;
  else if (box.right > frame.right) scroller.scrollLeft += box.right - frame.right;
  if (box.top < frame.top) scroller.scrollTop += box.top - frame.top;
  else if (box.bottom > frame.bottom) scroller.scrollTop += box.bottom - frame.bottom;
}
