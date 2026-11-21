# Theme button

`sb-theme-button` · web only; apps use `SbThemeChoice` or `SbAppearanceSettings`

The button in a website's header that switches between light and dark.

## States

- Rest: the words in a `border-strong` outline. Hover `hover-fill`, pressed `pressed-fill`, focus ring.

## Behaviour

- The site follows the system on the first visit. A press toggles and stores the choice; choosing what the system
  shows clears it again. [WEB-02]
- In a narrow header the button takes a row of its own when it does not fit beside the lockup. When even that row
  is too narrow, its words wrap between each other. Never a sideways scroll.

## Rules

- It shows the words „Hell oder Dunkel“, never an icon alone. [K28]
- It counts as the one outlined action of its area. [K13]
- The choice has one fixed place per kind of product: website header, phone app settings, the „Mehr“ menu of a web
  app, the menu „Darstellung“ on the desktop. In an app it stands with „Farbton: Kühl · Warm“ and „Bewegung immer
  reduzieren“ as one section. [K28]
