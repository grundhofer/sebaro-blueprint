import { useTranslation } from "react-i18next";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { Status } from "../parts/Status";
import { Section, Specimen } from "./Specimen";

export function EmptySection() {
  const { t } = useTranslation();
  return (
    <Section name="empty">
      <Specimen title={t("data.emptyT")}>
        <div className="sb-empty sb-empty--section">
          <p className="sb-empty__title">{t("data.emptyTitle")}</p>
          <p className="sb-empty__text">{t("data.emptyText")}</p>
        </div>
      </Specimen>
      <Specimen title={t("data.noneT")}>
        <dl className="sb-meta-list">
          <div>
            <dt>{t("data.reminder")}</dt>
            <dd>{t("common.none")}</dd>
          </div>
          <div>
            <dt>{t("data.phoneL")}</dt>
            <dd>{t("common.noValue")}</dd>
          </div>
          <div>
            <dt>{t("data.entriesL")}</dt>
            <dd className="sb-num">0</dd>
          </div>
        </dl>
      </Specimen>
      <Specimen title={t("data.unknown")}>
        <dl className="sb-meta-list">
          <div>
            <dt>{t("data.imageService")}</dt>
            <dd>{t("data.imageServiceV")}</dd>
          </div>
          <div>
            <dt>{t("data.servicePlace")}</dt>
            <dd>
              <Status tone="warning" icon="pending--16" small>
                {t("data.notEvidenced")}
              </Status>
            </dd>
          </div>
        </dl>
        <p>
          <DemoMarker />
        </p>
      </Specimen>
      <Specimen title={t("data.loadError")}>
        <div className="sb-callout sb-callout--error" role="note" aria-labelledby="app-d-err-t">
          <Icon name="error--filled" size={20} />
          <p className="sb-callout__title" id="app-d-err-t">
            {t("data.error")}
          </p>
          <p className="sb-callout__text">{t("data.loadErrorText")}</p>
        </div>
        <div>
          <button className="sb-secondary-action" type="button">
            <Icon name="refresh" />
            {t("data.reload")}
          </button>
        </div>
      </Specimen>
      <Specimen title={t("data.loading")}>
        <div className="sb-skeleton" aria-busy="true" aria-describedby="app-d-load-text">
          <span className="sb-skeleton__line sb-skeleton__line--title" />
          <span className="sb-skeleton__line sb-skeleton__line--long" />
          <span className="sb-skeleton__line sb-skeleton__line--short" />
          <p className="sb-loading" id="app-d-load-text">
            <Icon name="loader" size={20} className="sb-spinner" />
            {t("data.loadingText")}
          </p>
        </div>
      </Specimen>
      <Specimen title={t("data.stale")}>
        <p className="sb-stale-notice">
          <Icon name="warning--filled-16" size={16} />
          {t("data.staleText")}
        </p>
        <p>
          <DemoMarker />
        </p>
      </Specimen>
    </Section>
  );
}
