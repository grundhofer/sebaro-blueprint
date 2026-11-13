package de.sebaro_ventures.musterapp.render

import androidx.compose.runtime.Composable
import de.sebaro_ventures.musterapp.ui.MusterappNavigation
import de.sebaro_ventures.musterapp.ui.settings.SettingsSamples
import de.sebaro_ventures.musterapp.ui.settings.SettingsScreen
import de.sebaro_ventures.musterapp.ui.settings.SettingsUiState

class SettingsRenderTest : RenderTest() {
    override val screen = "settings"
    override val states = mapOf<String, @Composable () -> Unit>(
        "normal" to { Settings(SettingsSamples.normal) },
        "changed" to { Settings(SettingsSamples.changed) },
        "save-failed" to { Settings(SettingsSamples.saveFailed) },
    )
}

@Composable
private fun Settings(state: SettingsUiState) {
    SettingsScreen(
        state = state,
        onMode = {},
        onTone = {},
        onReduceMotion = {},
        onFailureSeen = {},
        navigation = { MusterappNavigation(selected = 2, onSelect = {}) },
    )
}
