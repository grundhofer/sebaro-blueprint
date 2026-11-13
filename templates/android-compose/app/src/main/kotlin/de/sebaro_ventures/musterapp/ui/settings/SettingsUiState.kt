package de.sebaro_ventures.musterapp.ui.settings

import androidx.compose.runtime.Immutable
import de.sebaro_ventures.design.SebaroTone
import de.sebaro_ventures.design.designsystem.SbThemeMode

@Immutable
data class SettingsUiState(
    val mode: SbThemeMode = SbThemeMode.System,
    val tone: SebaroTone = SebaroTone.Cool,
    val reduceMotion: Boolean = false,
    /** The last change did not reach the storage: the rows show what is stored. */
    val saveFailed: Boolean = false,
)
