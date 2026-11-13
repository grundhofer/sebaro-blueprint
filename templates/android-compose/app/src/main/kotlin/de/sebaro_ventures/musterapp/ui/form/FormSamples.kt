package de.sebaro_ventures.musterapp.ui.form

import de.sebaro_ventures.musterapp.domain.NOTE_MAX
import de.sebaro_ventures.musterapp.domain.Priority

/** Fixed states of the form for the render test: all values are invented. */
object FormSamples {
    private const val TITLE = "Fahrrad zur Inspektion bringen"

    /** The empty state: a new entry, nothing typed yet. */
    val new = FormUiState(isNew = true)

    /** The normal case: a sample entry is edited and its words are still the sample's. */
    val normal = FormUiState(
        isNew = false,
        title = TITLE,
        note = "Bremsen und Licht prüfen lassen, vorher einen Termin ausmachen.",
        priority = Priority.High,
        storedTitle = TITLE,
        sample = true,
    )

    /** „Eintrag anlegen“ was pressed without a title. */
    val titleMissing = new.copy(titleMissing = true, refused = 1)

    /** The edge case: a title wider than its field and a note above the limit. */
    val long = normal.copy(
        title = "Unterlagen für die Nebenkostenabrechnung der letzten drei Jahre heraussuchen und ordnen",
        note = "Bremsen und Licht prüfen lassen. ".repeat(NOTE_MAX / 30),
        sample = false,
        changed = true,
        refused = 1,
    )

    /** Closing with changes asks first. */
    val askUnsaved =
        normal.copy(title = "Fahrrad zur Werkstatt bringen", sample = false, changed = true, askUnsaved = true)

    /** The save did not reach the storage: the primary action says so. */
    val saveFailed = normal.copy(priority = Priority.Low, changed = true, saveFailed = true)
}
