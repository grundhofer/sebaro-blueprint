// Settings.tsx: „Einstellungen“ as a view of the window, slim: one column of groups, no sidebar, no action zone,
// no primary action. Every choice takes effect at once. „Zurück zu …“ and Escape lead back.
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../components/parts/Icon";
import { Switch } from "../components/parts/Switch";
import { TitleBar } from "../components/TitleBar";
import type { Theme, Tone } from "../ipc/bindings";
import { focusSoon } from "../lib/focus";
import { useAppearance } from "../store/appearance";
import { useWindow } from "../store/window";

const THEMES: Theme[] = ["system", "light", "dark"];
const TONES: Tone[] = ["cool", "warm"];

/** `back`: the place the window returns to, for the word of the way back. */
export default function Settings({ back }: { back: string }) {
  const { t } = useTranslation();
  const { theme, tone, reduceMotion, failure, setTheme, setTone, setReduceMotion } = useAppearance();
  const { autosave, setAutosave, setView } = useWindow();
  const [said, setSaid] = useState<Tone | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // the view opens with the focus on its heading, so keyboard and screen reader start where the content starts
  useEffect(() => heading.current?.focus(), []);

  const leave = () => {
    setView("main");
    focusSoon("#zu-einstellungen", "#menue-button");
  };
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !document.querySelector("dialog[open]")) leave();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  });

  return (
    <div
      className="sb-window sb-window--fill"
      id="einstellungen"
      data-sb-density="window"
      role="group"
      aria-label={t("settings.title")}
      data-sb-view="einstellungen"
      data-sb-primary-expected="0"
    >
      <TitleBar place={t("settings.title")}>
        <button className="sb-text-action sb-text-action--compact" type="button" id="zurueck" onClick={leave}>
          <Icon name="arrow-left" />
          <span className="sb-window__word">{t("settings.back", { place: back })}</span>
        </button>
      </TitleBar>
      <div className="sb-window__body">
        <main className="sb-window__content" id="inhalt">
          <h1 ref={heading} className="sb-window__heading" id="einstellungen-h" tabIndex={-1}>
            {t("settings.title")}
          </h1>
          <p className="sb-window__meta">{t("settings.meta")}</p>
          <form className="sb-window__settings-group" aria-labelledby="set-darstellung-h">
            <h2 id="set-darstellung-h">{t("settings.groupLook")}</h2>
            <fieldset className="sb-choice-row" aria-describedby="set-hell-hilfe">
              <legend>{t("settings.theme")}</legend>
              <div className="sb-choice-row__options">
                {THEMES.map((choice) => (
                  <label key={choice} className="sb-radio">
                    <input type="radio" name="theme" checked={theme === choice} onChange={() => setTheme(choice)} />
                    <span>{t(`choice.${choice}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="sb-field__help" id="set-hell-hilfe">
              {t("settings.themeHelp")}
            </p>
            <fieldset className="sb-choice-row" aria-describedby="set-farbton-hilfe">
              <legend>{t("settings.tone")}</legend>
              <div className="sb-choice-row__options">
                {TONES.map((choice) => (
                  <label key={choice} className="sb-radio">
                    <input
                      type="radio"
                      name="tone"
                      checked={tone === choice}
                      onChange={() => {
                        setTone(choice);
                        setSaid(choice);
                      }}
                    />
                    <span>{t(`choice.${choice}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="sb-field__help" id="set-farbton-hilfe">
              {t("settings.toneHelp")}
            </p>
            <p className="sb-visually-hidden" role="status">
              {said && t(said === "warm" ? "settings.warmIsOn" : "settings.coolIsOn")}
            </p>
            {failure && (
              <p className="sb-field__error" role="alert">
                <Icon name="error--filled-16" size={16} />
                {t(`errors.${failure}`)}
              </p>
            )}
            <Switch
              label={t("settings.motion")}
              help={t("settings.motionHelp")}
              checked={reduceMotion}
              onChange={setReduceMotion}
            />
          </form>
          <form className="sb-window__settings-group" aria-labelledby="set-notizen-h">
            <h2 id="set-notizen-h">{t("settings.groupNotes")}</h2>
            <Switch
              label={t("settings.autosave")}
              help={t("settings.autosaveHelp")}
              checked={autosave}
              onChange={setAutosave}
            />
          </form>
        </main>
      </div>
    </div>
  );
}
