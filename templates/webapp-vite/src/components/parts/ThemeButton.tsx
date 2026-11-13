import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = { label: string; onSwitch(): "light" | "dark" };

/** The button „Hell oder Dunkel“. Its label never changes; a status line says the result of a press. */
export function ThemeButton({ label, onSwitch }: Props) {
  const { t } = useTranslation();
  const [shown, setShown] = useState<"light" | "dark" | null>(null);
  return (
    <>
      <button className="sb-theme-button" type="button" onClick={() => setShown(onSwitch())}>
        {label}
      </button>
      <p className="sb-visually-hidden" role="status">
        {shown && t(shown === "dark" ? "common.darkIsOn" : "common.lightIsOn")}
      </p>
    </>
  );
}
