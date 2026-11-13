import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { version } from "../../../package.json";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { SignTile } from "../SignTile";
import { Section, Specimen } from "./Specimen";
import { VALUES } from "./values";

export function IdentitySection() {
  const { t } = useTranslation();
  const lang = useLang();
  const time = (iso: string) => fmt.time(lang, iso);
  return (
    <Section name="identity">
      <Specimen title={t("data.person")}>
        <ul className="sb-list">
          <li className="sb-list-row">
            <span className="sb-list-row__lead">
              <span className="sb-avatar" aria-hidden="true">
                <span>{VALUES.initials[0]}</span>
              </span>
            </span>
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.personName")}</p>
              <p className="sb-list-row__meta">
                {t("data.personMeta")} ·{" "}
                <time dateTime="2026-10-10T14:32">{t("data.relJustNow", { time: time("2026-10-10T14:32") })}</time>
              </p>
            </div>
          </li>
        </ul>
      </Specimen>
      <Specimen title={t("data.group")}>
        <ul className="sb-avatars" aria-hidden="true">
          {VALUES.initials.map((initials) => (
            <li key={initials} className="sb-avatar">
              <span>{initials}</span>
            </li>
          ))}
        </ul>
        <p>{t("data.groupNames")}</p>
      </Specimen>
      <Specimen title={t("data.appT")}>
        <ul className="sb-app-list">
          <li className="sb-app-row">
            <SignTile size={48} />
            <div>
              <h4 className="sb-app-row__name" translate="no">
                {t("app.name")}
              </h4>
              <p className="sb-app-row__text">{t("data.appLine")}</p>
              <p className="sb-app-row__meta">
                <span>{t("data.appPlatform")}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {t("data.version")} <span className="sb-mono">{version}</span>
                </span>
                <span aria-hidden="true">·</span>
                <DemoMarker />
              </p>
            </div>
          </li>
        </ul>
        <p className="sb-list-row__meta">{t("data.appTileNote")}</p>
      </Specimen>
      <Specimen title={t("data.device")}>
        <ul className="sb-list">
          <li className="sb-list-row">
            <span className="sb-list-row__lead">
              <Icon name="smartphone" />
            </span>
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.phone")}</p>
              <p className="sb-list-row__meta">
                {t("data.thisDevice")} ·{" "}
                {t("data.synced", { when: t("data.todayAt", { time: time("2026-10-10T08:12") }) })}
              </p>
            </div>
          </li>
          <li className="sb-list-row">
            <span className="sb-list-row__lead">
              <Icon name="monitor" />
            </span>
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.laptop")}</p>
              <p className="sb-list-row__meta">
                {t("data.synced", { when: t("data.yesterdayAt", { time: time("2026-10-09T22:40") }) })}
              </p>
            </div>
          </li>
          <li className="sb-list-row">
            <span className="sb-list-row__lead">
              <Icon name="watch" />
            </span>
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.watch")}</p>
              <p className="sb-list-row__meta">{t("data.neverSynced")}</p>
            </div>
          </li>
        </ul>
      </Specimen>
      <Specimen title={t("data.address")}>
        <address>
          {t("data.addressLines", { returnObjects: true }).map((line, at) => (
            <Fragment key={line}>
              {at > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </address>
      </Specimen>
      <Specimen title={t("data.contact")}>
        <dl className="sb-meta-list">
          <div>
            <dt>{t("data.email")}</dt>
            <dd>
              <a href={`mailto:${VALUES.email}`}>
                {VALUES.emailParts.map((part, at) => (
                  <Fragment key={part}>
                    {at > 0 && <wbr />}
                    {part}
                  </Fragment>
                ))}
                <Icon name="external-link--16" size={16} />
              </a>
            </dd>
          </div>
          <div>
            <dt>{t("data.website")}</dt>
            <dd>
              <a href={VALUES.websiteUrl}>
                {VALUES.website}
                <Icon name="external-link--16" size={16} />
              </a>
            </dd>
          </div>
        </dl>
      </Specimen>
    </Section>
  );
}
