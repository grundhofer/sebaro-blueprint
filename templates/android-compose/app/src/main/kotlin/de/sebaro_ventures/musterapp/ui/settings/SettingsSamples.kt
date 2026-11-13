package de.sebaro_ventures.musterapp.ui.settings

import de.sebaro_ventures.design.SebaroTone
import de.sebaro_ventures.design.designsystem.SbThemeMode

/** Fixed states of the settings for the render test. Settings have no empty state. */
object SettingsSamples {
    /** The normal case: nothing changed yet. */
    val normal = SettingsUiState()

    /** Every setting changed. */
    val changed = SettingsUiState(SbThemeMode.Dark, SebaroTone.Warm, reduceMotion = true)

    /** A change did not reach the storage. */
    val saveFailed = normal.copy(saveFailed = true)
}
