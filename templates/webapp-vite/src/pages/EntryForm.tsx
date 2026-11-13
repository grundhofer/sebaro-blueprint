// EntryForm.tsx: create or edit an entry. The primary action stays enabled: its press says at each field what is
// wrong and moves the focus to the first. Leaving with unsaved changes asks „Abbrechen“ · „Verwerfen“ · „Sichern“;
// removing a sub-step from the unsaved form asks nothing and can be taken back.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate, useParams } from "react-router";
import { Dialog } from "../components/parts/Dialog";
import { Field } from "../components/parts/Field";
import { Icon } from "../components/parts/Icon";
import { View } from "../components/View";
import {
  CATEGORIES,
  check,
  NOTE_MAX,
  toDraft,
  toValues,
  type Draft,
  type DraftErrors,
  type Entry,
} from "../lib/entries";
import { useEntries } from "../store/entries";
import { useToast } from "../store/toast";

const FIELDS = { title: "app-f-title", due: "app-f-due", effort: "app-f-effort", note: "app-f-note" } as const;

function Form({ entry }: { entry?: Entry }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { add, change } = useEntries();
  const showToast = useToast((state) => state.show);
  const [draft, setDraft] = useState<Draft>(() => toDraft(entry));
  const [step, setStep] = useState("");
  const [errors, setErrors] = useState<DraftErrors>({});
  const [asking, setAsking] = useState(false);
  const saved = useRef(false);
  const dueField = useRef<HTMLInputElement>(null);
  const stepField = useRef<HTMLInputElement>(null);

  const back = entry ? `/eintrag/${entry.id}` : "/";
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(entry));
  // every way out of the form with unsaved changes (a link, „Abbrechen“, Back, Forward) is held back and asks.
  // `asking` is set at once; the router's own state follows a moment later, and the question shows when both agree
  const blocker = useBlocker(() => {
    const unsaved = dirty && !saved.current;
    if (unsaved) setAsking(true);
    return unsaved;
  });
  const set = (values: Partial<Draft>) => setDraft({ ...draft, ...values });

  // closing or reloading the page with unsaved changes: the browser's own question
  useEffect(() => {
    const ask = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", ask);
    return () => window.removeEventListener("beforeunload", ask);
  }, [dirty]);

  /** Checks the draft, shows what is wrong and focuses the first wrong field; stores it when nothing is. */
  const save = (): string | null => {
    const found = check(draft, dueField.current?.validity.badInput);
    setErrors(found);
    const first = (["title", "due", "effort", "note"] as const).find((field) => found[field]);
    if (first) {
      document.getElementById(FIELDS[first])?.focus();
      return null;
    }
    saved.current = true;
    if (!entry) return add(toValues(draft));
    change(entry.id, toValues(draft));
    return entry.id;
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const id = save();
    // saving on this device is done at once: no progress, no toast, the entry opens
    if (id) void navigate(`/eintrag/${id}`);
  };
  const onAnswer = (value: string) => {
    setAsking(false);
    if (blocker.state !== "blocked") return;
    if (value === "discard" || (value === "save" && save())) blocker.proceed();
    else blocker.reset();
  };

  const addStep = () => {
    if (!step.trim()) return;
    set({ steps: [...draft.steps, step.trim()] });
    setStep("");
    stepField.current?.focus();
  };
  const removeStep = (at: number, name: string) => {
    set({ steps: draft.steps.filter((_, i) => i !== at) });
    stepField.current?.focus();
    showToast(t("form.stepRemoved", { step: name }), () =>
      setDraft((now) => ({ ...now, steps: [...now.steps.slice(0, at), name, ...now.steps.slice(at)] })),
    );
  };

  /** The sentence for a fault of a field: what is wrong and what to do. */
  const error = (field: keyof DraftErrors, label: string) => {
    const fault = errors[field];
    if (fault === "missing") return t("common.missing", { label });
    if (fault === "notNumber") return t("form.effortNotNumber");
    if (fault === "range") return t("form.effortRange");
    if (fault === "noDate") return t("form.dueInvalid");
    if (fault === "tooLong")
      return t("form.noteTooLong", { length: draft.note.length, over: draft.note.length - NOTE_MAX });
    return undefined;
  };
  const title = entry ? t("form.titleEdit") : t("form.titleNew");

  return (
    <View name="formular" title={title} back={back}>
      <div className="sb-view__content">
        <div className="sb-container">
          <form className="sb-form-grid" id="app-form" aria-label={title} noValidate onSubmit={onSubmit}>
            <Field id={FIELDS.title} label={t("form.name")} error={error("title", t("form.name"))}>
              {(control) => (
                <input
                  {...control}
                  type="text"
                  autoComplete="off"
                  required
                  value={draft.title}
                  onChange={(e) => set({ title: e.target.value })}
                />
              )}
            </Field>
            <Field id="app-f-cat" label={t("form.category")} optional frame="sb-select">
              {(control) => (
                <>
                  <select
                    {...control}
                    value={draft.category}
                    onChange={(e) => set({ category: CATEGORIES.find((c) => c === e.target.value) ?? "none" })}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {t(`categories.${category}`)}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" />
                </>
              )}
            </Field>
            <Field id={FIELDS.due} label={t("form.due")} optional error={error("due", t("form.due"))}>
              {(control) => (
                <input
                  {...control}
                  ref={dueField}
                  type="date"
                  value={draft.due}
                  onChange={(e) => set({ due: e.target.value })}
                />
              )}
            </Field>
            <Field
              id={FIELDS.effort}
              label={t("form.effort")}
              help={t("form.effortHelp")}
              error={error("effort", t("form.effort"))}
            >
              {(control) => (
                <>
                  <input
                    {...control}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    value={draft.effort}
                    onChange={(e) => set({ effort: e.target.value })}
                  />
                  <span className="sb-field__suffix">{t("form.effortSuffix")}</span>
                </>
              )}
            </Field>
            <div className="sb-form-grid__wide">
              <Field
                id={FIELDS.note}
                label={t("form.note")}
                optional
                help={t("form.noteHelp", { left: Math.max(0, NOTE_MAX - draft.note.length) })}
                error={error("note", t("form.note"))}
              >
                {(control) => (
                  <textarea {...control} rows={3} value={draft.note} onChange={(e) => set({ note: e.target.value })} />
                )}
              </Field>
            </div>
            <fieldset className="sb-form-grid__wide app-steps">
              <legend className="sb-field__label">
                {t("form.steps")} <span className="sb-optional">{t("common.optional")}</span>
              </legend>
              <div id="app-steps">
                {draft.steps.length ? (
                  <ul className="sb-list" aria-label={t("form.steps")}>
                    {draft.steps.map((name, at) => (
                      // the same sub-step may stand twice: its place tells them apart
                      <li key={`${at}-${name}`} className="sb-list-row">
                        <div className="sb-list-row__main">
                          <p className="sb-list-row__title">{name}</p>
                        </div>
                        <div className="sb-list-row__trail">
                          <button
                            className="sb-icon-button"
                            type="button"
                            aria-label={t("form.stepRemove", { step: name })}
                            onClick={() => removeStep(at, name)}
                          >
                            <Icon name="close" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="sb-list-row__meta">{t("form.stepsNone")}</p>
                )}
              </div>
              <Field id="app-f-step" label={t("form.stepLabel")}>
                {(control) => (
                  <input
                    {...control}
                    ref={stepField}
                    type="text"
                    autoComplete="off"
                    value={step}
                    onChange={(e) => setStep(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      addStep();
                    }}
                  />
                )}
              </Field>
              <div>
                {/* the form's one outlined action is „Abbrechen“ */}
                <button className="sb-text-action" type="button" onClick={addStep}>
                  <Icon name="plus--16" size={16} />
                  {t("form.stepAdd")}
                </button>
              </div>
            </fieldset>
            <div className="sb-form-grid__actions">
              <button className="sb-secondary-action" type="button" onClick={() => void navigate(back)}>
                {t("common.cancel")}
              </button>
              <button className="sb-primary-action" type="submit">
                <span className="sb-primary-action__label">{t("form.save")}</span>
                <i className="sb-primary-action__bar" aria-hidden="true" />
              </button>
            </div>
            <p className="sb-action-hint sb-form-grid__wide">{t("common.localOnly")}</p>
          </form>
        </div>
      </div>
      <Dialog
        id="app-dlg-unsaved"
        open={asking && blocker.state === "blocked"}
        title={t("form.unsavedTitle")}
        text={t("form.unsavedText")}
        onClose={onAnswer}
      >
        <button className="sb-secondary-action" value="cancel" data-sb-dialog-cancel>
          {t("common.cancel")}
        </button>
        <button className="sb-danger-action sb-danger-action--outlined" value="discard">
          {t("form.discard")}
        </button>
        <button className="sb-secondary-action" value="save">
          {t("form.save")}
        </button>
      </Dialog>
    </View>
  );
}

export default function EntryForm() {
  const { id } = useParams();
  const entry = useEntries((state) => state.entries.find((e) => e.id === id));
  // a draft belongs to one entry: another entry, or „Neuer Eintrag“, starts a new form
  return <Form key={id ?? "new"} entry={entry} />;
}
