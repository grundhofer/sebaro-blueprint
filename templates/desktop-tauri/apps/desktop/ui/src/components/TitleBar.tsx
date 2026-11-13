// TitleBar.tsx: the bar at the top of the window: the sign tile, the app's name, the place, the tools and „Menü“.
// On macOS it is the title bar itself, so the window is dragged by it; the tools are never a drag region.
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { showWindowTitle } from "../lib/shell";
import { SignTile } from "./SignTile";

type Props = {
  /** the place the window shows: a note's name, „Einstellungen“; null while it shows none */
  place: string | null;
  /** the tools at the end of the bar */
  children: ReactNode;
};

const DRAG = { "data-tauri-drag-region": "" };

export function TitleBar({ place, children }: Props) {
  const { t } = useTranslation();
  // the title the system shows for the window: „<place> · <app>“
  const title = place ? t("app.title", { place }) : t("app.name");
  useEffect(() => {
    document.title = title;
    void showWindowTitle(title);
  }, [title]);
  return (
    <div className="sb-window__titlebar" {...DRAG}>
      <SignTile size={32} />
      <p className="sb-window__name" translate="no" {...DRAG}>
        {t("app.name")}
      </p>
      <p className="sb-window__path" data-sb-truncate {...DRAG}>
        <span className="sb-visually-hidden">{t("window.place")}</span>
        <span {...DRAG}>{place}</span>
      </p>
      <div className="sb-window__tools" role="group" aria-label={t("window.tools")}>
        {children}
      </div>
    </div>
  );
}
