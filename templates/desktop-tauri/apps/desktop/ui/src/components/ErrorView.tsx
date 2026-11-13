import { useTranslation } from "react-i18next";
import { Icon } from "./parts/Icon";

/** What a pane shows when it fails: what is wrong and what to do. The notes are untouched. */
export function ErrorView() {
  const { t } = useTranslation();
  return (
    <div className="sb-stack app-error" role="alert">
      <h2 className="sb-type-title">{t("error.title")}</h2>
      <p>{t("error.text")}</p>
      <div>
        <button className="sb-secondary-action" type="button" onClick={() => window.location.reload()}>
          <Icon name="refresh" />
          {t("error.retry")}
        </button>
      </div>
    </div>
  );
}
