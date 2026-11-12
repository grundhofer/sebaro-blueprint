import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { Section, Specimen } from "./Specimen";

const RATINGS = [20, 11, 4, 2, 1]; // how many gave 5, 4, 3, 2, 1 of 5

export function RatingSection() {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <Section name="rating">
      <Specimen title={t("data.ratingT")}>
        <p className="sb-rating">
          <Icon name="star--filled" />
          <span className="sb-visually-hidden">{t("data.ratingHidden")}</span>
          <span className="sb-rating__value">{t("data.ratingValue", { value: fmt.num(lang, 4.2, 1) })}</span>{" "}
          <span className="sb-rating__count">{t("data.ratingCount", { n: 38 })}</span>
        </p>
        <figure className="sb-chart">
          <ul className="sb-chart__rows">
            {RATINGS.map((count, at) => (
              <li key={at} className="sb-chart__row">
                <span className="sb-chart__name">
                  {t("data.ratingRow", { stars: 5 - at })}
                  <b>{count}</b>
                </span>
                <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <rect className="sb-chart__fill" width={(count / 20) * 100} height="12" />
                </svg>
              </li>
            ))}
          </ul>
          <figcaption>
            {t("data.ratingCaption")} <DemoMarker />
          </figcaption>
        </figure>
      </Specimen>
    </Section>
  );
}
