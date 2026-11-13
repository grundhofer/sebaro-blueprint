import { useEffect, type ReactNode, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Icon } from "./parts/Icon";

type Props = {
  /** the name of the view (data-sb-view) */
  name: string;
  /** the title: of the document and, with `back`, of the top bar */
  title: string;
  /** the way back of a sub-view: a top bar with „Zurück“ and the title */
  back?: string;
  /** the view has no primary action, on purpose */
  noPrimary?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
};

/** The frame of every view. A main view writes its own heading (ViewTitle), a sub-view gets the top bar. */
export function View({ name, title, back, noPrimary, headingRef, children }: Props) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = t("app.title", { view: title });
  }, [t, title]);
  return (
    <div className="sb-view sb-view--wide" data-sb-view={name} data-sb-primary-expected={noPrimary ? "0" : undefined}>
      {back && (
        <div className="sb-top-bar sb-top-bar--sub">
          <Link className="sb-icon-button" to={back} aria-label={t("common.back")}>
            <Icon name="arrow-left" />
          </Link>
          <div className="sb-top-bar__heading">
            <div className="sb-top-bar__text">
              <h1 ref={headingRef} className="sb-top-bar__title" tabIndex={-1}>
                {title}
              </h1>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

/** The heading of a main view. It can take the focus: Shell puts it there after a navigation. */
export function ViewTitle({ children }: { children: string }) {
  return (
    <h1 className="sb-type-headline app-view-title" tabIndex={-1}>
      {children}
    </h1>
  );
}
