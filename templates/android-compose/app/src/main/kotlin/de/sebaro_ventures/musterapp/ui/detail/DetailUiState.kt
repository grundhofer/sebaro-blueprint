package de.sebaro_ventures.musterapp.ui.detail

import androidx.compose.runtime.Immutable
import de.sebaro_ventures.musterapp.domain.Entry

/** The question before a step that cannot be undone. */
enum class DetailDialog { Finish, Delete }

@Immutable
data class DetailUiState(
    /** null: the entry does not exist any more; the route goes back. */
    val entry: Entry?,
    /** The question that is open. */
    val dialog: DetailDialog? = null,
    /** The last change did not reach the storage. */
    val saveFailed: Boolean = false,
)
