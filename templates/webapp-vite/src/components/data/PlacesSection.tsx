import { useTranslation } from "react-i18next";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { Samples, Section, Specimen } from "./Specimen";

export function PlacesSection() {
  const { t } = useTranslation();
  const address = t("data.mapAddress");
  return (
    <Section name="places">
      <Specimen title={t("data.placeText")}>
        <Samples
          rows={[
            [t("data.cityCountry"), t("data.cityV")],
            [
              <>
                {t("data.serverPlace")} <DemoMarker />
              </>,
              <>
                <Icon name="pin" size={16} /> {t("data.serverV")}
              </>,
            ],
            [t("data.noCity"), t("data.noCityV")],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.map")}>
        <div className="sb-place">
          <div className="sb-place__address">
            <Icon name="pin" size={20} />
            <div>
              <p>{address}</p>
              <p>
                <a className="sb-place__link" href={`geo:0,0?q=${encodeURIComponent(address)}`}>
                  {t("data.openInMaps")}
                  <Icon name="external-link--16" size={16} />
                </a>
              </p>
            </div>
          </div>
          <svg
            className="sb-place__map"
            viewBox="0 0 360 180"
            width="360"
            height="180"
            role="img"
            aria-label={t("data.mapLabel")}
          >
            <rect className="sb-place__ground" width="360" height="180" />
            <path className="sb-place__water" d="M0 150 C80 128 140 172 230 146 S330 112 360 124 V180 H0 Z" />
            <path className="sb-place__road" d="M120 0 L136 180" />
            <path className="sb-place__road" d="M250 0 L238 140" />
            <path className="sb-place__road" d="M0 30 L120 36" />
            <path className="sb-place__road sb-place__road--main" d="M0 76 L360 90" />
            <circle className="sb-place__marker" cx="190" cy="62" r="20" />
            <svg
              className="sb-icon sb-place__pin"
              x="178"
              y="50"
              width="24"
              height="24"
              aria-hidden="true"
              focusable="false"
            >
              <use href="#pin" />
            </svg>
          </svg>
        </div>
      </Specimen>
    </Section>
  );
}
