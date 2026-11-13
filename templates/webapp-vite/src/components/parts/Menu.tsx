import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./Icon";

export type MenuGroup = {
  heading: string;
  options: ReadonlyArray<{ value: string; label: string; lang?: string }>;
  /** the chosen option */
  value: string;
  onChange(value: string): void;
};
type Props = { id: string; label: string; icon: string; groups: MenuGroup[] };

/** A menu button and its menu of choices: groups with a heading, one row of each chosen. The browser opens and
 *  closes the menu (a press on the button, Escape, a press beside it). The arrows, Home and End move through the
 *  rows; a choice, Tab, a scroll of the page or a change of the window closes it. */
export function Menu({ id, label, icon, groups }: Props) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const rows = () => [...(menu.current?.querySelectorAll<HTMLElement>("[role='menuitemradio']") ?? [])];

  // under the button, its end on the button's end, never taller than the room there
  const place = () => {
    if (!button.current || !menu.current) return;
    const { bottom, right } = button.current.getBoundingClientRect();
    const { style } = menu.current;
    style.top = `${Math.round(bottom + 4)}px`;
    style.right = `${Math.round(Math.max(8, document.documentElement.clientWidth - right))}px`;
    style.maxHeight = `${Math.round(window.innerHeight - bottom - 12)}px`;
  };

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event.target !== menu.current) menu.current?.hidePopover();
    };
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent) => {
    const all = rows();
    const at = all.findIndex((row) => row === document.activeElement);
    const moves: Record<string, number> = {
      ArrowDown: (at + 1) % all.length,
      ArrowUp: (at <= 0 ? all.length : at) - 1,
      Home: 0,
      End: all.length - 1,
    };
    const to = moves[event.key];
    if (to === undefined) return;
    event.preventDefault();
    all[to]?.focus();
  };

  return (
    <>
      <button
        ref={button}
        className="sb-icon-button"
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        popoverTarget={id}
      >
        <Icon name={icon} />
      </button>
      <ul
        ref={menu}
        className="sb-menu"
        role="menu"
        id={id}
        aria-label={label}
        popover="auto"
        onBeforeToggle={(event) => {
          if (event.newState === "open") place();
        }}
        onToggle={(event) => {
          setOpen(event.newState === "open");
          if (event.newState === "open") rows()[0]?.focus();
        }}
        onKeyDown={onKeyDown}
        // Tab: the focus moves on and the menu closes
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== button.current)
            event.currentTarget.hidePopover();
        }}
      >
        {groups.map((group, at) => (
          <Fragment key={group.heading}>
            {at > 0 && <li className="sb-menu__sep" role="separator" />}
            <li role="none">
              <p className="sb-menu__heading" id={`${id}-${at}`}>
                {group.heading}
              </p>
              <ul className="sb-menu__group" role="group" aria-labelledby={`${id}-${at}`}>
                {group.options.map((option) => (
                  <li key={option.value} role="none">
                    <button
                      className="sb-menu__item"
                      type="button"
                      role="menuitemradio"
                      aria-checked={option.value === group.value}
                      tabIndex={-1}
                      lang={option.lang}
                      onClick={() => {
                        menu.current?.hidePopover();
                        button.current?.focus();
                        group.onChange(option.value);
                      }}
                    >
                      <span className="sb-menu__check" aria-hidden="true">
                        <Icon name="check--16" size={16} />
                      </span>
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </Fragment>
        ))}
      </ul>
    </>
  );
}
