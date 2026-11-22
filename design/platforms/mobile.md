# Phone app

What holds for a phone app beyond the core rules and the view types.

## The frame

- The app draws edge to edge and takes mode, tone and reduced motion from its own settings. The system's dynamic
  colour stays off. [MOB-01]
- No stock controls of the platform: sebaro's parts replace them. [MOB-02]
- „Hell oder Dunkel“ is a settings group with the rows „Wie das System“, „Hell“ and „Dunkel“, the tone beside it.
  No toggle in the top bar. [MOB-04]
- The language is chosen in the system's settings for the app; a settings row leads there. [K26]

## Touch

- Haptics only under touch and only twice: one short light pulse when the primary action succeeded, a stronger
  double pulse when a deletion was confirmed. An instant result plays none. [MOB-03]
- A shake may trigger the primary action only in addition to its button: the same result, switchable off in the
  settings, named in the primary action's hint. [MOB-10]

## Outside the app

- A notification's title is the thing in the words of the app's list, without the app's name; its text one calm
  sentence or none. At most two actions, each a verb or a time with its target, never „OK“, „Öffnen“, „Später“ or
  a destructive one. [MOB-09]
- Private content (a thought, a health value) shows only its title, so it holds on every lock screen. [MOB-09]
- A home-screen widget: [home-screen-widget](../parts/home-screen-widget.md). [MOB-11]

## Camera

- A page camera and the full-screen page view are always dark:
  [camera-and-photos](../parts/camera-and-photos.md). [MOB-12]
