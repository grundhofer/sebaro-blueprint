# Title bar

`sb-window__titlebar`, `sb-window__path`, `sb-window__tools` · web and desktop

The top row of a window: the app's sign tile, its name, the path of the current place and the window's tools at the
end. A phone view has a top bar instead.

## Behaviour

- The path is text, not a navigation: the places with chevron icons between them, the current place stronger. When
  room is short, the earlier places are cut first.
- On macOS the bar is the window's title bar: the system's window buttons stand at its start, and the bar leaves
  room for them. On Windows and Linux the system's frame stays and the bar sits below it.
- The whole bar drags the window, except its controls.
- The window title the system shows is „<current place> · <app>“.
- On Windows and Linux, and in a web app with a window, the button „Menü“ is the last of the tools.
- A downloaded update shows as the text action „Update bereit“ before the tools. A press opens the dialog „Update
  auf <Version>“ with „Später“ · „Jetzt neu starten“. The word stays until the restart.
- Below 480 px of window width the app's name is hidden visually, the path shows only the current place, and a text
  action keeps only its icon; screen readers still hear its word.

## Rules

- Places are reached through the sidebar, the tree and the palette; a breadcrumb navigation is for pages. [DSK-06]
- A tool that acts in place may show only an icon. Whatever opens a place shows icon and word. [K17]
- No theme button in the title bar. [DSK-05]
- The update shows no dot, no badge and no lime, never opens a window at start, and nothing restarts without the
  press. [DSK-13]
