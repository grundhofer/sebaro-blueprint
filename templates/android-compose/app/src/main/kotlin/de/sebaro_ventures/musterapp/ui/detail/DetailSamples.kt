package de.sebaro_ventures.musterapp.ui.detail

import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.domain.Priority
import java.time.LocalDate

/** Fixed states of the detail for the render test: all values are invented. */
object DetailSamples {
    private val entry = Entry(
        id = 1,
        title = "Fahrrad zur Inspektion bringen",
        note = "Bremsen und Licht prüfen lassen, vorher einen Termin ausmachen.",
        priority = Priority.High,
        created = LocalDate.of(2026, 10, 20),
        sample = true,
    )

    /** The normal case: an open sample entry. */
    val normal = DetailUiState(entry)

    /** A finished entry of the user's, without a note: no way to edit it is left. */
    val done = DetailUiState(entry.copy(note = "", state = EntryState.Done, sample = false))

    /** The edge case: a long title and a note with one word wider than the line. */
    val long = DetailUiState(
        Entry(
            id = 2,
            title = "Unterlagen für die Nebenkostenabrechnung der letzten drei Jahre heraussuchen",
            note = "Abholen: Donaudampfschifffahrtsgesellschaftskapitänsmützenabzeichen, bis Freitag.",
            created = LocalDate.of(2026, 10, 12),
        ),
    )

    val askFinish = normal.copy(dialog = DetailDialog.Finish)

    val askDelete = normal.copy(dialog = DetailDialog.Delete)

    /** A change did not reach the storage. */
    val saveFailed = normal.copy(saveFailed = true)
}
