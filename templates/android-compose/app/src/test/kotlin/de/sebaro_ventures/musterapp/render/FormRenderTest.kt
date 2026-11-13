package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import de.sebaro_ventures.musterapp.ui.form.FormSamples
import de.sebaro_ventures.musterapp.ui.form.FormScreen
import de.sebaro_ventures.musterapp.ui.form.FormUiState

class FormRenderTest : RenderTest() {
    override val screen = "form"
    override val states = mapOf<String, @Composable () -> Unit>(
        "new" to { Form(FormSamples.new) },
        "normal" to { Form(FormSamples.normal) },
        "title-missing" to { Form(FormSamples.titleMissing) },
        "long" to { Form(FormSamples.long) },
        "ask-unsaved" to { Form(FormSamples.askUnsaved) },
        "save-failed" to { Form(FormSamples.saveFailed) },
    )
}

@Composable
private fun Form(state: FormUiState) {
    FormScreen(
        state = state,
        onTitle = {},
        onNote = {},
        onPriority = {},
        onSave = {},
        onClose = {},
        onDiscard = {},
        onDialogDismiss = {},
    )
}
