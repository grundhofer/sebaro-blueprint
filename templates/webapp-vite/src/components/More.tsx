import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, useLang } from "../i18n";
import { systemTheme } from "../lib/appearance";
import { useAppearance } from "../store/appearance";
import { Menu } from "./parts/Menu";

/** The „Mehr“ menu of a web app: „Hell oder Dunkel“, „Farbton: Kühl · Warm“ beside it, and the language. A status
 *  line says the result of a choice. */
export function More() {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const { theme, tone, setTheme, setTone } = useAppearance();
  const [said, setSaid] = useState<"light" | "dark" | "cool" | "warm" | null>(null);

  return (
    <>
      <Menu
        id="app-more"
        label={t("more.label")}
        icon="more-horizontal"
        groups={[
          {
            heading: t("more.theme"),
            options: [
              { value: "light", label: t("more.light") },
              { value: "dark", label: t("more.dark") },
            ],
            value: theme ?? systemTheme(),
            onChange: (value) => {
              const shown = value === "dark" ? "dark" : "light";
              setTheme(shown);
              setSaid(shown);
            },
          },
          {
            heading: t("more.tone"),
            options: [
              { value: "cool", label: t("more.cool") },
              { value: "warm", label: t("more.warm") },
            ],
            value: tone,
            onChange: (value) => {
              const chosen = value === "warm" ? "warm" : "cool";
              setTone(chosen);
              setSaid(chosen);
            },
          },
          {
            heading: t("more.language"),
            options: LANGUAGES.map((language) => ({ value: language, label: t(`more.${language}`), lang: language })),
            value: lang,
            onChange: (value) => {
              // every word changes: nothing more to say
              setSaid(null);
              void i18n.changeLanguage(value);
            },
          },
        ]}
      />
      <p className="sb-visually-hidden" role="status">
        {said && t(`more.${said}IsOn`)}
      </p>
    </>
  );
}
