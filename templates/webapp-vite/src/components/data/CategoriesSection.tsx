import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Chips } from "../parts/Chips";
import { Icon } from "../parts/Icon";
import { Section, Specimen } from "./Specimen";

export function CategoriesSection() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  return (
    <Section name="categories">
      <Specimen title={t("data.tags")}>
        <ul className="sb-tags">
          {t("data.tagList", { returnObjects: true }).map((tag) => (
            <li key={tag} className="sb-tag">
              {tag}
            </li>
          ))}
        </ul>
      </Specimen>
      <Specimen title={t("data.categoryWord")}>
        <p className="sb-list-row__meta">{t("data.longRowMeta")}</p>
        <Chips
          label={t("data.filterCategory")}
          options={[
            { value: "all", label: t("data.catAll") },
            { value: "health", label: t("data.catHealth") },
            { value: "move", label: t("data.catMove") },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </Specimen>
      <Specimen title={t("data.categoryColour")}>
        <p>
          {t("data.roses")} · <span className="sb-category sb-category--4">{t("data.catGarden")}</span> · 17:30
        </p>
        <p>
          <span className="sb-category sb-category--1">{t("data.catHealth")}</span>{" "}
          <span className="sb-category sb-category--2">{t("data.catLearn")}</span>{" "}
          <span className="sb-category sb-category--3">{t("data.catMove")}</span>
        </p>
        <p className="sb-category sb-category--5">
          <Icon name="folder--filled" size={20} />
          {t("data.catWork")}
        </p>
        <p>
          <span className="sb-category">{t("data.catNone")}</span>
        </p>
      </Specimen>
      <Specimen title={t("data.marks")}>
        <p>
          <Trans i18nKey="data.marks1" components={{ hit: <mark aria-current="true" /> }} /> ·{" "}
          <Trans i18nKey="data.marks2" components={{ mark: <mark /> }} />
        </p>
        <p className="sb-list-row__meta" role="status">
          {t("data.hitOf", { hit: 1, all: 2 })}
        </p>
      </Specimen>
    </Section>
  );
}
