// Detail.tsx: one entry: its properties, the state as glyph and word, „Als erledigt markieren“ with a toast that
// takes it back, and the two steps that ask first: deleting, and closing for good (which deletes nothing and so
// carries no trash). A detail view has no primary action.
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import { CategoryWord } from "../components/CategoryWord";
import { DemoMarker } from "../components/DemoMarker";
import { Dialog } from "../components/parts/Dialog";
import { Icon } from "../components/parts/Icon";
import { Status } from "../components/parts/Status";
import { View } from "../components/View";
import { useLang } from "../i18n";
import * as fmt from "../lib/format";
import { useEntries } from "../store/entries";
import { useToast } from "../store/toast";

export default function Detail() {
  const { t } = useTranslation();
  const lang = useLang();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { entries, change, remove } = useEntries();
  const showToast = useToast((state) => state.show);
  const [asking, setAsking] = useState<"delete" | "finish" | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <View name="eintrag" title={t("detail.notFoundTitle")} back="/" noPrimary>
        <div className="sb-view__content">
          <div className="sb-container">
            <p>{t("detail.notFoundText")}</p>
          </div>
        </div>
      </View>
    );
  }

  const { title, state } = entry;
  const editable = state !== "closed";
  const toggle = () => {
    change(id, { state: state === "done" ? "open" : "done" });
    showToast(t(state === "done" ? "detail.toastOpen" : "detail.toastDone", { title }), () => change(id, { state }));
  };
  const answer = (value: string, act: () => void) => {
    setAsking(null);
    if (value === "confirm") act();
  };

  return (
    <View name="eintrag" title={title} back="/" noPrimary headingRef={heading}>
      <div className="sb-view__content">
        <div className="sb-container sb-stack sb-stack--group">
          {entry.demo && (
            <p>
              <DemoMarker />
            </p>
          )}
          {!editable && (
            <div className="sb-callout sb-callout--note" role="note">
              <Icon name="info--filled" size={20} />
              <p className="sb-callout__text">{t("detail.closedNote")}</p>
            </div>
          )}
          <dl className="sb-meta-list">
            <div>
              <dt>{t("detail.state")}</dt>
              <dd>
                {state === "open" ? (
                  <Status tone="neutral" icon="clock">
                    {t("status.open")}
                  </Status>
                ) : (
                  <Status tone="success" icon="success--filled">
                    {t(`status.${state}`)}
                  </Status>
                )}
              </dd>
            </div>
            <div>
              <dt>{t("detail.category")}</dt>
              <dd>{entry.category === "none" ? t("common.none") : <CategoryWord category={entry.category} />}</dd>
            </div>
            <div>
              <dt>{t("detail.due")}</dt>
              <dd>{entry.due ? <time dateTime={entry.due}>{fmt.date(lang, entry.due)}</time> : t("common.noValue")}</dd>
            </div>
            <div>
              <dt>{t("detail.effort")}</dt>
              <dd>{fmt.unit(lang, entry.effort, t("common.minutes"))}</dd>
            </div>
            <div>
              <dt>{t("detail.note")}</dt>
              <dd>{entry.note || t("common.none")}</dd>
            </div>
            <div>
              <dt>{t("form.steps")}</dt>
              <dd>{entry.steps.length ? entry.steps.join(", ") : t("common.none")}</dd>
            </div>
            <div>
              <dt>{t("detail.created")}</dt>
              <dd>
                <time dateTime={entry.created}>{fmt.date(lang, entry.created)}</time>
              </dd>
            </div>
          </dl>
          {editable && (
            <div className="sb-cluster">
              <Link className="sb-secondary-action" to={`/bearbeiten/${id}`}>
                <Icon name="edit" />
                {t("detail.edit")}
              </Link>
              <button className="sb-secondary-action" type="button" onClick={toggle}>
                {t(state === "done" ? "detail.reopen" : "detail.markDone")}
              </button>
            </div>
          )}
          <div className="sb-cluster">
            {editable && (
              <button className="sb-danger-action" type="button" onClick={() => setAsking("finish")}>
                {t("detail.finish")}
              </button>
            )}
            <button className="sb-danger-action" type="button" onClick={() => setAsking("delete")}>
              <Icon name="trash" />
              {t("detail.delete")}
            </button>
          </div>
        </div>
      </div>
      <Dialog
        id="app-dlg-delete"
        open={asking === "delete"}
        title={t("detail.deleteTitle")}
        text={t("detail.deleteText", { title })}
        onClose={(value) =>
          answer(value, () => {
            remove([id]);
            void navigate("/");
          })
        }
      >
        <button className="sb-secondary-action" value="cancel">
          {t("common.cancel")}
        </button>
        <button className="sb-danger-action sb-danger-action--outlined" value="confirm">
          {t("detail.deleteConfirm")}
        </button>
      </Dialog>
      <Dialog
        id="app-dlg-finish"
        open={asking === "finish"}
        title={t("detail.finishTitle", { title })}
        text={t("detail.finishText")}
        onClose={(value) =>
          answer(value, () => {
            change(id, { state: "closed" });
            // the action that had the focus is gone with this step
            heading.current?.focus();
          })
        }
      >
        <button className="sb-secondary-action" value="cancel">
          {t("common.cancel")}
        </button>
        <button className="sb-danger-action sb-danger-action--outlined" value="confirm">
          {t("detail.finishConfirm")}
        </button>
      </Dialog>
    </View>
  );
}
