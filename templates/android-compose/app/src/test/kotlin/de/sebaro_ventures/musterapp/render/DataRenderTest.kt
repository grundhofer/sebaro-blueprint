package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import de.sebaro_ventures.musterapp.ui.MusterappNavigation
import de.sebaro_ventures.musterapp.ui.data.DataSamples
import de.sebaro_ventures.musterapp.ui.data.DataScreen
import de.sebaro_ventures.musterapp.ui.data.DataUiState
import org.robolectric.annotation.Config

/** The data screen is drawn in full length, so every part of it can be looked at. */
@Config(qualifiers = "de-rDE-w360dp-h4400dp-xhdpi")
class DataRenderTest : RenderTest() {
    override val screen = "data"
    override val states = mapOf<String, @Composable () -> Unit>(
        "normal" to { Data(DataSamples.normal) },
        "large" to { Data(DataSamples.large) },
    )
}

@Composable
private fun Data(state: DataUiState) {
    DataScreen(state = state, navigation = { MusterappNavigation(selected = 1, onSelect = {}) })
}
