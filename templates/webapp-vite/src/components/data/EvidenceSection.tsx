import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { DemoMarker } from "../DemoMarker";
import { ClaimRow } from "../parts/ClaimRow";
import { Icon } from "../parts/Icon";
import { NoteList, NotePopover, NoteRef } from "../parts/Notes";
import { Section, Specimen } from "./Specimen";

export function EvidenceSection() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);

  // what a note says: the result with its glyph, then how it was checked, what was not, and by whom
  const passed = <Icon name="success--filled-16" size={16} className="sb-check-glyph sb-check-glyph--passed" />;
  const pending = <Icon name="pending--16" size={16} className="sb-check-glyph sb-check-glyph--open" />;
  const checked = (
    <>
      <p className="sb-note__method">{t("data.method1")}</p>
      <p className="sb-note__limit">{t("data.limit1")}</p>
      <p className="sb-note__by">{t("data.byAuto")}</p>
    </>
  );
  const unknown = (
    <>
      <p className="sb-note__outflow">{t("data.outflow2")}</p>
      <p className="sb-note__limit">{t("data.limit2")}</p>
      <p className="sb-note__by">{t("data.byHand")}</p>
    </>
  );
  const notes = [
    {
      claim: t("data.claim1"),
      body: (
        <>
          <p className="sb-note__result">
            {passed}
            {t("data.passedOn")}
          </p>
          {checked}
        </>
      ),
    },
    {
      claim: t("data.claim2"),
      body: (
        <>
          <p className="sb-note__result">
            {pending}
            {t("data.openPlace")}
          </p>
          {unknown}
        </>
      ),
    },
  ];

  return (
    <Section name="evidence">
      <Specimen title={t("data.footnote")}>
        <p>
          {notes.map((note, at) => (
            <Fragment key={note.claim}>
              {note.claim}
              <NoteRef
                name="app-beleg"
                n={at + 1}
                label={t("data.noteLabel", { n: at + 1 })}
                open={open === at}
                onOpen={() => setOpen(at)}
              />
              {". "}
            </Fragment>
          ))}
        </p>
        <NoteList
          name="app-beleg"
          title={
            <>
              {t("data.notesTitle")} <DemoMarker />
            </>
          }
          notes={notes.map((note) => note.body)}
          backLabel={(n) => t("data.backLabel", { n })}
        />
        <NotePopover open={open !== null} claim={open === null ? "" : notes[open].claim} onClose={() => setOpen(null)}>
          {open !== null && notes[open].body}
        </NotePopover>
      </Specimen>
      <Specimen title={t("data.claimRows")}>
        <section className="sb-claims-block" aria-labelledby="app-claims-h">
          <h4 className="sb-claims-block__title" id="app-claims-h">
            {t("data.claimBlock")} <DemoMarker />
          </h4>
          <ul className="sb-claim-rows">
            <ClaimRow
              claim={t("data.claimNoAccount")}
              result={
                <>
                  {passed}
                  {t("data.claimPassed")}
                </>
              }
              defaultOpen
            >
              {checked}
            </ClaimRow>
            <ClaimRow
              claim={t("data.claimIp")}
              result={
                <>
                  {pending}
                  {t("data.claimOpen")}
                </>
              }
            >
              {unknown}
            </ClaimRow>
          </ul>
        </section>
      </Specimen>
    </Section>
  );
}
