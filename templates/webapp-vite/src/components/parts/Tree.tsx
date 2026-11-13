import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

export type TreeNode = { id: string; name: string; icon: string; meta?: ReactNode; children?: TreeNode[] };
type Row = { node: TreeNode; level: number; parent?: string };
type Props = { labelledBy: string; nodes: TreeNode[]; open?: string[]; selected?: string };

/** The rows on screen, in their order: the children of a closed row are left out. */
function visible(nodes: TreeNode[], open: Set<string>, level = 1, parent?: string): Row[] {
  return nodes.flatMap((node) => [
    { node, level, parent },
    ...(node.children && open.has(node.id) ? visible(node.children, open, level + 1, node.id) : []),
  ]);
}

/** A tree with one tab stop: the arrows move, Arrow right and left open and close, Enter or Space chooses, letters
 *  jump to the next row that starts with them. */
export function Tree({ labelledBy, nodes, open: startOpen = [], selected: startSelected }: Props) {
  const [open, setOpen] = useState(() => new Set(startOpen));
  const [selected, setSelected] = useState(startSelected);
  const [stop, setStop] = useState(startSelected ?? nodes[0]?.id);
  const tree = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const rows = visible(nodes, open);

  const toggle = (id: string, to = !open.has(id)) => {
    const next = new Set(open);
    if (to) next.add(id);
    else next.delete(id);
    setOpen(next);
  };
  const focus = (row?: Row) => {
    if (row) tree.current?.querySelector<HTMLElement>(`[data-row="${row.node.id}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, row: Row) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const at = rows.indexOf(row);
    const { node } = row;
    if (event.key === "ArrowDown") focus(rows[at + 1]);
    else if (event.key === "ArrowUp") focus(rows[at - 1]);
    else if (event.key === "Home") focus(rows[0]);
    else if (event.key === "End") focus(rows[rows.length - 1]);
    else if (event.key === "ArrowRight" && node.children) {
      if (open.has(node.id)) focus(rows[at + 1]);
      else toggle(node.id, true);
    } else if (event.key === "ArrowLeft") {
      if (node.children && open.has(node.id)) toggle(node.id, false);
      else focus(rows.find((r) => r.node.id === row.parent));
    } else if (event.key === "Enter" || event.key === " ") setSelected(node.id);
    else if (event.key.length === 1 && /\S/.test(event.key)) {
      // letters typed within 500 ms belong together; the same letter again goes on to the next row with it
      const now = event.timeStamp;
      const text = (now - typed.current.at < 500 ? typed.current.text : "") + event.key.toLowerCase();
      typed.current = { text, at: now };
      const again = [...text].every((letter) => letter === text[0]);
      const from = again ? at + 1 : at;
      const order = [...rows.slice(from), ...rows.slice(0, from)];
      focus(order.find((r) => r.node.name.toLowerCase().startsWith(again ? text.slice(0, 1) : text)));
    } else return;
    event.preventDefault();
  };

  const item = (node: TreeNode, level: number): ReactNode => {
    const row = rows.find((r) => r.node.id === node.id) ?? { node, level };
    const isOpen = node.children ? open.has(node.id) : undefined;
    return (
      <li key={node.id} role="none">
        <div
          className="sb-row sb-tree__row"
          role="treeitem"
          data-row={node.id}
          aria-level={level}
          aria-expanded={isOpen}
          aria-selected={node.id === selected}
          tabIndex={node.id === stop ? 0 : -1}
          onFocus={() => setStop(node.id)}
          onKeyDown={(event) => onKeyDown(event, row)}
          onClick={() => setSelected(node.id)}
          onDoubleClick={() => node.children && toggle(node.id)}
        >
          <span
            className="sb-tree__twist"
            aria-hidden="true"
            onClick={(event) => {
              if (!node.children) return;
              event.stopPropagation();
              toggle(node.id);
            }}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            {node.children && <Icon name="chevron-right--16" size={16} />}
          </span>
          <Icon name={node.icon} className="sb-row__icon" />
          <span className="sb-row__name">{node.name}</span>
          {node.meta && <span className="sb-row__meta">{node.meta}</span>}
        </div>
        {node.children && (
          <ul className="sb-tree__group" role="group" hidden={!isOpen}>
            {node.children.map((child) => item(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul ref={tree} className="sb-tree" role="tree" aria-labelledby={labelledBy}>
      {nodes.map((node) => item(node, 1))}
    </ul>
  );
}
