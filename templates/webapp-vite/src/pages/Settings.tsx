// Settings.tsx: „Einstellungen“ of a web app without a window: „Farbton: Kühl · Warm“ and „Bewegung immer
// reduzieren“. „Hell oder Dunkel“ stays the button in the header. No primary action. „Beispieldaten
// wiederherstellen“ only adds the examples that are missing, so it asks nothing, and its toast takes back only
// what it added.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { version } from "../../package.json";
import { Icon } from "../components/parts/Icon";
import { Segmented } from "../components/parts/Segmented";
import { Switch } from "../components/parts/Switch";
import { View, ViewTitle } from "../components/View";
import type { Tone } from "../lib/appearance";
import { useAppearance } from "../store/appearance";
import { useEntries } from "../store/entries";
import { useToast } from "../store/toast";

export default function Settings() {
  const { t } = useTranslation();
  const { tone, reduceMotion, setTone, setReduceMotion } = useAppearance();
  const { restoreExamples, remove } = useEntries();
  const showToast = useToast((state) => state.show);
  const [said, setSaid] = useState<Tone | null>(null);

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
            <ViewTitle>{t("settings.title")}</ViewTitle>
            <Segmented
              legend={t("settings.tone")}
              name="tone"
              options={[
                { value: "cool", label: t("settings.cool") },
                { value: "warm", label: t("settings.warm") },
              ]}
              value={tone}
              onChange={(value) => {
                setTone(value);
                setSaid(value);
              }}
            />
            <p className="sb-visually-hidden" role="status">
              {said && t(said === "warm" ? "settings.warmIsOn" : "settings.coolIsOn")}
            </p>
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
          </div>
        </div>
      </div>
    </View>
  );
}
