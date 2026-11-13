package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import de.sebaro_ventures.musterapp.ui.about.AboutSamples
import de.sebaro_ventures.musterapp.ui.about.AboutScreen

class AboutRenderTest : RenderTest() {
    override val screen = "about"
    override val states = mapOf<String, @Composable () -> Unit>(
        "normal" to { AboutScreen(state = AboutSamples.normal, onBack = {}) },
    )
}
