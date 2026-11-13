import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { Icon } from "../parts/Icon";
import { Status } from "../parts/Status";
import { Switch } from "../parts/Switch";
import { Section, Specimen } from "./Specimen";

export function StateSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const [quiet, setQuiet] = useState(true);
  const percent = fmt.percent(lang, 60);
  const summary = (
    <>
      {t("data.stateSentence", { done: 3, all: 5, percent })} {t("list.stillOpen", { count: 2 })}
    </>
  );
  return (
    <Section name="state">
      <Specimen title={t("data.statusT")}>
        <div className="sb-cluster">
          <Status tone="info" icon="progress">
            {t("data.running")}
          </Status>
          <Status tone="neutral" icon="clock">
            {t("data.planned")}
          </Status>
          <Status tone="success" icon="success--filled">
            {t("data.doneW")}
          </Status>
          <Status tone="danger" icon="error--filled">
            {t("data.error")}
          </Status>
          <Status tone="warning" icon="pending">
            {t("data.oneOpen")}
          </Status>
        </div>
      </Specimen>
      <Specimen title={t("data.partial")}>
        <p className="sb-day-summary">{summary}</p>
        <ul className="sb-list">
          <li className="sb-list-row">
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.survey")}</p>
              <p className="sb-list-row__meta">{t("data.surveyMeta")}</p>
            </div>
            <Status tone="warning" icon="pending">
              {t("data.twoOpen")}
            </Status>
          </li>
          <li className="sb-list-row">
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.photos")}</p>
              <p className="sb-list-row__meta">{t("data.photosMeta")}</p>
            </div>
            <Status tone="neutral" icon="pending">
              {t("data.twoOpen")}
            </Status>
          </li>
        </ul>
      </Specimen>
      <Specimen title={t("data.sum")}>
        <ul className="sb-list">
          <li className="sb-list-row">
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.sumRow1")}</p>
            </div>
            <Status tone="warning" icon="warning--16" small>
              {t("data.notSaved")}
            </Status>
          </li>
          <li className="sb-list-row">
            <div className="sb-list-row__main">
              <p className="sb-list-row__title">{t("data.sumRow2")}</p>
            </div>
            <Status tone="neutral" icon="info--16" small>
              {t("data.onlyOnline")}
            </Status>
          </li>
        </ul>
        <p>{t("data.sumNote")}</p>
      </Specimen>
      <Specimen title={t("data.onOff")}>
        <Switch label={t("data.quietReminder")} checked={quiet} onChange={setQuiet} />
        <dl className="sb-meta-list">
          <div>
            <dt>{t("data.reminder")}</dt>
            <dd>{t("data.on")}</dd>
          </div>
          <div>
            <dt>{t("data.sound")}</dt>
            <dd>{t("data.off")}</dd>
          </div>
        </dl>
      </Specimen>
      <Specimen title={t("data.checks")}>
        <div className="sb-stack">
          <p className="sb-check-state sb-check-state--passed">
            <Icon name="success--filled-16" size={16} />
            {t("data.passed")}
          </p>
          <p className="sb-check-state sb-check-state--open">
            <Icon name="pending--16" size={16} />
            {t("status.open")}
          </p>
          <p className="sb-check-state sb-check-state--skipped">
            <Icon name="skipped--16" size={16} />
            {t("data.skipped")}
          </p>
          <p className="sb-check-state sb-check-state--failed">
            <Icon name="error--filled-16" size={16} />
            {t("data.failed")}
          </p>
          <p className="sb-check-state sb-check-state--open">
            <Icon name="pending--16" size={16} />
            {t("data.notEvidenced")}
          </p>
        </div>
      </Specimen>
      <Specimen title={t("data.progress")}>
        <p className="sb-day-summary" id="app-d-summary">
          {summary}
        </p>
        <progress className="sb-progress__bar" value={3} max={5} aria-labelledby="app-d-summary">
          {percent}
        </progress>
        <div className="sb-progress">
          <p className="sb-progress__head">
            <span id="app-d-sync">{t("data.syncing")}</span>
            <span>{percent}</span>
          </p>
          <progress value={60} max={100} aria-labelledby="app-d-sync" />
        </div>
      </Specimen>
      <Specimen title={t("data.actionProgress")}>
        <p>{t("data.actionProgressNote")}</p>
      </Specimen>
      <Specimen title={t("data.stepsT")}>
        <div className="sb-progress">
          <p className="sb-progress__head">
            <span>{t("data.stepOf", { step: 2, all: 3 })}</span>
          </p>
          <ol className="sb-progress__steps">
            <li className="sb-progress__step" data-sb-state="done">
              <Icon name="check--16" size={16} />
              <span className="sb-progress__word">{t("data.stepName")}</span>
            </li>
            <li className="sb-progress__step" aria-current="step">
              <span className="sb-progress__word">{t("data.stepGoal")}</span>
            </li>
            <li className="sb-progress__step">
              <span className="sb-progress__word">{t("data.stepReminder")}</span>
            </li>
          </ol>
        </div>
      </Specimen>
    </Section>
  );
}
