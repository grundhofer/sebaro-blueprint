import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "../../i18n";
import { firstDirection, sortOrder, type Direction, type SortValue } from "../../lib/sort";
import { Icon } from "./Icon";

export type SortRow = {
  key: string;
  cells: ReactNode[];
  /** what each cell is sorted by: a number, a word, or null for a gap */
  values: SortValue[];
};
type Props = {
  captionId: string;
  caption: ReactNode;
  columns: ReadonlyArray<{ label: string; numeric?: boolean }>;
  rows: SortRow[];
  /** the sum row: it stays where it is */
  foot?: ReactNode;
  sorted: { column: number; direction: Direction };
};

/** A table whose heads sort its rows. The sorted head carries aria-sort and the arrow, and a status line says the
 *  new order. */
export function SortTable({ captionId, caption, columns, rows, foot, sorted: start }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
  const [sorted, setSorted] = useState(start);
  const [said, setSaid] = useState("");

  const column = (at: number) => rows.map((row) => row.values[at] ?? null);
  const order = sortOrder(column(sorted.column), sorted.direction, lang);
  const turn: Record<Direction, Direction> = { ascending: "descending", descending: "ascending" };
  const sort = (at: number) => {
    const direction = at === sorted.column ? turn[sorted.direction] : firstDirection(column(at));
    setSorted({ column: at, direction });
    setSaid(t("common.sorted", { column: columns[at]?.label, direction: t(`common.${direction}`) }));
  };

  return (
    <>
      <div className="sb-table-wrap" role="region" aria-labelledby={captionId} tabIndex={0}>
        <table className="sb-table">
          <caption id={captionId}>{caption}</caption>
          <thead>
            <tr>
              {columns.map((col, at) => {
                const arrow = at === sorted.column && (
                  <Icon name={sorted.direction === "ascending" ? "arrow-up--16" : "arrow-down--16"} size={16} />
                );
                return (
                  <th
                    key={col.label}
                    scope="col"
                    className={col.numeric ? "sb-num" : undefined}
                    aria-sort={at === sorted.column ? sorted.direction : undefined}
                  >
                    <button className="sb-table__sort" type="button" onClick={() => sort(at)}>
                      {col.numeric && arrow}
                      {col.label}
                      {!col.numeric && arrow}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {order.map((at) => {
              const row = rows[at];
              return (
                row && (
                  <tr key={row.key}>
                    {row.cells.map((cell, c) => (
                      <td key={columns[c]?.label} className={columns[c]?.numeric ? "sb-num" : undefined}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                )
              );
            })}
          </tbody>
          {foot && <tfoot>{foot}</tfoot>}
        </table>
      </div>
      <p className="sb-visually-hidden" role="status">
        {said}
      </p>
    </>
  );
}
