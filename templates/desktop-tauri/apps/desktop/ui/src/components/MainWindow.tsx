// MainWindow.tsx: the main view of the window: the title bar, the three panes with the lines between them, and the
// action zone over the full width. A pane that fails leaves the others standing.
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { COMMANDS, keysOf, type CommandId } from "../commands";
import { focusSoon } from "../lib/focus";
import { ariaKeys, platform } from "../lib/keys";
import { limits, type Pane } from "../lib/panes";
import { Content } from "../panes/Content";
import { Inspector } from "../panes/Inspector";
import { Sidebar } from "../panes/Sidebar";
import { useNotes } from "../store/notes";
import { paneOpen, useWindow } from "../store/window";
import { ActionZone } from "./ActionZone";
import { AppMenu } from "./AppMenu";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorView } from "./ErrorView";
import { Divider } from "./parts/Divider";
import { Tool } from "./parts/Tool";
import { TitleBar } from "./TitleBar";

/** The side panes: the id of the pane and of the tool that shows and hides it. */
const SIDE: Record<Pane, { id: string; tool: string }> = {
  sidebar: { id: "seite", tool: "werkzeug-seite" },
  inspector: { id: "inspektor", tool: "werkzeug-inspektor" },
};
const SIDES = Object.entries(SIDE) as [Pane, (typeof SIDE)[Pane]][];
const aria = (id: CommandId) => ariaKeys(keysOf(id) ?? "", platform());

/** A pane with its own error boundary; the fallback keeps the pane's place in the window. */
function Guarded({ place, children }: { place: string; children: ReactNode }) {
  const failed = (
    <div className={place}>
      <ErrorView />
    </div>
  );
  return <ErrorBoundary fallback={failed}>{children}</ErrorBoundary>;
}

export function MainWindow() {
  const { t } = useTranslation();
  const { notes, current } = useNotes();
  const { panes, togglePane, setPaneOverlay, setPaneWidth } = useWindow();
  const frame = useRef<HTMLDivElement>(null);
  const note = notes.find((one) => one.id === current);
  const open = { sidebar: paneOpen(panes.sidebar), inspector: paneOpen(panes.inspector) };

  // The window adapts to its own width: when it is too narrow for a pane beside the content, the copy's stylesheet
  // takes the pane out of the row. The pane then closes and opens over the content's edge, for the moment.
  useLayoutEffect(() => {
    const fit = () => {
      for (const [pane, { id }] of SIDES) {
        const element = document.getElementById(id);
        if (element) setPaneOverlay(pane, getComputedStyle(element).position === "absolute");
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, [setPaneOverlay]);

  // a pane over the content closes with Escape (the focus goes back to its tool) and with a press beside it
  const over = SIDES.filter(([pane]) => panes[pane].overlay && panes[pane].shown);
  useEffect(() => {
    if (!over.length) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector("dialog[open]")) return;
      for (const [pane] of over) togglePane(pane, false);
      focusSoon(`#${over[0]?.[1].tool}`);
    };
    const onPress = (event: PointerEvent) => {
      const at = event.target instanceof Element ? event.target : null;
      for (const [pane, { id, tool }] of over) if (!at?.closest(`#${id}, #${tool}, [popover]`)) togglePane(pane, false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPress);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPress);
    };
  });

  return (
    <div
      ref={frame}
      className="sb-window sb-window--fill"
      id="haupt"
      data-sb-density="window"
      role="group"
      aria-label={t("app.name")}
      data-sb-view="haupt"
    >
      <TitleBar place={note?.name ?? null}>
        <Tool
          id={SIDE.sidebar.tool}
          icon="sidebar"
          label={t("window.sidebar")}
          keys={keysOf("sidebar")}
          aria-expanded={open.sidebar}
          aria-controls={SIDE.sidebar.id}
          aria-keyshortcuts={aria("sidebar")}
          onClick={COMMANDS.sidebar.run}
        />
        <Tool
          id={SIDE.inspector.tool}
          icon="info"
          label={t("window.inspector")}
          keys={keysOf("inspector")}
          aria-expanded={open.inspector}
          aria-controls={SIDE.inspector.id}
          aria-keyshortcuts={aria("inspector")}
          onClick={COMMANDS.inspector.run}
        />
        <Tool
          id="werkzeug-befehle"
          icon="keyboard"
          label={t("window.palette")}
          keys={keysOf("palette")}
          aria-keyshortcuts={aria("palette")}
          onClick={COMMANDS.palette.run}
        />
        <AppMenu />
      </TitleBar>
      <div className="sb-window__body">
        <Guarded place="sb-side-nav sb-window__sidebar">
          <Sidebar id={SIDE.sidebar.id} hidden={!open.sidebar} width={panes.sidebar.width} />
        </Guarded>
        <Divider
          controls={SIDE.sidebar.id}
          label={t("window.sidebarWidth")}
          open={open.sidebar}
          width={panes.sidebar.width ?? limits("sidebar").start}
          limits={limits("sidebar")}
          onWidth={(width) => setPaneWidth("sidebar", width)}
          onOpen={(to) => togglePane("sidebar", to)}
        />
        <Guarded place="sb-window__content">
          <Content id="inhalt" />
        </Guarded>
        <Divider
          controls={SIDE.inspector.id}
          label={t("window.inspectorWidth")}
          atEnd
          open={open.inspector}
          width={panes.inspector.width ?? limits("inspector").start}
          limits={limits("inspector")}
          onWidth={(width) => setPaneWidth("inspector", width)}
          onOpen={(to) => togglePane("inspector", to)}
        />
        <Guarded place="sb-window__inspector">
          <Inspector id={SIDE.inspector.id} hidden={!open.inspector} width={panes.inspector.width} />
        </Guarded>
      </div>
      <ActionZone />
    </div>
  );
}
