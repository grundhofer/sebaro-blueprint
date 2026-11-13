import { createContext, use, useEffect, type ReactNode, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useToast } from "../store/toast";
import { More } from "./More";
import { Icon } from "./parts/Icon";
import { Toast } from "./parts/Toast";
import { SignTile } from "./SignTile";

/** The pane of the app frame the view of a route stands in. Shell puts what the list opens into the end pane. */
export const PaneContext = createContext<"start" | "end">("start");

type Props = {
  /** the name of the view (data-sb-view) */
  name: string;
  /** the title: of the document and of the top bar */
  title: string;
  /** a sub-view: where its „Zurück“ leads. Without it the view is a top-level place, with the tile and „Mehr“ */
  back?: string;
  /** the view has no primary action, on purpose */
  noPrimary?: boolean;
  /** the view stands beside the one the address names (the list beside an entry): a region, not the content */
  beside?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
};

/** Every view is a pane of the app frame: the top bar, the content and, at the bottom, its action zone. The top
 *  bar never carries the primary action. The heading can take the focus: Shell puts it there after a navigation. */
export function View({ name, title, back, noPrimary, beside, headingRef, children }: Props) {
  const { t } = useTranslation();
  const pane = use(PaneContext);
  const toast = useToast();
  useEffect(() => {
    if (!beside) document.title = t("app.title", { view: title });
  }, [t, title, beside]);
  const Heading = beside ? "h2" : "h1";

  return (
    // a section in both roles: the list keeps its element, and how far it is scrolled, when an entry opens beside it
    <section
      className={`sb-app-frame__pane sb-app-frame__pane--${pane} sb-view app-pane`}
      id={beside ? undefined : "inhalt"}
      role={beside ? undefined : "main"}
      aria-labelledby={`app-view-${name}`}
      tabIndex={-1}
      data-sb-view={name}
      data-sb-primary-expected={noPrimary ? "0" : undefined}
    >
      <div className={back ? "sb-top-bar sb-top-bar--sub" : "sb-top-bar"} data-sb-web-app-head>
        {back && (
          <Link className="sb-icon-button sb-app-frame__back" to={back} aria-label={t("common.back")}>
            <Icon name="arrow-left" />
          </Link>
        )}
        <div className="sb-top-bar__heading">
          {!back && <SignTile size={32} />}
          <div className="sb-top-bar__text">
            <Heading ref={headingRef} className="sb-top-bar__title" id={`app-view-${name}`} tabIndex={-1}>
              {title}
            </Heading>
          </div>
        </div>
        {!back && (
          <div className="sb-top-bar__actions">
            <More />
          </div>
        )}
      </div>
      {children}
      {/* the one toast of the app stands in the view the address names */}
      {!beside && (
        <div className="app-toast-place">
          <Toast id="app-toast" message={toast.message} onHide={toast.hide} />
        </div>
      )}
    </section>
  );
}
