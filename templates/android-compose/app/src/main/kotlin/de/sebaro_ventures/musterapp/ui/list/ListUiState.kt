package de.sebaro_ventures.musterapp.ui.list

import androidx.compose.runtime.Immutable
import de.sebaro_ventures.musterapp.domain.Entry

@Immutable
data class ListUiState(
    /** The entries that are not hidden and match [query], the newest first. */
    val entries: List<Entry>,
    val query: String = "",
    /** There is no entry at all, whatever the search says. */
    val none: Boolean = false,
    /** The entry hidden last, for as long as „Rückgängig“ is offered. */
    val hidden: Entry? = null,
    /** The last change did not reach the storage. */
    val saveFailed: Boolean = false,
)
