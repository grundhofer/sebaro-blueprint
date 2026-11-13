package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import de.sebaro_ventures.musterapp.ui.detail.DetailSamples
import de.sebaro_ventures.musterapp.ui.detail.DetailScreen
import de.sebaro_ventures.musterapp.ui.detail.DetailUiState

class DetailRenderTest : RenderTest() {
    override val screen = "detail"
    override val states = mapOf<String, @Composable () -> Unit>(
        "normal" to { Detail(DetailSamples.normal) },
        "done" to { Detail(DetailSamples.done) },
        "long" to { Detail(DetailSamples.long) },
        "ask-finish" to { Detail(DetailSamples.askFinish) },
        "ask-delete" to { Detail(DetailSamples.askDelete) },
        "save-failed" to { Detail(DetailSamples.saveFailed) },
    )
}

@Composable
private fun Detail(state: DetailUiState) {
    DetailScreen(
        state = state,
        onBack = {},
        onEdit = {},
        onAsk = {},
        onDialogDismiss = {},
        onFinish = {},
        onDelete = {},
        onFailureSeen = {},
    )
}
