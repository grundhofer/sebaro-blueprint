// NotFound.tsx: the view for an address that leads nowhere.
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { View } from "../components/View";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <View name="nicht-gefunden" title={t("notFound.title")} noPrimary>
      <div className="sb-view__content">
        <div className="sb-container sb-stack">
          <p>
            {t("notFound.text")} <Link to="/">{t("notFound.link")}</Link>
          </p>
        </div>
      </div>
    </View>
  );
}
