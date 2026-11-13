// Legal.tsx: the three pages every footer links, as short placeholders.
import { useTranslation } from "react-i18next";
import { Icon } from "../components/parts/Icon";
import { View, ViewTitle } from "../components/View";

const PAGES = {
  impressum: "imprint",
  datenschutz: "privacy",
  barrierefreiheit: "accessibility",
} as const;

export default function Legal({ page }: { page: keyof typeof PAGES }) {
  const { t } = useTranslation();
  const title = t(`legal.${PAGES[page]}Title`);
  return (
    <View name={page} title={title} noPrimary>
      <div className="sb-view__content">
        <div className="sb-container sb-stack sb-stack--group">
          <ViewTitle>{title}</ViewTitle>
          <div className="sb-callout sb-callout--warning" role="note">
            <Icon name="warning--filled" size={20} />
            <p className="sb-callout__text">{t("legal.placeholder")}</p>
          </div>
          <div className="sb-prose">
            <p>{t(`legal.${PAGES[page]}Body`)}</p>
          </div>
        </div>
      </div>
    </View>
  );
}
