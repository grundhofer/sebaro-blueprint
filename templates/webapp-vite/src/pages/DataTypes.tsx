// DataTypes.tsx: „Datenarten“, every kind of data as sebaro shows it, each with the markup of its part. All values
// are invented and marked „Beispieldaten“. The view's one primary action is „Als CSV exportieren“.
import { useTranslation } from "react-i18next";
import { CategoriesSection } from "../components/data/CategoriesSection";
import { ChartsSection } from "../components/data/ChartsSection";
import { CollectionsSection } from "../components/data/CollectionsSection";
import { EmptySection } from "../components/data/EmptySection";
import { EvidenceSection } from "../components/data/EvidenceSection";
import { IdentitySection } from "../components/data/IdentitySection";
import { MediaSection } from "../components/data/MediaSection";
import { NumbersSection } from "../components/data/NumbersSection";
import { PlacesSection } from "../components/data/PlacesSection";
import { RatingSection } from "../components/data/RatingSection";
import { SECTIONS } from "../components/data/Specimen";
import { StateSection } from "../components/data/StateSection";
import { TechSection } from "../components/data/TechSection";
import { TextSection } from "../components/data/TextSection";
import { TimeSection } from "../components/data/TimeSection";
import { DemoMarker } from "../components/DemoMarker";
import { ActionZone } from "../components/parts/ActionZone";
import { Icon } from "../components/parts/Icon";
import { View, ViewTitle } from "../components/View";
import { toCsv } from "../lib/entries";
import { useEntries } from "../store/entries";

/** Hands a text to the browser as a file to save. */
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DataTypes() {
  const { t } = useTranslation();
  const entries = useEntries((state) => state.entries);
  return (
    <View name="daten" title={t("data.title")}>
      <div className="sb-view__content">
        <div className="sb-container">
          <div className="sb-stack">
            <ViewTitle>{t("data.title")}</ViewTitle>
            <p>
              {t("data.intro")} <DemoMarker />
            </p>
            <nav aria-labelledby="app-d-toc-h">
              <h2 className="sb-type-label" id="app-d-toc-h">
                {t("data.toc")}
              </h2>
              <ul className="sb-cluster app-toc">
                {SECTIONS.map((name) => (
                  <li key={name}>
                    <a href={`#app-d-${name}`}>{t(`data.sections.${name}`)}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <TextSection />
          <NumbersSection />
          <TimeSection />
          <StateSection />
          <CategoriesSection />
          <IdentitySection />
          <TechSection />
          <CollectionsSection />
          <ChartsSection />
          <MediaSection />
          <PlacesSection />
          <RatingSection />
          <EmptySection />
          <EvidenceSection />
        </div>
      </div>
      <ActionZone status={t("data.exportState")} hint={t("data.exportHint")}>
        {/* written on this device and saved where the browser saves files: done at once, so no progress shows */}
        <button
          className="sb-primary-action"
          type="button"
          onClick={() => download(t("data.exportFile"), toCsv(entries))}
        >
          <Icon name="download" />
          <span className="sb-primary-action__label">{t("data.export")}</span>
          <i className="sb-primary-action__bar" aria-hidden="true" />
        </button>
      </ActionZone>
    </View>
  );
}
