import { useTranslation } from "react-i18next";
import icon from "../../../sebaro-product/web/icon-512.png";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { Icon } from "../parts/Icon";
import { Section, Specimen } from "./Specimen";
import { VALUES } from "./values";

// size in MB, icon, day; the words stand in the resources (data.files, same order)
const FILES = [
  [1.2, "file-text", "2026-10-10"],
  [3.4, "image", "2026-10-09"],
] as const;

export function MediaSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const files = t("data.files", { returnObjects: true });
  return (
    <Section name="media">
      <Specimen title={t("data.image")}>
        <figure className="app-figure">
          <img src={icon} width="256" height="256" alt={t("data.imageAlt")} loading="lazy" />
          <figcaption className="sb-list-row__meta">{t("data.imageCaption")}</figcaption>
        </figure>
      </Specimen>
      <Specimen title={t("data.file")}>
        <ul className="sb-list">
          {FILES.map(([size, glyph, day], at) => {
            const { name, kind } = files[at];
            return (
              <li key={name} className="sb-list-row">
                <span className="sb-list-row__lead">
                  <Icon name={glyph} />
                </span>
                <div className="sb-list-row__main">
                  <p className="sb-list-row__title">{name}</p>
                  <p className="sb-list-row__meta">
                    {kind} · {fmt.unit(lang, size, VALUES.units.mb, 1)} ·{" "}
                    <time dateTime={day}>{fmt.date(lang, day)}</time>
                  </p>
                </div>
                <span className="sb-list-row__trail">
                  <button className="sb-icon-button" type="button" aria-label={t("data.download", { name })}>
                    <Icon name="download" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </Specimen>
      <p>{t("data.mediaNote")}</p>
    </Section>
  );
}
