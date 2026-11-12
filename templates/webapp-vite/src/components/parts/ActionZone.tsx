import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** the state sentence at the start of the zone */
  status: string;
  /** the line under the action that says where the data goes */
  hint: string;
  /** the one primary action of the view */
  children: ReactNode;
};

/** The action zone at the bottom of a view: the state sentence, the primary action and its data-path line. */
export function ActionZone({ status, hint, children }: Props) {
  const block = useRef<HTMLDivElement>(null);

  // the height of the block that sticks to the window's edge, for the scroll padding in the copy's stylesheet: a
  // focused field stops above the block, also with large text
  useEffect(() => {
    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) root.style.setProperty("--sb-bottom-block-size", `${entry.target.getBoundingClientRect().height}px`);
    });
    if (block.current) observer.observe(block.current);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--sb-bottom-block-size");
    };
  }, []);

  return (
    <div ref={block} className="sb-bottom-block">
      <div className="sb-primary-action-bar">
        <div className="sb-primary-action-bar__message" role="status" />
        <p className="sb-primary-action-bar__status">{status}</p>
        {children}
        <p className="sb-action-hint">{hint}</p>
      </div>
    </div>
  );
}
