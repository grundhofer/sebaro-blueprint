package de.sebaro_ventures.musterapp.ui.list

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import de.sebaro_ventures.musterapp.data.EntryRepository
import de.sebaro_ventures.musterapp.data.trySave
import de.sebaro_ventures.musterapp.domain.Entry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

private const val QUERY = "query"

/** The list of entries with its search. The search text is a draft and lives in [savedState]. */
class ListViewModel(
    private val savedState: SavedStateHandle,
    private val entries: EntryRepository,
) : ViewModel() {
    private val hidden = MutableStateFlow<Entry?>(null)
    private val saveFailed = MutableStateFlow(false)

    /** null until Room has answered for the first time. */
    val state: StateFlow<ListUiState?> =
        combine(entries.entries, savedState.getStateFlow(QUERY, ""), hidden, saveFailed) { all, query, hidden, failed ->
            val visible = all.filterNot { it.hidden }
            val word = query.trim()
            ListUiState(
                entries = visible.filter {
                    it.title.contains(word, ignoreCase = true) || it.note.contains(word, ignoreCase = true)
                },
                query = query,
                none = visible.isEmpty(),
                hidden = hidden,
                saveFailed = failed,
            )
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    fun onQuery(text: String) {
        savedState[QUERY] = text
    }

    fun onHide(entry: Entry) {
        viewModelScope.launch {
            val saved = trySave { entries.update(entry.copy(hidden = true)) }
            hidden.value = entry.takeIf { saved }
            saveFailed.value = !saved
        }
    }

    /** „Rückgängig“ in the toast: the entry hidden last is back. */
    fun onUndoHide() {
        val entry = hidden.value ?: return
        viewModelScope.launch {
            val saved = trySave { entries.update(entry) }
            if (saved) hidden.value = null
            saveFailed.value = !saved
        }
    }

    fun onFailureSeen() {
        saveFailed.value = false
    }
}
