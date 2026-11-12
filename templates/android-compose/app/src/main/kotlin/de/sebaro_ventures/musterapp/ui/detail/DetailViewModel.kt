package de.sebaro_ventures.musterapp.ui.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import de.sebaro_ventures.musterapp.data.EntryRepository
import de.sebaro_ventures.musterapp.data.trySave
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.EntryState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/** One entry and its two final steps. Both ask first; the question is state here, so a rotation keeps it. */
class DetailViewModel(
    private val id: Long,
    private val entries: EntryRepository,
) : ViewModel() {
    private val dialog = MutableStateFlow<DetailDialog?>(null)
    private val saveFailed = MutableStateFlow(false)

    /** null until Room has answered for the first time. */
    val state: StateFlow<DetailUiState?> = combine(entries.entry(id), dialog, saveFailed, ::DetailUiState)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    fun onAsk(question: DetailDialog) {
        dialog.value = question
    }

    fun onDialogDismiss() {
        dialog.value = null
    }

    /** „Abschließen“: the entry is done for good. */
    fun onFinish() = write { entries.update(it.copy(state = EntryState.Done)) }

    /** „Löschen“: the entry is gone, [state] then holds no entry. */
    fun onDelete() = write { entries.delete(it.id) }

    fun onFailureSeen() {
        saveFailed.value = false
    }

    private fun write(change: suspend (Entry) -> Unit) {
        val entry = state.value?.entry ?: return
        dialog.value = null
        viewModelScope.launch { saveFailed.value = !trySave { change(entry) } }
    }
}
