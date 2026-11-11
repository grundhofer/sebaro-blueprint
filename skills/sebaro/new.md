# Start a new sebaro product

## 1 Clarify with the owner (at most five questions)

- What the product is for, in one sentence, and the one view that is its reason to exist.
- Its three to five main places.
- What data it keeps, and whether anything leaves the device.
- Its name and id. Its sign comes from the owner; until it exists, use the placeholder of the starter.

## 2 Plan

Write the list of views into the project (`docs/` or the README): each view with its type from
`<kit>/design/views.md` and its primary action. Mark the core view. Show the list to the owner and wait for the
OK.

## 3 Set up

1. Copy the starter of the product kind. Read its `BLUEPRINT.md` and the gaps its README names.
2. Rename package, id and name. Run the starter's checks once before you change anything else; they must be green.
3. Paste `<kit>/templates/AGENTS-snippet.md` into the project's `AGENTS.md` and fill in its four lines.

## 4 Build, in this order

1. The frame: navigation, top bar, action zone, start.
2. List, detail and form of the main content, with sample data.
3. The four states (empty, loading, error, no permission) for every view that can have them.
4. Settings and about.
5. The core view, built from sebaro's parts.
6. Data and logic behind the views, as the blueprint structures them.

Where the copy has no part for something, build it beside the copy and add a line to `docs/sebaro-luecken.md`.

## 5 Before the first release

Tests, CI, release and the update bot as the blueprint of the kind describes them. Then the check of
`<kit>/design/KERN.md`, rule 31, for every view. Say what you could not check.
