import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { Status } from "../parts/Status";
import { Samples, Section, Specimen } from "./Specimen";

export function TextSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const path = t("data.menuPathParts", { returnObjects: true });
  return (
    <Section name="text">
      <Specimen title={t("data.shortText")}>
        <Samples
          rows={[
            [t("data.screenTitle"), t("data.screenTitleV")],
            [t("data.rowTitle"), t("data.rowTitleV")],
            [t("data.actionText"), t("data.actionTextV")],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.longText")}>
        <ul className="sb-list">
          <li className="sb-list-row">
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.longRowTitle")}</p>
              <p className="sb-list-row__meta">{t("data.longRowMeta")}</p>
              <p className="sb-list-row__text">{t("data.longRowText")}</p>
            </div>
          </li>
        </ul>
      </Specimen>
      <Specimen title={t("data.paragraph")}>
        <div className="sb-prose">
          <p>{t("data.paragraphV")}</p>
        </div>
      </Specimen>
      <Specimen title={t("data.quote")}>
        <div className="sb-prose">
          <p>{t("data.quoteLead")}</p>
          <figure className="sb-quote">
            <blockquote className="sb-quote__text">
              <p>{t("data.quoteText")}</p>
            </blockquote>
            <figcaption className="sb-quote__source">
              {t("data.quoteSource")} <DemoMarker />
            </figcaption>
          </figure>
        </div>
      </Specimen>
      <Specimen title={t("data.languages")}>
        <Samples
          rows={[
            [
              t("data.german"),
              <span lang="de">
                {fmt.num("de", 10000)} {t("data.steps")}
              </span>,
            ],
            [
              t("data.english"),
              <span lang="en">
                {fmt.num("en", 10000)} {t("data.stepsEn")}
              </span>,
            ],
            [
              t("data.dateGerman"),
              <time dateTime="2026-10-10" lang="de">
                {fmt.date("de", "2026-10-10")}
              </time>,
            ],
            [
              t("data.dateEnglish"),
              <time dateTime="2026-10-10" lang="en">
                {fmt.date("en", "2026-10-10")}
              </time>,
            ],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.truncated")}>
        <p>{t("data.truncatedNote")}</p>
        <ul className="sb-list app-touch-rows" aria-label={t("data.truncatedLabel")} data-sb-truncate="">
          <li className="sb-row" title={t("data.fileLong")}>
            <Icon name="file-text" className="sb-row__icon" />
            <span className="sb-row__name">{t("data.fileLong")}</span>
            <span className="sb-row__meta">
              <time dateTime="2026-10-09">{t("data.yesterday")}</time>
            </span>
          </li>
          <li className="sb-row" title={t("data.fileShop")}>
            <Icon name="file-text" className="sb-row__icon" />
            <span className="sb-row__name">{t("data.fileShop")}</span>
            <span className="sb-row__meta">
              <Status tone="warning" icon="warning--16" small>
                {t("data.notSaved")}
              </Status>
            </span>
          </li>
          <li className="sb-row">
            <Icon name="file-text" className="sb-row__icon" />
            <span className="sb-row__name">{t("data.fileNotes")}</span>
            <span className="sb-row__meta">
              <time dateTime="2026-10-10T08:12">{fmt.time(lang, "2026-10-10T08:12")}</time>
            </span>
          </li>
        </ul>
      </Specimen>
      <Specimen title={t("data.menuPath")}>
        <p>{t("data.menuPathSentence")}</p>
        <nav className="sb-breadcrumb" aria-label={t("data.menuPathLabel")}>
          <ol>
            {path.map((part, at) => (
              <li key={part}>
                {at < path.length - 1 ? (
                  <>
                    <a href="#app-d-text">{part}</a>
                    <Icon name="chevron-right--16" size={16} />
                  </>
                ) : (
                  <span aria-current="page">{part}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </Specimen>
    </Section>
  );
}
