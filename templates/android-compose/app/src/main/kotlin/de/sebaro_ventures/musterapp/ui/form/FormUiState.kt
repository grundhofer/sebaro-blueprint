package de.sebaro_ventures.musterapp.ui.form

import androidx.compose.runtime.Immutable
import de.sebaro_ventures.musterapp.domain.Priority

@Immutable
data class FormUiState(
    /** A new entry; false: a stored one is edited. */
    val isNew: Boolean,
    val title: String = "",
    val note: String = "",
    val priority: Priority = Priority.Normal,
    /** The title as it is stored, for the question about unsaved changes. */
    val storedTitle: String = "",
    /** The entry is an invented sample and its words are still the sample's. */
    val sample: Boolean = false,
    /** Something differs from what is stored. */
    val changed: Boolean = false,
    /** A save was refused because the title is empty. */
    val titleMissing: Boolean = false,
    /** Counts every refused save: the screen then moves the focus to the first field with an error. */
    val refused: Int = 0,
    /** The question about unsaved changes is open. */
    val askUnsaved: Boolean = false,
    /** The save did not reach the storage. */
    val saveFailed: Boolean = false,
    /** The id of the stored entry once the save went through: the route leaves the form. */
    val savedId: Long? = null,
)
