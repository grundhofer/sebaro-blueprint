package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import de.sebaro_ventures.musterapp.ui.MusterappStart

/** The start is no screen with a state of its own; it is drawn as it covers the app, before it fades. */
class StartRenderTest : RenderTest() {
    override val screen = "start"
    override val states = mapOf<String, @Composable () -> Unit>(
        "covering" to { MusterappStart(ready = false) },
    )
}
