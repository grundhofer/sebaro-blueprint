package de.sebaro_ventures.musterapp.domain

import java.time.LocalDate

/** The longest note an entry takes. */
const val NOTE_MAX = 500

// The database stores both enums by the name of their entries: never rename one.

enum class EntryState { Open, Done }

enum class Priority { Low, Normal, High }

/**
 * One entry of the list. A [EntryState.Done] entry is finished for good and can no longer be edited. [sample] marks
 * an invented entry the app wrote at its first start; the screens show „Beispieldaten“ on it. [id] 0 is an entry that
 * is not stored yet.
 */
data class Entry(
    val id: Long = 0,
    val title: String,
    val note: String = "",
    val priority: Priority = Priority.Normal,
    val created: LocalDate,
    val state: EntryState = EntryState.Open,
    val hidden: Boolean = false,
    val sample: Boolean = false,
) {
    /** The entry with new words. A sample whose title or note changes belongs to the user from then on. */
    fun edited(title: String, note: String, priority: Priority): Entry = copy(
        title = title,
        note = note,
        priority = priority,
        sample = sample && title == this.title && note == this.note,
    )
}
