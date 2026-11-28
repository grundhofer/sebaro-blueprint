# Browser extension

What holds for a browser extension (Chrome and Firefox) beyond the core rules and the view types.

## Popup

- The popup is one view without navigation and without a start: tile and title on top, the content, the primary
  action at the bottom. A link opens the options page. [ERW-01, K29]
- On a page it cannot act on, it shows its empty state, not an error. [K22]

## Options page

- The options page is the extension's full view in a tab and follows [webapp.md](webapp.md): places, „Mehr“ with „Hell
  oder Dunkel“ and „Farbton“, „Einstellungen“ with „Über“ and the licences. The popup follows its choice. [NAV-06, K28]

## Outside the popup

- A notification follows the phone's rule: its title is the thing, its text one calm sentence, at most two actions; a
  click opens the thing. Firefox shows no actions, so none is the only way. [MOB-09]
- A content script runs only when the person asks. Its own interface stands in a closed shadow root with the tokens,
  Esc ends it, and the page is as before once it ends. [ERW-03]

## Permissions and stores

- Permissions only for what the extension does. A site permission is asked when the person acts, for exactly that
  page's origin, with one line that says what for. [ERW-02]
- The store text says what the extension does and where it stops, concretely. [K27]
