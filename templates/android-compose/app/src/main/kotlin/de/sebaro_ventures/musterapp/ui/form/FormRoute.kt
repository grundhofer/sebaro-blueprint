package de.sebaro_ventures.musterapp.ui.form

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.createSavedStateHandle
import de.sebaro_ventures.musterapp.ui.appViewModel

/**
 * The sub-screen for a new entry ([id] null) or the entry [id]. [onSaved] gets the id of the stored entry,
 * [onClose] leaves without saving.
 */
@Composable
fun FormRoute(id: Long?, onClose: () -> Unit, onSaved: (Long) -> Unit) {
    val viewModel = appViewModel { c -> FormViewModel(id, createSavedStateHandle(), c.entries, c.clock) }
    val state by viewModel.state.collectAsStateWithLifecycle()
    // local work shows nothing: no frame until Room has answered
    val shown = state ?: return
    val saved by rememberUpdatedState(onSaved)
    LaunchedEffect(shown.savedId) { shown.savedId?.let { saved(it) } }
    FormScreen(
        state = shown,
        onTitle = viewModel::onTitle,
        onNote = viewModel::onNote,
        onPriority = viewModel::onPriority,
        onSave = viewModel::onSave,
        onClose = { if (shown.changed) viewModel.onCloseAsked() else onClose() },
        onDiscard = onClose,
        onDialogDismiss = viewModel::onDialogDismiss,
    )
}
