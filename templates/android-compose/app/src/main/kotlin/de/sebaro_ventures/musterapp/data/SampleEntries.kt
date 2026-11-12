package de.sebaro_ventures.musterapp.data

import android.content.res.Resources
import de.sebaro_ventures.musterapp.R
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import de.sebaro_ventures.musterapp.domain.Priority
import java.time.LocalDate

private const val OPEN_SAMPLES = 3

/**
 * The invented entries of the first start, with the words of the app's language at that moment and dated in the
 * days before [today]. They are marked as samples, so the screens show „Beispieldaten“ on them.
 */
fun sampleEntries(resources: Resources, today: LocalDate): List<Entry> {
    val titles = resources.getStringArray(R.array.sample_titles)
    val notes = resources.getStringArray(R.array.sample_notes)
    val priorities = listOf(Priority.High, Priority.Normal, Priority.Low, Priority.Normal, Priority.Normal)
    return titles.indices.map { i ->
        Entry(
            title = titles[i],
            note = notes[i],
            priority = priorities[i],
            created = today.minusDays(2L * (i + 1)),
            state = if (i < OPEN_SAMPLES) EntryState.Open else EntryState.Done,
            sample = true,
        )
    }
}
