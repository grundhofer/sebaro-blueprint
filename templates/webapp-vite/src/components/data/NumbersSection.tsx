import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import * as fmt from "../../lib/format";
import { DemoMarker } from "../DemoMarker";
import { Icon } from "../parts/Icon";
import { Num, Samples, Section, Specimen } from "./Specimen";
import { VALUES } from "./values";

const STEPS = [
  ["2026-10-05", 8412],
  ["2026-10-06", 12075],
  ["2026-10-07", 980],
  ["2026-10-08", 10000],
] as const;

export function NumbersSection() {
  const { t } = useTranslation();
  const lang = useLang();
  const minutes = t("common.minutes");
  const percent = fmt.percent(lang, 60);
  return (
    <Section name="numbers">
      <Specimen title={t("data.integer")}>
        <Samples
          rows={[
            [t("data.numberWithUnit"), <Num>{fmt.unit(lang, 8, t("data.glasses"))}</Num>],
            [t("data.fraction"), <Num>5 / 8</Num>],
            [t("data.inSentence"), <Num>{t("data.ofDone", { done: 3, all: 5 })}</Num>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.decimal")}>
        <Samples
          rows={[
            [t("data.decimalComma"), <Num>{fmt.unit("de", 2.5, VALUES.units.litre)}</Num>],
            [t("data.leadingZero"), <Num>{fmt.num(lang, 0.75)}</Num>],
            [
              t("data.decimalPoint"),
              <span className="sb-num" lang="en">
                {fmt.unit("en", 2.5, VALUES.units.litre)}
              </span>,
            ],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.large")}>
        <Samples
          rows={[
            [
              t("data.thousands"),
              <Num>
                {fmt.num(lang, 10000)} {t("data.stepsWord")}
              </Num>,
            ],
            [t("data.millions"), <Num>{fmt.num(lang, 1250000)}</Num>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.percentT")}>
        <Samples
          rows={[
            [t("data.value"), <Num>{percent}</Num>],
            [t("data.inStateSentence"), <Num>{t("data.stateSentence", { done: 3, all: 5, percent })}</Num>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.money")}>
        <Samples
          rows={[
            [t("data.amount"), <Num>{fmt.money(lang, 12.9)}</Num>],
            [t("data.withThousands"), <Num>{fmt.money(lang, 1249)}</Num>],
            [
              t("data.withPeriod"),
              <Num>
                {fmt.money(lang, 0.99)} {t("data.perMonth")}
              </Num>,
            ],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.units")}>
        <Samples
          rows={[
            [t("data.minutesL"), <Num>{fmt.unit(lang, 12, minutes)}</Num>],
            [t("data.hoursL"), <Num>{fmt.unit(lang, 2, t("common.hours"))}</Num>],
            [t("data.measure"), <Num>{fmt.unit(lang, 5.2, VALUES.units.km, 1)}</Num>],
            [t("data.temperature"), <Num>{fmt.unit(lang, 21, VALUES.units.celsius)}</Num>],
            [t("data.fileSize"), <Num>{fmt.unit(lang, 1.2, VALUES.units.mb, 1)}</Num>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.signed")}>
        <Samples
          rows={[
            [
              t("data.minus"),
              <span className="sb-signed sb-signed--minus">
                <Icon name="arrow-down--16" size={16} />−{fmt.money(lang, 84)}
              </span>,
            ],
            [
              t("data.plus"),
              <span className="sb-signed sb-signed--plus">
                <Icon name="arrow-up--16" size={16} />
                +3
              </span>,
            ],
            [t("data.zero"), <span className="sb-signed">±0</span>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.range")}>
        <Samples
          rows={[
            [
              t("data.amounts"),
              <Num>
                {"3–5\u00a0"}
                {t("data.glasses")}
              </Num>,
            ],
            [t("data.times"), <Num>{VALUES.timeRange}</Num>],
            [t("data.days"), <Num>{t("data.daysRange")}</Num>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.approx")}>
        <Samples
          rows={[
            [t("data.estimate"), <Num>{t("data.approxEstimate", { value: fmt.unit(lang, 40, minutes) })}</Num>],
            [
              t("data.rounded"),
              <Num>{t("data.approxRounded", { value: `${fmt.num(lang, 2000)} ${t("data.stepsWord")}` })}</Num>,
            ],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.rank")}>
        <Samples
          rows={[
            [t("data.rankWith"), <Num>{t("data.rankV", { place: 2, all: 14 })}</Num>],
            [t("data.ordinal"), <Num>{t("data.ordinalV", { n: 3 })}</Num>],
          ]}
        />
      </Specimen>
      <Specimen title={t("data.columns")}>
        <div className="sb-table-wrap" role="region" aria-labelledby="app-d-steps-cap" tabIndex={0}>
          <table className="sb-table">
            <caption id="app-d-steps-cap">
              {t("data.stepsPerDay")} <DemoMarker />
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("data.day")}</th>
                <th scope="col" className="sb-num">
                  {t("data.stepsWord")}
                </th>
              </tr>
            </thead>
            <tbody>
              {STEPS.map(([day, steps]) => (
                <tr key={day}>
                  <td>{fmt.weekday(lang, day)}</td>
                  <td className="sb-num">{fmt.num(lang, steps)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Specimen>
    </Section>
  );
}
