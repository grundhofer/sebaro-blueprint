import { useId, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type Props = { claim: string; result: ReactNode; defaultOpen?: boolean; children: ReactNode };

/** A claim with the result of its check; a press opens the note that says how it was checked. */
export function ClaimRow({ claim, result, defaultOpen = false, children }: Props) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <li className="sb-claim-row">
      <button
        className="sb-claim-row__toggle"
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span className="sb-claim-row__claim">{claim}</span>
        <span className="sb-claim-row__result">{result}</span>
        <Icon name="chevron-down" className="sb-claim-row__chevron" />
      </button>
      <div className="sb-claim-row__note sb-note__body" id={id} hidden={!open}>
        {children}
      </div>
    </li>
  );
}
