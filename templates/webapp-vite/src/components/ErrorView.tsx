import { useTranslation } from "react-i18next";
import { Icon } from "./parts/Icon";
import { View, ViewTitle } from "./View";

/** What every route shows when it fails: what is wrong and what to do. The entries are untouched. */
export function ErrorView() {
  const { t } = useTranslation();
  return (
    <View name="fehler" title={t("error.title")}>
      <div className="sb-view__content">
        <div className="sb-container sb-stack">
          <ViewTitle>{t("error.title")}</ViewTitle>
          <p>{t("error.text")}</p>
          <div>
            <button className="sb-primary-action" type="button" onClick={() => window.location.reload()}>
              <Icon name="refresh" />
              <span className="sb-primary-action__label">{t("error.retry")}</span>
            </button>
          </div>
        </div>
      </div>
    </View>
  );
}
