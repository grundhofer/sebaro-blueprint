import { Suspense, useLayoutEffect, useRef, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useMatches } from "react-router";
import { List } from "../pages/List";
import { AppFrame } from "./parts/AppFrame";
import { Icon } from "./parts/Icon";
import { SignTile } from "./SignTile";
import { PaneContext } from "./View";

// the top-level places of the app, three to five: icon and word, the current one with the filled icon
const PLACES = [
  { to: "/", icon: "home", label: "list.title" },
  { to: "/daten", icon: "chart-bar", label: "data.title" },
  { to: "/einstellungen", icon: "settings", label: "settings.title" },
] as const;

/** What a route says about itself (its `handle`): the top-level place it belongs to, and whether it is a
 *  sub-view of that place. */
export type Place = { place?: (typeof PLACES)[number]["to"]; sub?: boolean };

/** The shell of a web app: the app frame with its places. The list is the place whose views open beside it: it
 *  keeps standing in the start pane, an entry or the form stands in the end pane. */
export function Shell() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const route = useMatches().at(-1);
  const { place, sub } = (route?.handle ?? {}) as Place;
  const list = place === "/";
  const shown = useRef(pathname);

  // a new view: its heading takes the focus, so keyboard and screen reader start where the content starts. Not on
  // the first load, where the focus belongs to the browser. A layout effect: the focus moves in the same step in
  // which the heading appears, not a moment after it.
  useLayoutEffect(() => {
    if (shown.current === pathname) return;
    shown.current = pathname;
    document.querySelector<HTMLElement>("#inhalt h1")?.focus();
  }, [pathname]);

  // the skip link moves the focus and leaves the address as it is
  const skip = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById("inhalt")?.focus();
  };

  return (
    <div className="app-window">
      <a className="sb-skip-link" href="#inhalt" onClick={skip}>
        {t("app.skip")}
      </a>
      <AppFrame
        name="rahmen"
        split={list}
        sub={sub}
        navLabel={t("nav.label")}
        tile={<SignTile size={32} />}
        places={PLACES.map(({ to, icon, label }) => (
          <Link key={to} className="sb-bottom-nav__item" to={to} aria-current={to === place ? "page" : undefined}>
            <Icon name={to === place ? `${icon}--filled` : icon} />
            <span className="sb-bottom-nav__label">{t(label)}</span>
          </Link>
        ))}
      >
        {list && <List beside={sub} current={route?.params.id} />}
        <PaneContext value={list ? "end" : "start"}>
          <Suspense>
            <Outlet />
          </Suspense>
        </PaneContext>
        {list && !sub && (
          <div className="sb-app-frame__pane sb-app-frame__pane--end">
            <p className="sb-app-frame__none">{t("list.none")}</p>
          </div>
        )}
      </AppFrame>
    </div>
  );
}
