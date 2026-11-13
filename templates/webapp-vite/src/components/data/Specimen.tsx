import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../parts/Icon";

export const SECTIONS = [
  "text",
  "numbers",
  "time",
  "state",
  "categories",
  "identity",
  "tech",
  "collections",
  "charts",
  "media",
  "places",
  "rating",
  "empty",
  "evidence",
] as const;

/** A section of „Datenarten“; the contents list links to its id. */
export function Section({ name, children }: { name: (typeof SECTIONS)[number]; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <section className="sb-section sb-stack sb-stack--group" id={`app-d-${name}`} aria-labelledby={`app-d-${name}-h`}>
      <h2 className="sb-section__title" id={`app-d-${name}-h`}>
        {t(`data.sections.${name}`)}
      </h2>
      {children}
    </section>
  );
}

/** One kind of data with its heading. */
export function Specimen({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <article className="sb-stack app-specimen" aria-labelledby={id}>
      <h3 className="sb-type-title" id={id}>
        {title}
      </h3>
      {children}
    </article>
  );
}

/** Label and value pairs as a property list. */
export function Samples({ rows }: { rows: Array<[ReactNode, ReactNode]> }) {
  return (
    <dl className="sb-meta-list sb-meta-list--labels">
      {rows.map(([label, value], at) => (
        <div key={at}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A number in tabular figures. */
export function Num({ children }: { children: ReactNode }) {
  return <span className="sb-num">{children}</span>;
}

/** „Werte als Tabelle“ under a chart: the first column names the row, the others are numbers. */
export function ValuesTable({ labelledBy, head, rows }: { labelledBy: string; head: string[]; rows: string[][] }) {
  const { t } = useTranslation();
  return (
    <details className="sb-chart__data">
      <summary>
        <Icon name="chevron-down--16" size={16} />
        {t("data.valuesTable")}
      </summary>
      <div className="sb-table-wrap" role="region" aria-labelledby={labelledBy} tabIndex={0}>
        <table className="sb-table">
          <thead>
            <tr>
              {head.map((word, at) => (
                <th key={word} scope="col" className={at ? "sb-num" : undefined}>
                  {word}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, ...cells]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                {cells.map((cell, at) => (
                  <td key={head[at + 1]} className="sb-num">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
