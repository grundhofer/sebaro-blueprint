package de.sebaro_ventures.musterapp.ui.list

import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.domain.Priority
import java.time.LocalDate

/** Fixed states of the list for the render test: all values are invented. */
object ListSamples {
    private val day = LocalDate.of(2026, 10, 20)

    val entries = listOf(
        Entry(6, "Mütze abholen", "Bis Freitag.", Priority.Normal, day.plusDays(1)),
        Entry(1, "Fahrrad zur Inspektion bringen", "Bremsen prüfen lassen.", Priority.High, day, sample = true),
        Entry(2, "Balkon bepflanzen", "Erde und Kräuter.", Priority.Normal, day.minusDays(2), sample = true),
        Entry(3, "Steuerunterlagen sortieren", "", Priority.Low, day.minusDays(4), sample = true),
        Entry(4, "Regal im Flur aufbauen", "", Priority.Normal, day.minusDays(6), EntryState.Done, sample = true),
        Entry(5, "Wasserzähler ablesen", "", Priority.Normal, day.minusDays(8), EntryState.Done, sample = true),
    )

    /** The normal case: the user's own entry first, then the samples of the first start. */
    val normal = ListUiState(entries)

    /** No entry at all. */
    val empty = ListUiState(emptyList(), none = true)

    /** The search finds nothing. */
    val noHit = ListUiState(emptyList(), query = "Zebra")

    /** An entry was hidden just now: the toast offers „Rückgängig“. */
    val hidden = ListUiState(entries.drop(1).filter { it.id != 2L }, hidden = entries[2])

    /** The edge case: many entries, a title of several lines and a word wider than the line. */
    val long = ListUiState(
        listOf(
            Entry(
                id = 100,
                title = "Unterlagen für die Nebenkostenabrechnung der letzten drei Jahre heraussuchen und ordnen",
                created = day,
            ),
            Entry(101, "Donaudampfschifffahrtsgesellschaftskapitänsmütze abholen", created = day),
        ) + List(20) { Entry(200L + it, "Eintrag ${it + 1}", created = day.minusDays(it.toLong())) },
    )

    /** A change did not reach the storage. */
    val saveFailed = normal.copy(saveFailed = true)
}
