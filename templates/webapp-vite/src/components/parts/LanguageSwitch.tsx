import { Fragment } from "react";

type Props = { label: string; languages: readonly string[]; value: string; onChange(language: string): void };

/** The choice „DE / EN“ of an app without an address per language: radios that look like the two codes. */
export function LanguageSwitch({ label, languages, value, onChange }: Props) {
  return (
    <fieldset className="sb-language-switch sb-language-switch--choice">
      <legend className="sb-visually-hidden">{label}</legend>
      {languages.map((language, at) => (
        <Fragment key={language}>
          {at > 0 && <span aria-hidden="true">/</span>}
          <label className="sb-language-switch__option">
            <input
              type="radio"
              name="language"
              value={language}
              checked={language === value}
              onChange={() => onChange(language)}
            />
            <span lang={language}>{language.toUpperCase()}</span>
          </label>
        </Fragment>
      ))}
    </fieldset>
  );
}
