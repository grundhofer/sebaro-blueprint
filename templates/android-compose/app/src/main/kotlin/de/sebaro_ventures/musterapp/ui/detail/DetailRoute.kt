package de.sebaro_ventures.musterapp.ui.detail

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import de.sebaro_ventures.musterapp.ui.appViewModel

/** The sub-screen of the entry [id]. [onEdit] leads to its form; a deleted entry leads [onBack]. */
@Composable
fun DetailRoute(id: Long, onBack: () -> Unit, onEdit: () -> Unit) {
    val viewModel = appViewModel { c -> DetailViewModel(id, c.entries) }
    val state by viewModel.state.collectAsStateWithLifecycle()
    // local work shows nothing: no frame until Room has answered
    val shown = state ?: return
    if (shown.entry == null) {
        LaunchedEffect(Unit) { onBack() }
        return
    }
    DetailScreen(
        state = shown,
        onBack = onBack,
        onEdit = onEdit,
        onAsk = viewModel::onAsk,
        onDialogDismiss = viewModel::onDialogDismiss,
        onFinish = viewModel::onFinish,
        onDelete = viewModel::onDelete,
        onFailureSeen = viewModel::onFailureSeen,
    )
}
