# Desktop app

What holds for a desktop app beyond the core rules and the view types. Its parts: `../parts/`.

## Window

- A window is title bar, sidebar, content, inspector and one action zone across its full width. [DSK-01, EBE-08]
- macOS: our bar is the title bar. Windows and Linux: the system's frame, our bar below. [DSK-06]
- Sidebar and inspector can be hidden or dragged narrower; the content keeps 480 px. [DSK-04, DSK-07]
- Rows are 32, 48 or 64 px; 48 px under touch. [RAU-06]
- The total of the states stands once, at the start of the action zone. [STA-07]
- Each of several windows is a full view. A window opens on the stored ground. [DSK-12, DSK-14]
- System notifications only while no window of the app is in front. [DSK-13]

## Menu and keyboard

- The five menu groups stand in the menu bar on macOS, behind the button „Menü“ elsewhere. [DSK-08]
- „Hell oder Dunkel“ and „Farbton“ stand in „Darstellung“ and in the settings, a view in the main window (⌘,).
  [DSK-02, DSK-05]
- ⌘K opens the command palette. The 15 fixed shortcuts mean the same in every app and are written with the
  fonts' key signs; F6 goes through the window's areas. [NAV-09, DSK-09, ICO-08]

## Documents

- Open documents are tabs above the content, a drag shows its target in cobalt and has a way without a pointer,
  inspector fields are compact. [DSK-10, DSK-11, DSK-15]
- An editor sets Markdown source in sebaro Sans; nothing covers selected text. [DSK-03]
