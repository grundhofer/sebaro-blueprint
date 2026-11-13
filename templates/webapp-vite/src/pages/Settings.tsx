// Settings.tsx: „Einstellungen“ of a web app: „Bewegung immer reduzieren“, „Über“ and the way to the required
// pages. „Hell oder Dunkel“ and „Farbton“ stand in the „Mehr“ menu. No primary action. „Beispieldaten
// wiederherstellen“ only adds the examples that are missing, so it asks nothing, and its toast takes back only
// what it added.
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { version } from "../../package.json";
import { Icon } from "../components/parts/Icon";
import { Switch } from "../components/parts/Switch";
import { View } from "../components/View";
import { useAppearance } from "../store/appearance";
import { useEntries } from "../store/entries";
import { useToast } from "../store/toast";

const SOURCE = "https://github.com/";
const LEGAL = [
  { to: "/impressum", title: "legal.imprintTitle" },
  { to: "/datenschutz", title: "legal.privacyTitle" },
  { to: "/barrierefreiheit", title: "legal.accessibilityTitle" },
] as const;

export default function Settings() {
  const { t } = useTranslation();
  const { reduceMotion, setReduceMotion } = useAppearance();
  const { restoreExamples, remove } = useEntries();
  const showToast = useToast((state) => state.show);

  const restore = () => {
    const added = restoreExamples();
    if (!added.length) return showToast(t("settings.resetNone"));
    showToast(t("settings.resetToast", { count: added.length }), () => remove(added.map((entry) => entry.id)));
  };

  return (
    <View name="einstellungen" title={t("settings.title")} noPrimary>
      <div className="sb-view__content">
        <div className="sb-container">
          <div className="sb-stack sb-stack--group app-column">
            <Switch
              label={t("settings.motion")}
              help={t("settings.motionHelp")}
              checked={reduceMotion}
              onChange={setReduceMotion}
            />
            <p>{t("settings.themeHint")}</p>
            <section className="sb-stack" aria-labelledby="app-about-h">
              <h2 className="sb-type-title" id="app-about-h">
                {t("settings.about")}
              </h2>
              <dl className="sb-meta-list">
                <div>
                  <dt>{t("settings.version")}</dt>
                  <dd>
                    <span className="sb-mono">{version}</span>
                  </dd>
                </div>
                <div>
                  <dt>{t("settings.storage")}</dt>
                  <dd>{t("settings.storageValue")}</dd>
                </div>
              </dl>
              <p>{t("settings.resetText")}</p>
              <div>
                <button className="sb-secondary-action" type="button" onClick={restore}>
                  <Icon name="refresh" />
                  {t("settings.reset")}
                </button>
                <p className="sb-action-hint">{t("settings.resetHint")}</p>
              </div>
            </section>
            <section className="sb-stack" aria-labelledby="app-legal-h">
              <h2 className="sb-type-title" id="app-legal-h">
                {t("settings.legal")}
              </h2>
              <ul className="sb-list" aria-labelledby="app-legal-h">
                {LEGAL.map(({ to, title }) => (
                  <li key={to} className="sb-list-row">
                    <div className="sb-list-row__main">
                      <p className="sb-list-row__title">
                        <Link className="sb-list-row__link" to={to}>
                          {t(title)}
                        </Link>
                      </p>
                    </div>
                    <span className="sb-list-row__trail">
                      <Icon name="chevron-right" />
                    </span>
                  </li>
                ))}
                <li className="sb-list-row">
                  <div className="sb-list-row__main">
                    <p className="sb-list-row__title">
                      <a className="sb-list-row__link" href={SOURCE} title={t("settings.sourceTitle")}>
                        {t("settings.source")}
                      </a>
                    </p>
                  </div>
                  <span className="sb-list-row__trail">
                    <Icon name="external-link" />
                  </span>
                </li>
              </ul>
              <p className="sb-list-end">{t("settings.copyright")}</p>
            </section>
          </div>
        </div>
      </div>
    </View>
  );
}
