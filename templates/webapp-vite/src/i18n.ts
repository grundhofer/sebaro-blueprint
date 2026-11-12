// i18n.ts: the languages and their keys. Every word the app shows stands in src/i18n/<language>.json, German and
// English with the same keys (i18n.test.ts); numbers, dates and times come from lib/format.ts by the same language.
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import de from "./i18n/de.json";
import en from "./i18n/en.json";

export const LANGUAGES = ["de", "en"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const resources = { de: { translation: de }, en: { translation: en } };

declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: typeof de };
  }
}

const isLang = (value: string): value is Lang => LANGUAGES.some((lang) => lang === value);

// theme-init.js has put the stored choice (sb-lang) into <html lang> before the first paint
const start = document.documentElement.lang;

void i18n.use(initReactI18next).init({
  resources,
  lng: isLang(start) ? start : "de",
  fallbackLng: "de",
  initAsync: false,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lang) => {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem("sb-lang", lang);
  } catch {
    // storage blocked: the choice holds until the page closes
  }
});

/** The language of the page, for lib/format.ts. */
export function useLang(): Lang {
  const { i18n: instance } = useTranslation();
  return isLang(instance.language) ? instance.language : "de";
}

export default i18n;
