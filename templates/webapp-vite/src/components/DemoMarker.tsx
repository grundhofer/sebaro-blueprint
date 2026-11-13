import { useTranslation } from "react-i18next";

/** The mark on everything that is sample data. */
export function DemoMarker() {
  const { t } = useTranslation();
  return <span className="sb-demo-marker">{t("app.demo")}</span>;
}
