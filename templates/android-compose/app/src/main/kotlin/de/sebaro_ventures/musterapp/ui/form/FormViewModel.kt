package de.sebaro_ventures.musterapp.ui.form

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import de.sebaro_ventures.musterapp.data.EntryRepository
import de.sebaro_ventures.musterapp.data.trySave
import de.sebaro_ventures.musterapp.domain.Entry
import de.sebaro_ventures.musterapp.domain.NOTE_MAX
import de.sebaro_ventures.musterapp.domain.Priority
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.Clock
import java.time.LocalDate

private const val TITLE = "title"
private const val NOTE = "note"
private const val PRIORITY = "priority"

/**
 * The form for a new entry ([id] null) or a stored one. What the user types is a draft in [draft], laid over the
 * stored entry: it survives a rotation and the end of the process, and a field nobody touched shows what is stored.
 */
class FormViewModel(
    private val id: Long?,
    private val draft: SavedStateHandle,
    private val entries: EntryRepository,
    private val clock: Clock,
) : ViewModel() {
    private data class Progress(
        val titleMissing: Boolean = false,
        val refused: Int = 0,
        val askUnsaved: Boolean = false,
        val saveFailed: Boolean = false,
        val savedId: Long? = null,
    )

    private val stored: Flow<Entry?> = if (id == null) flowOf(null) else entries.entry(id)
    private val progress = MutableStateFlow(Progress())
    private var saving = false

    /** null until Room has answered for the first time. */
    val state: StateFlow<FormUiState?> = combine(
        stored,
        draft.getStateFlow<String?>(TITLE, null),
        draft.getStateFlow<String?>(NOTE, null),
        draft.getStateFlow<String?>(PRIORITY, null),
        progress,
    ) { entry, title, note, priority, progress ->
        val storedTitle = entry?.title.orEmpty()
        val storedNote = entry?.note.orEmpty()
        val storedPriority = entry?.priority ?: Priority.Normal
        val shownPriority = priority?.let(Priority::valueOf) ?: storedPriority
        val wordsChanged = (title ?: storedTitle) != storedTitle || (note ?: storedNote) != storedNote
        FormUiState(
            isNew = id == null,
            title = title ?: storedTitle,
            note = note ?: storedNote,
            priority = shownPriority,
            storedTitle = storedTitle,
            sample = entry?.sample == true && !wordsChanged,
            changed = wordsChanged || shownPriority != storedPriority,
            titleMissing = progress.titleMissing,
            refused = progress.refused,
            askUnsaved = progress.askUnsaved,
            saveFailed = progress.saveFailed,
            savedId = progress.savedId,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    fun onTitle(text: String) {
        draft[TITLE] = text
        progress.update { it.copy(titleMissing = false) }
    }

    fun onNote(text: String) {
        draft[NOTE] = text
    }

    fun onPriority(priority: Priority) {
        draft[PRIORITY] = priority.name
    }

    /** Closing with changes asks first. */
    fun onCloseAsked() {
        progress.update { it.copy(askUnsaved = true) }
    }

    fun onDialogDismiss() {
        progress.update { it.copy(askUnsaved = false) }
    }

    /** The primary action. It stays enabled: an empty title or a note that is too long refuses the save. */
    fun onSave() {
        val shown = state.value ?: return
        if (shown.title.isBlank() || shown.note.length > NOTE_MAX) {
            progress.update {
                it.copy(titleMissing = shown.title.isBlank(), refused = it.refused + 1, askUnsaved = false)
            }
        } else if (!saving) {
            saving = true
            viewModelScope.launch { store(shown.title.trim(), shown.note.trim(), shown.priority) }
        }
    }

    private suspend fun store(title: String, note: String, priority: Priority) {
        var savedId = id ?: 0
        val saved = trySave {
            if (id == null) {
                savedId = entries.add(Entry(title = title, note = note, priority = priority, created = today()))
            } else {
                entries.update(checkNotNull(stored.first()).edited(title, note, priority))
            }
        }
        saving = false
        progress.update { it.copy(askUnsaved = false, saveFailed = !saved, savedId = savedId.takeIf { saved }) }
    }

    private fun today(): LocalDate = LocalDate.now(clock)
}
