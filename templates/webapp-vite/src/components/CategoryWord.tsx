import { useTranslation } from "react-i18next";
import { CATEGORIES, type Category } from "../lib/entries";

/** A category as its word with its colour dot. „Keine“ has no dot and is not shown as a category. */
export function CategoryWord({ category }: { category: Exclude<Category, "none"> }) {
  const { t } = useTranslation();
  return (
    <span className={`sb-category sb-category--${CATEGORIES.indexOf(category)}`}>{t(`categories.${category}`)}</span>
  );
}
