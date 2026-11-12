package de.sebaro_ventures.musterapp.ui.list

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.createSavedStateHandle
import de.sebaro_ventures.musterapp.ui.appViewModel

/** The top-level place „Einträge“. [onOpen] leads to an entry's detail, [onCreate] to the form for a new one. */
@Composable
fun ListRoute(onOpen: (Long) -> Unit, onCreate: () -> Unit, navigation: @Composable () -> Unit) {
    val viewModel = appViewModel { c -> ListViewModel(createSavedStateHandle(), c.entries) }
    val state by viewModel.state.collectAsStateWithLifecycle()
    ListScreen(
        // local work shows nothing: no frame until Room has answered
        state = state ?: return,
        onQuery = viewModel::onQuery,
        onOpen = onOpen,
        onCreate = onCreate,
        onHide = viewModel::onHide,
        onUndoHide = viewModel::onUndoHide,
        onFailureSeen = viewModel::onFailureSeen,
        navigation = navigation,
    )
}
