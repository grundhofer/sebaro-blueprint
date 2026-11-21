# Containers

Container names `sb-page`, `sb-content`, `sb-view`, `sb-window` · web only

Parts switch their form by the width of their own place, not of the screen. A narrow pane on a wide screen acts like
a phone; a wide window on a small screen acts like a window.

## Behaviour

- The page (the body) is asked by the site header and footer, the padding of container and section, the page lead
  and the page title.
- The content (the container) is asked by the app grid and the app list.
- The wide view is asked by its action zone, which takes the wide form from 640 px of the view. Below that it keeps
  its state sentence above the full-width action; a phone view hides the sentence, and its list head says it.
- A window and an app frame ask their own width for their panes.
- Narrow-column parts (list, claim rows, changelog, chart rows, notes, calendar entries, heatmap, board) ask
  themselves and switch with the text size: an end part goes under or above the text.
- The table of contents and the footnote popover switch with the screen at 1024 px.
- A browser without container queries gets the same forms by the screen's width; an app frame stays in its phone
  form.

## Rules

- A container takes its width from its parent, never from its content: do not put a container, a wide view or a page
  frame into a box that shrinks to fit, unless that box has a width.
- Two page breakpoints, 640 and 1024 px. [RAU-03]
- Do not use the screen's width to claim that a place is wide.
