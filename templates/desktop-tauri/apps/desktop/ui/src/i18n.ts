// i18n.ts: the languages and their keys. Every word the app shows stands in i18n/<language>.json at the root of the
// repository, where the Rust side reads the same files: German and English with the same keys (i18n.test.ts).
// Numbers, dates and times come from lib/format.ts by the same language.
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import de from "../../../../i18n/de.json";
import en from "../../../../i18n/en.json";

export const LANGUAGES = ["de", "en"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const resources = { de: { translation: de }, en: { translation: en } };

declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: typeof de };
  }
}

const isLang = (value: string): value is Lang => LANGUAGES.some((lang) => lang === value);

// a desktop app speaks the language of the system, which the webview reports; German where it is neither
const system = navigator.language.slice(0, 2);

void i18n.use(initReactI18next).init({
  resources,
  lng: isLang(system) ? system : "de",
  fallbackLng: "de",
  initAsync: false,
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lang) => {
  document.documentElement.lang = lang;
});

/** The language of the page, for lib/format.ts. */
export function useLang(): Lang {
  const { i18n: instance } = useTranslation();
  return isLang(instance.language) ? instance.language : "de";
}

export default i18n;
