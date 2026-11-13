import { useTranslation } from "react-i18next";
import { keyText, platform } from "../../lib/keys";

/** A shortcut as this platform writes it: „⌘K“ on macOS, „Strg+K“ elsewhere, and its spoken form for screen
 *  readers. `spec` is the macOS form ("Mod+K"); keys side by side are separated by a space ("Up Down"). */
export function Keys({ spec }: { spec: string }) {
  const { t } = useTranslation();
  const text = keyText(spec, platform(), t("common.keys", { returnObjects: true }));
  return (
    <span className="sb-keys">
      <span aria-hidden="true">{text.shown}</span>
      <span className="sb-visually-hidden">{text.said}</span>
    </span>
  );
}
