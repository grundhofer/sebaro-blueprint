import { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { CodeBlock } from "../parts/CodeBlock";
import { Code } from "./Code";
import { Samples, Section, Specimen } from "./Specimen";
import { VALUES } from "./values";

export function TechSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const log = t("data.logLines", { returnObjects: true });
  // the lines of the diff: the line numbers before and after, the kind of change, the code
  const diff = [
    { before: 4, after: 4, code: VALUES.diff.goal },
    { before: 5, kind: "del", code: VALUES.diff.removed },
    { after: 5, kind: "add", code: VALUES.diff.added },
    { after: 6, kind: "add", code: VALUES.diff.quiet(t("data.diffComment")) },
    { before: 6, after: 7, code: VALUES.diff.sound },
  ];
  return (
    <Section name="tech">
      <Specimen title={t("data.ids")}>
        <Samples
          rows={[
            [t("data.shortHash"), <code className="sb-code-inline">{VALUES.shortHash}</code>],
            [t("data.uuid"), <code className="sb-code-inline">{VALUES.uuid}</code>],
            [t("data.ruleId"), <code className="sb-code-inline">{VALUES.ruleId}</code>],
            [
              t("data.idInSentence"),
              <>
                {t("data.ruleWord")} <span className="sb-id">{VALUES.idInSentence}</span>
              </>,
            ],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.version")}>
        <p>
          <Trans
            i18nKey="data.versionLine"
            values={{ version: VALUES.releaseVersion, date: fmt.date(lang, "2026-10-10") }}
            components={{ code: <code className="sb-code-inline" />, time: <time dateTime="2026-10-10" /> }}
          />
        </p>
      </Specimen>
      <Specimen title={t("data.path")}>
        <p>
          <code className="sb-code-inline sb-file-name">
            {VALUES.pathParts.map((part, at) => (
              <Fragment key={part}>
                {at > 0 && <wbr />}
                {part}
              </Fragment>
            ))}
          </code>
        </p>
      </Specimen>
      <Specimen title={t("data.command")}>
        <CodeBlock language={t("data.commandLang")} label={t("data.commandLabel")}>
          <Code lines={VALUES.command(t("data.commandComment"))} />
        </CodeBlock>
      </Specimen>
      <Specimen title={t("data.code")}>
        <CodeBlock language={t("data.codeLang")} label={t("data.codeLabel")}>
          <Code lines={VALUES.code(t("data.codeComment"), t("data.codeString"))} />
        </CodeBlock>
      </Specimen>
      <Specimen title={t("data.json")}>
        <CodeBlock language={t("data.json")} label={t("data.jsonLabel")}>
          <Code lines={VALUES.json(t("data.jsonTitle"))} />
        </CodeBlock>
      </Specimen>
      <Specimen title={t("data.log")}>
        <CodeBlock language={t("data.logLang")} label={t("data.logLabel")}>
          {log.map((line, at) => `${VALUES.logTimes[at]}  ${line}`).join("\n")}
        </CodeBlock>
      </Specimen>
      <Specimen title={t("data.diff")}>
        <figure className="sb-diff" aria-labelledby="app-d-diff-file">
          <figcaption className="sb-diff__bar">
            <span className="sb-diff__file" id="app-d-diff-file">
              {VALUES.diffFile}
            </span>
            <span>{t("data.diffVersions")}</span>
          </figcaption>
          <div className="sb-diff__lines" role="region" aria-label={t("data.diffLabel")} tabIndex={0}>
            <span className="sb-diff__hunk">{VALUES.diffHunk}</span>
            {diff.map(({ before, after, kind, code }) => (
              <div key={code} className={kind ? `sb-diff__line sb-diff__line--${kind}` : "sb-diff__line"}>
                <span className="sb-diff__num">{before}</span>
                <span className="sb-diff__num">{after}</span>
                <span className="sb-diff__sign" aria-hidden="true">
                  {kind === "del" ? "−" : kind === "add" ? "+" : " "}
                </span>
                <span className="sb-diff__code">
                  {kind && (
                    <span className="sb-visually-hidden">
                      {t(kind === "del" ? "data.diffRemoved" : "data.diffAdded")}
                    </span>
                  )}
                  <Code lines={code} />
                </span>
              </div>
            ))}
          </div>
          <p className="sb-diff__sum">{t("data.diffSum")}</p>
        </figure>
      </Specimen>
      <Specimen title={t("data.keys")}>
        <p>
          <Trans i18nKey="data.keysSentence" components={{ kbd: <kbd />, sign: <span aria-hidden="true" /> }} />
        </p>
        <Samples
          rows={[
            [
              t("data.keysInMenu"),
              <>
                {t("data.keysNewNote")}{" "}
                <span className="sb-keys">
                  <span aria-hidden="true">{VALUES.menuKeys}</span>
                  <span className="sb-visually-hidden">{t("data.keysWords")}</span>
                </span>
              </>,
            ],
          ]}
        />
      </Specimen>
    </Section>
  );
}
