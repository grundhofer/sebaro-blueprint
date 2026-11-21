# Page

`sb-page`, `sb-container`, `sb-section`, `sb-page-lead`, `sb-skip-link`, `sb-view`, `sb-visually-hidden` · web only

The frame of a web page: ground and type on the body, the width limit, the sections and the skip link. An app view
on the web uses the view part of the same frame.

## Behaviour

- The page class on the body sets ground, text colour and body type. Container and section depend on it.
- The container limits the page's width and keeps the side margin, which grows from 1024 px. It never lets the page
  scroll sideways.
- Sections are padded and set apart by a hairline. A section's actions end its content: secondary actions first, the
  primary action last.
- The page lead is the page title in the display role with a lead paragraph.
- The skip link „Zum Inhalt“ is the first thing focus reaches. It is out of sight until focused and then stands as a
  chip at the top start.
- A view is the frame of an app view. Its wide form is for web apps and simple desktop windows; a window with panes
  is the window part.
- Paragraphs keep the reading measure; rows of a list keep the full width.
- The visually hidden class keeps a word for screen readers only.

## Rules

- Container and section need the page class on `body`. The columns of the grid (4, 8, 12 with a 16 or 24 px gutter)
  you build yourself. [RAU-02]
- Two breakpoints, 640 and 1024 px; everything else adapts to its own place. [RAU-03]
- Every page starts with the skip link. [ZUG-06]
- Headings, landmarks, the page language and alt texts are part of every page. [K30]
- Compose has no page grid yet. [RAU-02]
