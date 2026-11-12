import { Suspense, useEffect, useRef, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router";
import { LANGUAGES } from "../i18n";
import { useAppearance } from "../store/appearance";
import { useToast } from "../store/toast";
import { Icon } from "./parts/Icon";
import { LanguageSwitch } from "./parts/LanguageSwitch";
import { ThemeButton } from "./parts/ThemeButton";
import { Toast } from "./parts/Toast";
import { SignTile } from "./SignTile";

const SOURCE = "https://github.com/";

/** The shell of a web app without a window: the header with „Einstellungen“, DE / EN and „Hell oder Dunkel“, the
 *  view of the route, the footer with the required links, and the place of the one toast. */
export function Shell() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const switchTheme = useAppearance((state) => state.switchTheme);
  const toast = useToast();
  const main = useRef<HTMLElement>(null);
  const shown = useRef(pathname);

  // a new view: its heading takes the focus, so keyboard and screen reader start where the content starts. Not on
  // the first load, where the focus belongs to the browser.
  useEffect(() => {
    if (shown.current === pathname) return;
    shown.current = pathname;
    main.current?.querySelector("h1")?.focus();
  }, [pathname]);

  // the skip link moves the focus and leaves the address as it is
  const skip = (event: MouseEvent) => {
    event.preventDefault();
    main.current?.focus();
  };

  return (
    <>
      <a className="sb-skip-link" href="#inhalt" onClick={skip}>
        {t("app.skip")}
      </a>
      <header className="sb-site-header">
        <Link className="sb-lockup" to="/">
          <SignTile size={32} />
          <span className="sb-wordmark" translate="no">
            {t("app.name")}
          </span>
        </Link>
        <div className="sb-site-header__links">
          <nav className="sb-site-nav" aria-label={t("header.navLabel")}>
            <Link to="/einstellungen" aria-current={pathname === "/einstellungen" ? "page" : undefined}>
              {t("header.settings")}
            </Link>
          </nav>
          <LanguageSwitch
            label={t("header.language")}
            languages={LANGUAGES}
            value={i18n.language}
            onChange={(language) => void i18n.changeLanguage(language)}
          />
        </div>
        <ThemeButton label={t("header.theme")} onSwitch={switchTheme} />
      </header>
      <main ref={main} id="inhalt" tabIndex={-1}>
        <Suspense>
          <Outlet />
        </Suspense>
      </main>
      <footer className="sb-site-footer">
        <p>{t("footer.copyright")}</p>
        <ul className="sb-site-footer__links" aria-label={t("footer.linksLabel")}>
          <li>
            <Link to="/impressum">{t("footer.imprint")}</Link>
          </li>
          <li>
            <Link to="/datenschutz">{t("footer.privacy")}</Link>
          </li>
          <li>
            <Link to="/barrierefreiheit">{t("footer.accessibility")}</Link>
          </li>
          <li>
            <a href={SOURCE} title={t("footer.githubTitle")}>
              {t("footer.github")}
              <Icon name="external-link--16" size={16} />
            </a>
          </li>
        </ul>
      </footer>
      <div className="app-toast-place">
        <Toast id="app-toast" message={toast.message} onHide={toast.hide} />
      </div>
    </>
  );
}
