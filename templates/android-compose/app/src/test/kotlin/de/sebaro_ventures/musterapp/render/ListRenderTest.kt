package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import de.sebaro_ventures.musterapp.ui.MusterappNavigation
import de.sebaro_ventures.musterapp.ui.list.ListSamples
import de.sebaro_ventures.musterapp.ui.list.ListScreen
import de.sebaro_ventures.musterapp.ui.list.ListUiState

class ListRenderTest : RenderTest() {
    override val screen = "list"
    override val states = mapOf<String, @Composable () -> Unit>(
        "normal" to { List(ListSamples.normal) },
        "empty" to { List(ListSamples.empty) },
        "no-hit" to { List(ListSamples.noHit) },
        "hidden" to { List(ListSamples.hidden) },
        "long" to { List(ListSamples.long) },
        "save-failed" to { List(ListSamples.saveFailed) },
    )
}

@Composable
private fun List(state: ListUiState) {
    ListScreen(
        state = state,
        onQuery = {},
        onOpen = {},
        onCreate = {},
        onHide = {},
        onUndoHide = {},
        onFailureSeen = {},
        navigation = { MusterappNavigation(selected = 0, onSelect = {}) },
    )
}
